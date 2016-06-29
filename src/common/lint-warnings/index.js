import React, { Component, PropTypes } from "react"
import cx from "classnames"
import Warning from '../warning'

import styles from "./index.css"

export default class LintWarnings extends Component {
  render() {
    return (
      <ul className={ styles.root }> {
        this.props.warnings.map(w => {
          return <Warning
            key={`${w.line}${w.column}${w.rule}`}
            line={w.line}
            column={w.column}
            text={w.text}
            rule={w.rule}
            severity={w.severity}
          ></Warning>
        })
      } </ul>
    )
  }
}

LintWarnings.propTypes = {
  warnings: PropTypes.array.isRequired,
}
