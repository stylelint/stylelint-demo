import React, { PropTypes } from "react"
import cx from "classnames"

import {
  root,
  result,
  location,
  severity,
  errorSeverity,
  warningSeverity,
  message,
  ruleName,
  ruleLink
} from "./index.css"

const Warning = ({
  line,
  column,
  text,
  rule,
  severity
}) => {
  const id = `${line}${column}${text}`
  const location = `${line}:${column}`
  const severityClassName = cx("", {
    [errorSeverity]: severity === "error",
    [warningSeverity]: severity === "warning",
  })
  const warningText = text.replace(`(${rule})`, "")
  const url = `/user-guide/rules/${rule}/`

  return (
    <li className={ result } key={ id }>
      <span className={ location }> { location } </span>
      <span className={ severityClassName }> { severity } </span>
      <span className={ message }>
        { warningText }
        <span className={ ruleName }>
          { "(" }
            <a className={ ruleLink } href={ url } >
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
  severity: PropTypes.string.isRequired
}

export default Warning
