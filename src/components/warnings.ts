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

			for (const w of result.result.warnings) {
				const li = document.createElement('li');

				li.classList.add('stylelint-demo-warning-item');
				li.textContent = `[${w.line}:${w.column}] ${w.text}`;
				li.addEventListener('click', () => listeners.onClickWaning(w));
				element.appendChild(li);
			}
		},
	};
}
