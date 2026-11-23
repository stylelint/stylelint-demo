import { getSeverityCounts, severityIcons } from './warnings';
import type { LinterServiceResult } from '../linter-service';
import { createTooltip } from './tooltip';

export type SeverityCountsOptions = {
	element: HTMLElement;
	listeners: {
		onClick: () => void;
	};
};

export function setupSeverityCounts({ element, listeners }: SeverityCountsOptions) {
	const button = document.createElement('button');
	const errorCount = document.createElement('span');
	const warningCount = document.createElement('span');
	const tooltip = createTooltip(button, 'sd-severity-counts-tooltip');

	button.type = 'button';
	button.append(
		severityIcons.error.cloneNode(true),
		errorCount,
		severityIcons.warning.cloneNode(true),
		warningCount,
	);
	button.addEventListener('click', listeners.onClick);
	element.hidden = true;
	element.replaceChildren(button, tooltip);

	return {
		setResult: (result: LinterServiceResult) => {
			const counts = getSeverityCounts(result);

			element.hidden = !counts;

			if (!counts) return;

			errorCount.textContent = String(counts.error);
			warningCount.textContent = String(counts.warning);
			tooltip.textContent = getTooltip(counts.error, counts.warning);
			button.setAttribute('aria-label', tooltip.textContent);
		},
	};
}

function getTooltip(error: number, warning: number) {
	const titles = [error > 0 && `Errors: ${error}`, warning > 0 && `Warnings: ${warning}`];

	return titles.filter(Boolean).join(', ') || 'No Problems';
}
