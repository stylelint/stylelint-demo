import PropTypes from "prop-types";
import React from "react";

import LintWarning from "../lint-warning";
import SeverityLabel from "../severity-label";

import styles from "./index.css";

const WarningList = ({ invalidOptionWarnings, warnings }) => {
  let messages;

  if (invalidOptionWarnings.length && warnings.length === 0) {
    messages = <li className={styles.success}>✔ No warnings</li>;
  } else {
    messages = invalidOptionWarnings.map(io => {
      return (
        <li key={io.text} className={styles.item}>
          <SeverityLabel severity="invalid option" />
          {io.text}
        </li>
      );
    });
    messages = messages.concat(
      warnings.map(w => {
        return (
          <li key={`${w.line}${w.column}${w.rule}`} className={styles.item}>
            <LintWarning
              line={w.line}
              column={w.column}
              text={w.text}
              rule={w.rule}
              severity={w.severity}
            />
          </li>
        );
      })
    );
  }

  return <ul className={styles.root}> {messages} </ul>;
};

WarningList.propTypes = {
  invalidOptionWarnings: PropTypes.array.isRequired,
  warnings: PropTypes.array.isRequired
};

export default WarningList;
