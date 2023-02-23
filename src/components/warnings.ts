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

				if (warning.text.includes(ruleLinkText) && ruleUrl) {
					const index = warning.text.lastIndexOf(ruleLinkText);

					span.textContent = `[${warning.line}:${warning.column}] ${warning.text.slice(0, index)}`;
					const ruleLink = document.createElement('a');

					ruleLink.textContent = ruleLinkText;
					ruleLink.href = ruleUrl;
					ruleLink.target = '_blank';
					li.appendChild(ruleLink);
				} else {
					span.textContent = `[${warning.line}:${warning.column}] ${warning.text}`;
				}

				span.addEventListener('click', () => listeners.onClickWaning(warning));

				element.appendChild(li);
			}
		},
	};
}
