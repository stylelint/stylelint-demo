import React from "react";
import PropTypes from "prop-types";

import styles from "./index.css";

const syntaxes = [
  {
    name: "CSS",
    id: "css"
  },
  {
    name: "SCSS",
    id: "scss"
  },
  {
    name: "Sass",
    id: "sass"
  },
  {
    name: "Less",
    id: "less"
  },
  {
    name: "SugarSS",
    id: "sugarss"
  },
  {
    name: "HTML",
    id: "html"
  },
  {
    name: "JSX",
    id: "jsx"
  },
  {
    name: "Markdown",
    id: "markdown"
  },
  {
    name: "Styled",
    id: "styled"
  }
];

const SyntaxSelect = ({ selectedSyntax, onSyntaxChange }) => {
  return (
    <select
      className={styles.syntax}
      onChange={e => {
        onSyntaxChange(e.target.value);
      }}
      value={selectedSyntax}
    >
      {syntaxes.map(syntax => (
        <option key={syntax.id} value={syntax.id}>
          {syntax.name}
        </option>
      ))}
    </select>
  );
};

SyntaxSelect.propTypes = {
  onSyntaxChange: PropTypes.func.isRequired,
  selectedSyntax: PropTypes.string.isRequired
};

export default SyntaxSelect;
