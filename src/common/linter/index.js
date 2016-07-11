import React, { PropTypes } from "react"
import WarningList from "../warning-list/"
import brace from "brace" // eslint-disable-line no-unused-vars
import AceEditor from "react-ace"

import "brace/mode/json"
import "brace/mode/css"
import "brace/theme/github"
import "brace/ext/language_tools"

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
      <div className={styles.codeInput}>
        <AceEditor
          mode="css"
          theme="github"
          name="code"
          tabSize={2}
          value={ code }
          height="100%"
          width="100%"
          maxLines={Infinity}
          minLines={15}
          onChange={onCodeChange}
          onLoad={(editor) => {
            editor.focus()
            // disable Ace's built in syntax checking
            editor.getSession().setUseWorker(false)
          }}
          editorProps={{
            $blockScrolling: true,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
          }}
        />
      </div>
      <div className={ styles.output }>
        { error ? errorOutput : warningOutput }
      </div>
      <div className={styles.configInput}>
        <AceEditor
          mode="json"
          theme="github"
          name="config"
          tabSize={2}
          value={ config }
          height="100%"
          width="100%"
          maxLines={Infinity}
          minLines={5}
          onChange={onConfigChange}
          editorProps={{ $blockScrolling: true }}
        />
      </div>
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
