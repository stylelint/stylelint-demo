/* global fetch:false */
import React, { useState, useEffect } from "react";
import Linter from "../linter";
import recommendedConfig from "stylelint-config-recommended";
import standardConfig from "stylelint-config-standard";
import "whatwg-fetch";
import { useDebouncedCallback } from "use-debounce";

const defaultCSS = "a {color: #FFF; }\n";
const defaultConfig = {
  rules: Object.assign(recommendedConfig.rules, standardConfig.rules)
};

export default function Root() {
  const [code, setCode] = useState(defaultCSS);
  const [config, setConfig] = useState(JSON.stringify(defaultConfig, null, 2));
  const [syntax, setSyntax] = useState("css");
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState(false);

  function lint() {
    fetch("/lint", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code,
        config,
        syntax
      })
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setWarnings(data.warnings);
          setError(false);
        }
      })
      .catch(error => {
        setError(`Unable to lint CSS: \n\n ${error}`);
      });
  }

  const [debouncedLint] = useDebouncedCallback(() => {
    lint();
  }, 250);

  useEffect(() => {
    debouncedLint();
  }, [code, config, syntax]);

  return (
    <Linter
      onCodeChange={input => {
        setCode(input);
      }}
      onConfigChange={input => {
        setConfig(input);
      }}
      onSyntaxChange={setSyntax}
      code={code}
      config={config}
      syntax={syntax}
      warnings={warnings}
      error={error}
    />
  );
}
