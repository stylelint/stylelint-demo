import type { LinterServiceResult } from '../linter-service';
import type { Warning } from 'stylelint';
import ansiRegex from 'ansi-regex';

export type WarningsPanelOptions = {
	/** Specify a target element to set up the warnings panel component. */
	element: HTMLElement;
	/** Event listeners. */
	listeners: {
		/** Notify the click event of the warning element. */
		onClickWaning: (warning: Warning) => void;
	};
};
/** Setup a component to display warnings. */
export function setupWarningsPanel({ element, listeners }: WarningsPanelOptions) {
	return {
		setResult: (result: LinterServiceResult) => {
			element.innerHTML = '<ul></ul>';
			const ul = element.querySelector('ul')!;

			if (result.returnCode !== 0) {
				const li = document.createElement('li');

				li.textContent = result.result.replace(ansiRegex(), '');
				ul.appendChild(li);

				return;
			}

			const ruleMetadata = result.ruleMetadata;

			for (const warning of [...result.result.warnings].sort(
				(a, b) =>
					a.line - b.line ||
					a.column - b.column ||
					(a.endLine != null && b.endLine != null && a.endLine - b.endLine) ||
					(a.endColumn != null && b.endColumn != null && a.endColumn - b.endColumn) ||
					0,
			)) {
				const li = document.createElement('li');

				const lineNumbers = document.createElement('span');
				const ln = formatPosition(warning.line, warning.endLine);
				const col = formatPosition(warning.column, warning.endColumn);

				lineNumbers.textContent = `${ln}:${col}`;
				li.appendChild(lineNumbers);

				lineNumbers.addEventListener('click', () => listeners.onClickWaning(warning));

				const ruleLinkText = `(${warning.rule})`;
				const ruleUrl = ruleMetadata[warning.rule]?.url;

				const severity = document.createElement('span');

				severity.textContent = warning.severity;
				severity.setAttribute('data-sd-severity', warning.severity);
				li.appendChild(severity);

				const message = document.createElement('span');

				li.appendChild(message);

				if (ruleUrl) {
					const index = warning.text.lastIndexOf(ruleLinkText);

					if (index >= 0) {
						message.textContent = `${warning.text.slice(0, index).trim()}`;
					} else {
						message.textContent = `${warning.text.trim()}`;
					}

					const ruleLink = document.createElement('a');

					ruleLink.textContent = ruleLinkText;
					ruleLink.href = ruleUrl;
					ruleLink.target = '_blank';
					li.appendChild(ruleLink);

					// Add a span if the message is included after the rule name.
					if (index >= 0) {
						const afterMessage = warning.text.slice(index + ruleLinkText.length).trim();

						if (afterMessage) {
							const afterSpan = document.createElement('span');

							afterSpan.textContent = afterMessage;
							li.appendChild(afterSpan);
							afterSpan.addEventListener('click', () => listeners.onClickWaning(warning));
						}
					}
				} else {
					message.textContent = `${warning.text.trim()}`;
				}

				ul.appendChild(li);
			}
		},
	};
}

function formatPosition(start: number, end: number | undefined) {
	return start === end || !end ? String(start) : [start, end].join('-');
}
