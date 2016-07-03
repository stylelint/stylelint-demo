import React, { Component } from "react"
import debounce from "lodash.debounce"
import Linter from "../linter"
import standardConfig from "stylelint-config-standard"
import "whatwg-fetch"

export default class Root extends Component {
  constructor(props) {
    super(props)
    this.state = {
      code: "a {color: #FFF; }",
      config: JSON.stringify(standardConfig, null, 2),
      warnings: [],
      error: false,
    }
    this.lint = debounce(this.lint, 250)
    this.lint = this.lint.bind(this)
    this.onCodeChange = this.onCodeChange.bind(this)
    this.onConfigChange = this.onConfigChange.bind(this)
  }

  componentDidMount() {
    this.lint()
  }

  checkResponseStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response
    }
    const error = new Error(response.statusText)
    error.response = response
    throw error
  }

  lint() {
    fetch(
      "/lint",
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: this.state.code,
          config: this.state.config,
        }),
      }
    )
    .then(this.checkResponseStatus)
    .then(response => { return response.json() })
    .then(data => {
      this.setState({
        warnings: data.warnings,
        error: false,
      })
    }).catch(error => {
      this.setState({
        error: `Unable to lint CSS: \n\n ${error}`,
      })
    })
  }

  onCodeChange(code) {
    this.setState({
      code,
    }, this.lint)
  }

  onConfigChange(config) {
    this.setState({
      config,
    }, this.lint)
  }

  render() {
    return <Linter
      onCodeChange={this.onCodeChange}
      onConfigChange={this.onConfigChange}
      code={this.state.code}
      config={this.state.config}
      warnings={this.state.warnings}
      error={this.state.error}
    />
  }
}
