import React from "react"
import Codemirror from "react-codemirror"
import WarningList from "../warning-list/"
import "codemirror/mode/css/css"
import "codemirror/mode/javascript/javascript"

import "./codemirror.css"
import {
  errorConsole,
  results,
  root,
  input
} from "./index.css"

const Linter = ({
  onCodeChange,
  onConfigChange,
  code,
  config,
  warnings,
  error
}) => {
  const errorOutput = (
    <div className={ errorConsole }>
      { error }
    </div>
  )

  const warningOutput = (
    <div className={ results }>
      <WarningList warnings={ warnings } />
    </div>
  )

  return (
    <div className={ root }>
      <Codemirror
        name={ "code" }
        className={ input }
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
        className={ input }
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

// Linter.propTypes = {
//
// }

export default Linter
