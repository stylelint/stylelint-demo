import type { LinterServiceResult } from '../linter-service';
import type { Warning } from 'stylelint';
import ansiRegex from 'ansi-regex';

export function setupWarningsPanel({
	element,
	listeners,
}: {
	element: HTMLElement;
	listeners: {
		onClickWaning: (warning: Warning) => void;
	};
}) {
	return {
		setResult: (result: LinterServiceResult) => {
			element.innerHTML = '';

			if (result.exit !== 0) {
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
