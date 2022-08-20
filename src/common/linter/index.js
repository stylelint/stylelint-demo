import PropTypes from 'prop-types';
import React from 'react';

import Editor from '../editor';
import SyntaxSelect from '../syntax-select';
import WarningList from '../warning-list';

import styles from './index.css';

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
	stylelintInfo,
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

				<Editor
					code={code}
					language={syntax}
					height="40vh"
					warnings={warnings}
					onChange={onCodeChange}
				/>
			</div>

			<div className={styles.output}>
				<span className={styles.caption}>{'Result'}</span>

				{error ? errorOutput : warningOutput}

				{stylelintInfo.version && (
					<div className={styles.version}>
						{'Powered by '}
						<a
							className={styles.versionLink}
							href={stylelintInfo.versionUrl}
							target="_blank"
							rel="noopener noreferrer"
						>{`Stylelint ${stylelintInfo.version}`}</a>
					</div>
				)}
			</div>

			<div className={styles.configInput}>
				<span className={styles.caption}>{'Config input'}</span>

				<Editor code={config} language="json" height="60vh" onChange={onConfigChange} />
			</div>
		</div>
	);
};

Linter.propTypes = {
	onCodeChange: PropTypes.func.isRequired,
	onConfigChange: PropTypes.func.isRequired,
	onSyntaxChange: PropTypes.func,
	code: PropTypes.string.isRequired,
	config: PropTypes.string.isRequired,
	syntax: PropTypes.string,
	invalidOptionWarnings: PropTypes.array.isRequired,
	parseErrors: PropTypes.array.isRequired,
	warnings: PropTypes.array.isRequired,
	error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
	stylelintInfo: PropTypes.exact({
		version: PropTypes.string,
		versionUrl: PropTypes.string,
	}),
};

export default Linter;
