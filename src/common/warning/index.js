import PropTypes from "prop-types"
import React from "react"
import cx from "classnames"

import styles from "./index.css"

const Warning = ({
  line,
  column,
  text,
  rule,
  severity,
}) => {
  const id = `${line}${column}${text}`
  const location = `${line}:${column}`
  const warningText = text.replace(`(${rule})`, "")
  const url = `http://stylelint.io/user-guide/rules/${rule}/`
  const severityClassName = cx("", {
    [styles.errorSeverity]: severity === "error",
    [styles.warningSeverity]: severity === "warning",
    [styles.severity]: severity !== "warning" && severity !== "error",
  })

  return (
    <li className={ styles.result } key={ id }>
      <span className={ styles.location }> { location } </span>
      <span className={ severityClassName }> { severity } </span>
      <span className={ styles.message }>
        { warningText }
        <span className={ styles.ruleName }>
          { "(" }
            <a className={ styles.ruleLink } href={ url } target="_blank" rel="noopener noreferrer">
              { rule }
            </a>
          { ")" }
        </span>
      </span>
    </li>
  )
}

Warning.propTypes = {
  line: PropTypes.number.isRequired,
  column: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  rule: PropTypes.string.isRequired,
  severity: PropTypes.string.isRequired,
}

export default Warning
