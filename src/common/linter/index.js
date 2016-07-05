import React, { PropTypes } from "react"
import Codemirror from "react-codemirror"
import WarningList from "../warning-list/"
import "codemirror/mode/css/css"
import "codemirror/mode/javascript/javascript"

import "./codemirror.css"
import styles from "./index.css"

const Linter = ({
  onCodeChange,
  onConfigChange,
  code,
  config,
  warnings,
  error,
}) => {
  const errorOutput = (
    <div className={ styles.errorConsole }>
      { error }
    </div>
  )

  const warningOutput = (
    <div className={ styles.results }>
      <WarningList warnings={ warnings } />
    </div>
  )

  return (
    <div className={ styles.root }>
      <Codemirror
        name={ "code" }
        className={ styles.input }
        value={ code }
        onChange={ onCodeChange }
        options={ {
          mode: "css",
          theme: "eclipse",
          lineNumbers: true,
        } }
      />
      { error ? errorOutput : warningOutput }
      <Codemirror
        name={ "config" }
        className={ styles.input }
        value={ config }
        onChange={ onConfigChange }
        options={ {
          mode: { name: "javascript", json: true },
          theme: "eclipse",
          lineNumbers: true,
        } }
      />
    </div>
  )
}

Linter.propTypes = {
  onCodeChange: PropTypes.func.isRequired,
  onConfigChange: PropTypes.func.isRequired,
  code: PropTypes.string.isRequired,
  config: PropTypes.string.isRequired,
  warnings: PropTypes.array.isRequired,
  error: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.bool,
  ]).isRequired,
}

export default Linter
