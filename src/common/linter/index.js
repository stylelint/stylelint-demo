import React, { Component } from "react"
import Codemirror from "react-codemirror"
import 'whatwg-fetch'
import LintWarnings from "../lint-warnings/"
import debounce from "lodash.debounce"
import standardConfig from "stylelint-config-standard"

import "codemirror/mode/css/css"
import "codemirror/mode/javascript/javascript"

// leading ! disables existing webpack config. See explanation at:
// https://github.com/webpack/css-loader/issues/80#issuecomment-214222195
import "!style!css!./codemirror.css"
import styles from "./index.css"

export default class Linter extends Component {
  constructor(props) {
    super(props)
    this.codeMirrorRefs = []
    this.state = {
      config: JSON.stringify(standardConfig, null, 2),
      code: "a {color: #FFF; }",
      error: false,
      warnings: [],
    }
    this.lint = debounce(this.lint, 250)

    this.handleCode = this.handleCode.bind(this)
    this.handleConfig = this.handleConfig.bind(this)
    this.lint = this.lint.bind(this)
    // this.parseConfig = this.parseConfig.bind(this)
  }

  componentDidMount() {
    this.lint()
  }

  lint() {
    const checkStatus = (response) => {
      if (response.status >= 200 && response.status < 300) {
        return response
      } else {
        var error = new Error(response.statusText)
        error.response = response
        throw error
      }
    }

    const parseJSON = (response) => {
      return response.json()
    }

    fetch(
      '/lint',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: this.state.code,
          config: this.state.config
        })
      }
    )
    .then(checkStatus)
    .then(parseJSON)
    .then(data => {
      this.setState({
        warnings: data.warnings,
        error: false
      })
    }).catch(error => {
      this.setState({
        error: `Unable to lint CSS: \n\n ${error}`
      })
      console.log('request failed', error)
    })
  }

  handleCode(code) {
    this.setState({
      code,
    }, this.lint)
  }

  handleConfig(config) {
    this.setState({
      config,
    }, this.lint)
  }

  render() {
    const error = (
      <div className={ styles.console }>
        { this.state.error }
      </div>
    )

    const warnings = (
      <div className={ styles.results }>
        <LintWarnings warnings={ this.state.warnings } />
      </div>
    )

    return (
      <div className={ styles.root }>
        <Codemirror
          ref={ ref => this.codeMirrorRefs[0] = ref }
          name={ "code" }
          className={ styles.input }
          value={ this.state.code }
          onChange={ this.handleCode }
          options={ {
            mode: "css",
            theme: "eclipse",
            lineNumbers: true,
          } }
        />
        <output className={ styles.output }>
          { this.state.error.length > 0 ? error : warnings }
        </output>
        <Codemirror
          ref={ ref => this.codeMirrorRefs[1] = ref }
          name={ "config" }
          className={ styles.input }
          value={ this.state.config }
          onChange={ this.handleConfig }
          options={ {
            mode: { name: "javascript", json: true },
            theme: "eclipse",
            lineNumbers: true,
          } }
        />
      </div>
    )
  }
}
