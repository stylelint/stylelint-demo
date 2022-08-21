import PropTypes from 'prop-types';
import React from 'react';

import SeverityLabel from '../severity-label';

import styles from './index.css';

export default function LintWarning({
	line,
	column,
	endLine,
	endColumn,
	text,
	rule,
	severity,
	url,
}) {
	const [locLine, locColumn] = formatLocation(line, column, endLine, endColumn);
	const warningText = text.replace(`(${rule})`, '').trim();

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
						{url ? <RuleLink rule={rule} url={url} /> : rule}
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
	endLine: PropTypes.number,
	endColumn: PropTypes.number,
	text: PropTypes.string.isRequired,
	rule: PropTypes.string,
	severity: PropTypes.string.isRequired,
	url: PropTypes.string,
};

// eslint-disable-next-line react/prop-types -- Internal component.
function RuleLink({ rule, url }) {
	return (
		<a className={styles.ruleLink} href={url} target="_blank" rel="noopener noreferrer">
			{rule}
		</a>
	);
}

function formatLocation(line, column, endLine, endColumn) {
	const ln = formatPosition(line, endLine);
	const col = formatPosition(column, endColumn);

	return [ln, col];
}

function formatPosition(start, end) {
	return start === end || !end ? String(start) : [start, end].join('-');
}
