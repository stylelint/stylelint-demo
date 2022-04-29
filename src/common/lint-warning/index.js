import PropTypes from 'prop-types';
import React from 'react';

import SeverityLabel from '../severity-label';

import styles from './index.css';

export default function LintWarning({ line, column, endLine, endColumn, text, rule, severity }) {
	const [locLine, locColumn] = formatLocation(line, column, endLine, endColumn);
	const warningText = text.replace(`(${rule})`, '').trim();
	const url = `http://stylelint.io/user-guide/rules/list/${rule}/`;

	return (
		<div className={styles.result}>
			<span className={styles.location} title={`Line: ${locLine}, Column: ${locColumn}`}>
				{`${locLine}:${locColumn}`}
			</span>
			<SeverityLabel severity={severity} />
			<span className={styles.message}>
				<span>{warningText}</span>
				{rule ? (
					<span className={styles.ruleName}>
						{'('}
						<a className={styles.ruleLink} href={url} target="_blank" rel="noopener noreferrer">
							{rule}
						</a>
						{')'}
					</span>
				) : null}
			</span>
		</div>
	);
}

LintWarning.propTypes = {
	line: PropTypes.number.isRequired,
	column: PropTypes.number.isRequired,
	endLine: PropTypes.number.isRequired,
	endColumn: PropTypes.number.isRequired,
	text: PropTypes.string.isRequired,
	rule: PropTypes.string,
	severity: PropTypes.string.isRequired,
};

function formatLocation(line, column, endLine, endColumn) {
	const ln = line === endLine ? String(line) : [line, endLine].join('-');
	const col = column === endColumn ? String(column) : [column, endColumn].join('-');

	return [ln, col];
}
