import React, { PropTypes } from "react"
import Warning from "../warning"

import styles from "./index.css"

const WarningList = ({
  warnings,
}) => {
  return (
    <ul className={ styles.root }> {
      warnings.map(w => {
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

WarningList.propTypes = {
  warnings: PropTypes.array.isRequired,
}

export default WarningList
