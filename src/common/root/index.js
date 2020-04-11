/* global fetch:false */
/* global window:true */
import React, { useState, useEffect } from 'react';
import Linter from '../linter';
import recommendedConfig from 'stylelint-config-recommended';
import standardConfig from 'stylelint-config-standard';
import { compress, decompress } from '../utils';
import 'whatwg-fetch';
import { useDebouncedCallback } from 'use-debounce';

const inputDelayMs = 250;
const defaultCSS = 'a {color: #FFF; }\n';
const defaultSyntax = 'css';
const defaultConfig = {
	rules: Object.assign(recommendedConfig.rules, standardConfig.rules),
};

const hashData = window.location.hash.slice(window.location.hash.indexOf('#') + 1);
const { code: codeQueryParam, syntax: syntaxQueryParam, config: configQueryParam } = decompress(
	hashData,
);

export default function Root() {
	const [code, setCode] = useState(codeQueryParam || defaultCSS);
	const [config, setConfig] = useState(
		configQueryParam ? configQueryParam : JSON.stringify(defaultConfig, null, 2),
	);
	const [syntax, setSyntax] = useState(syntaxQueryParam || defaultSyntax);
	const [invalidOptionWarnings, setInvalidOptionWarnings] = useState([]);
	const [parseErrors, setParseErrors] = useState([]);
	const [warnings, setWarnings] = useState([]);
	const [error, setError] = useState(false);

	function lint() {
		fetch('/lint', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				code,
				config,
				syntax,
			}),
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				if (data.error) {
					setError(data.error);

					return;
				}

				if (data.invalidOptionWarnings) {
					setInvalidOptionWarnings(data.invalidOptionWarnings);
				}

				if (data.parseErrors) {
					setParseErrors(data.parseErrors);
				}

				if (data.warnings) {
					setWarnings(data.warnings);
				}

				setError(false);
			})
			.catch((error) => {
				setError(`Unable to lint CSS: \n\n ${error}`);
			});
	}

	const [debouncedLint] = useDebouncedCallback(() => {
		lint();
		const query = compress({ code, syntax, config });

		window.location.hash = query;

		if (window.parent) {
			window.parent.postMessage(query, '*');
		}
	}, inputDelayMs);

	useEffect(() => {
		debouncedLint();
	}, [code, config, syntax]);

	return (
		<Linter
			onCodeChange={(input) => {
				setCode(input);
			}}
			onConfigChange={(input) => {
				setConfig(input);
			}}
			onSyntaxChange={setSyntax}
			code={code}
			config={config}
			syntax={syntax}
			invalidOptionWarnings={invalidOptionWarnings}
			parseErrors={parseErrors}
			warnings={warnings}
			error={error}
		/>
	);
}
