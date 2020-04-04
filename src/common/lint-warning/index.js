import PropTypes from "prop-types";
import React from "react";

import SeverityLabel from "../severity-label";

import styles from "./index.css";

const LintWarning = ({ line, column, text, rule, severity }) => {
  const location = `${line}:${column}`;
  const warningText = text.replace(`(${rule})`, "");
  const url = `http://stylelint.io/user-guide/rules/${rule}/`;

  return (
    <div className={styles.result}>
      <span className={styles.location}> {location} </span>
      <SeverityLabel severity={severity} />
      <span className={styles.message}>
        {warningText}
        {rule ? (
          <span className={styles.ruleName}>
            {"("}
            <a
              className={styles.ruleLink}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {rule}
            </a>
            {")"}
          </span>
        ) : null}
      </span>
    </div>
  );
};

LintWarning.propTypes = {
  line: PropTypes.number.isRequired,
  column: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  rule: PropTypes.string,
  severity: PropTypes.string.isRequired,
};

export default LintWarning;
