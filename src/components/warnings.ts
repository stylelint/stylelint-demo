import type { LinterServiceResult } from '../linter-service';
import ansiRegex from 'ansi-regex';

export function setupWarningsPanel({ element }: { element: HTMLElement }) {
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

				li.textContent = `[${w.line}:${w.column}] ${w.text}`;
				element.appendChild(li);
			}
		},
	};
}
