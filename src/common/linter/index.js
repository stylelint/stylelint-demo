import PropTypes from "prop-types";
import React from "react";
import WarningList from "../warning-list/";
import SyntaxSelect from "../syntax-select";
import brace from "brace"; // eslint-disable-line no-unused-vars
import AceEditor from "react-ace";

import "brace/mode/json";
import "brace/mode/css";
import "brace/theme/github";
import "brace/ext/language_tools";

import styles from "./index.css";

const Linter = ({
  onCodeChange,
  onConfigChange,
  onSyntaxChange,
  code,
  config,
  syntax,
  warnings,
  error
}) => {
  const errorOutput = <div className={styles.error}>{error}</div>;

  const warningOutput = (
    <div className={styles.results}>
      <WarningList warnings={warnings} />
    </div>
  );

  return (
    <div className={styles.root}>
      <div className={styles.codeInput}>
        <span className={styles.caption}>
          <SyntaxSelect
            selectedSyntax={syntax}
            onSyntaxChange={onSyntaxChange}
          />

          {"input"}
        </span>

        <AceEditor
          mode="css"
          theme="github"
          name="code"
          tabSize={2}
          value={code}
          height="100%"
          width="100%"
          maxLines={Infinity}
          minLines={15}
          showPrintMargin={false}
          onChange={onCodeChange}
          onLoad={editor => {
            editor.focus();
            // disable Ace's built in syntax checking
            editor.getSession().setUseWorker(false);
          }}
          editorProps={{
            $blockScrolling: true,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
          }}
        />
      </div>

      <div className={styles.output}>
        <span className={styles.caption}>{"Result"}</span>

        {error ? errorOutput : warningOutput}
      </div>

      <div className={styles.configInput}>
        <span className={styles.caption}>{"Config input"}</span>

        <AceEditor
          mode="json"
          theme="github"
          name="config"
          tabSize={2}
          value={config}
          height="100%"
          width="100%"
          maxLines={Infinity}
          minLines={5}
          showPrintMargin={false}
          onChange={onConfigChange}
          editorProps={{ $blockScrolling: true }}
        />
      </div>
    </div>
  );
};

Linter.propTypes = {
  onCodeChange: PropTypes.func.isRequired,
  onConfigChange: PropTypes.func.isRequired,
  onSyntaxChange: PropTypes.any,
  code: PropTypes.string.isRequired,
  config: PropTypes.string.isRequired,
  syntax: PropTypes.any,
  warnings: PropTypes.array.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired
};

export default Linter;
