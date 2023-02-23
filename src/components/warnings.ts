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
			element.innerHTML = '';

			if (result.returnCode !== 0) {
				const li = document.createElement('li');

				li.textContent = result.result.replace(ansiRegex(), '');
				element.appendChild(li);

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
				const ruleLinkText = `(${warning.rule})`;
				const ruleUrl = ruleMetadata[warning.rule]?.url;

				const li = document.createElement('li');

				li.classList.add('stylelint-demo-warning-item');
				const span = document.createElement('span');

				li.appendChild(span);

				if (ruleUrl) {
					const index = warning.text.lastIndexOf(ruleLinkText);

					if (index >= 0) {
						span.textContent = `[${warning.line}:${warning.column}] ${warning.text
							.slice(0, index)
							.trim()}`;
					} else {
						span.textContent = `[${warning.line}:${warning.column}] ${warning.text.trim()}`;
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
					span.textContent = `[${warning.line}:${warning.column}] ${warning.text.trim()}`;
				}

				span.addEventListener('click', () => listeners.onClickWaning(warning));

				element.appendChild(li);
			}
		},
	};
}
