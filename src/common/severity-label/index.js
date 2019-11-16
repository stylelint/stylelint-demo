import PropTypes from "prop-types";
import React from "react";
import cx from "classnames";

import styles from "./index.css";

const SeverityLabel = ({ severity }) => {
  const severityClassName = cx("", {
    [styles.errorSeverity]: severity === "error" || "invalid option",
    [styles.warningSeverity]: severity === "warning",
    [styles.severity]: severity !== "warning" && severity !== "error"
  });

  return <span className={severityClassName}> {severity} </span>;
};

SeverityLabel.propTypes = {
  severity: PropTypes.string.isRequired
};

export default SeverityLabel;
