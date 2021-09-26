import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';

import { highlight, languages } from 'prismjs/components/prism-core';
import Editor from 'react-simple-code-editor';
import PropTypes from 'prop-types';
import React from 'react';

import SyntaxSelect from '../syntax-select';
import WarningList from '../warning-list/';

import styles from './index.css';

function hightlightWithLineNumbers(input, language) {
	return highlight(input, language)
		.split('\n')
		.map((line) => `<span class=${styles.editorLineNumber}></span>${line}`)
		.join('\n');
}

const Linter = ({
	onCodeChange,
	onConfigChange,
	onSyntaxChange,
	code,
	config,
	syntax,
	invalidOptionWarnings,
	parseErrors,
	warnings,
	error,
}) => {
	const errorOutput = <div className={styles.error}>{error}</div>;

	const warningOutput = (
		<div className={styles.results}>
			<WarningList
				invalidOptionWarnings={invalidOptionWarnings}
				parseErrors={parseErrors}
				warnings={warnings}
			/>
		</div>
	);

	return (
		<div className={styles.root}>
			<div className={styles.codeInput}>
				<span className={styles.caption}>
					<SyntaxSelect selectedSyntax={syntax} onSyntaxChange={onSyntaxChange} />

					{'input'}
				</span>

				<div className={styles.editorWrapper}>
					<Editor
						value={code}
						onValueChange={onCodeChange}
						highlight={(input) => hightlightWithLineNumbers(input, languages.css)}
						className={styles.editor}
						padding={10}
					/>
				</div>
			</div>

			<div className={styles.output}>
				<span className={styles.caption}>{'Result'}</span>

				{error ? errorOutput : warningOutput}
			</div>

			<div className={styles.configInput}>
				<span className={styles.caption}>{'Config input'}</span>

				<div className={styles.editorWrapper}>
					<Editor
						value={config}
						onValueChange={onConfigChange}
						highlight={(input) => hightlightWithLineNumbers(input, languages.json)}
						className={`${styles.editor} language-json`}
						padding={10}
					/>
				</div>
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
	invalidOptionWarnings: PropTypes.array.isRequired,
	parseErrors: PropTypes.array.isRequired,
	warnings: PropTypes.array.isRequired,
	error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
};

export default Linter;
