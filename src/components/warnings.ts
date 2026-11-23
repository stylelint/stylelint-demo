import type { LinterServiceResult, LinterServiceResultSuccess } from '../linter-service';
import type { Warning } from 'stylelint';
import ansiRegex from 'ansi-regex';
import { createIcon } from './icon';
import errorIcon from './icons/error.svg?raw';
import warningIcon from './icons/warning.svg?raw';

export const severityIcons = { error: createIcon(errorIcon), warning: createIcon(warningIcon) };

export type WarningsPanelOptions = {
	/** Specify a target element to set up the warnings panel component. */
	element: HTMLElement;
	badge: HTMLElement;
	/** Event listeners. */
	listeners: {
		/** Notify the click event of the warning element. */
		onClickWaning: (warning: Warning) => void;
	};
};

/** Setup a component to display warnings. */
export function setupWarningsPanel({ element, badge, listeners }: WarningsPanelOptions) {
	return {
		setResult: (result: LinterServiceResult) => {
			const items = createListItems(result, listeners);
			const counts = getSeverityCounts(result);
			const count = counts ? counts.error + counts.warning : 0;

			element.replaceChildren(items.length > 0 ? createList(items) : createNoProblems());
			badge.textContent = count ? String(count) : '';
		},
	};
}

/** None when the linter itself failed. */
export function getSeverityCounts(result: LinterServiceResult) {
	if (result.returnCode !== 0) return undefined;

	const { invalidOptionWarnings, warnings } = result.result;

	if (invalidOptionWarnings.length > 0) {
		return { error: invalidOptionWarnings.length, warning: 0 };
	}

	const error = warnings.filter(({ severity }) => severity === 'error').length;

	return { error, warning: warnings.length - error };
}

function createListItems(
	result: LinterServiceResult,
	listeners: WarningsPanelOptions['listeners'],
) {
	if (result.returnCode !== 0) {
		const li = document.createElement('li');

		li.textContent = result.result.replace(ansiRegex(), '');

		return [li];
	}

	const { invalidOptionWarnings } = result.result;

	if (invalidOptionWarnings.length > 0) {
		return createInvalidOptionWarnings(invalidOptionWarnings);
	}

	return [...result.result.warnings]
		.sort(
			(a, b) =>
				a.line - b.line ||
				a.column - b.column ||
				(a.endLine != null && b.endLine != null && a.endLine - b.endLine) ||
				(a.endColumn != null && b.endColumn != null && a.endColumn - b.endColumn) ||
				0,
		)
		.map((warning) => createWarning(warning, result.ruleMetadata, listeners));
}

function createWarning(
	warning: Warning,
	ruleMetadata: LinterServiceResultSuccess['ruleMetadata'],
	listeners: WarningsPanelOptions['listeners'],
) {
	const li = document.createElement('li');

	const ruleLinkText = `(${warning.rule})`;
	const ruleUrl = ruleMetadata[warning.rule]?.url;

	li.appendChild(createSeverity(warning.severity));

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
			}
		}
	} else {
		message.textContent = `${warning.text.trim()}`;
	}

	const position = document.createElement('button');
	const ln = formatPosition(warning.line, warning.endLine);
	const col = formatPosition(warning.column, warning.endColumn);

	position.type = 'button';
	position.textContent = `[Ln ${ln}, Col ${col}]`;
	li.appendChild(position);

	position.addEventListener('click', () => listeners.onClickWaning(warning));

	return li;
}

function createList(items: HTMLLIElement[]) {
	const ul = document.createElement('ul');

	ul.append(...items);

	return ul;
}

function createNoProblems() {
	const p = document.createElement('p');

	p.textContent = 'No problems have been detected';

	return p;
}

function formatPosition(start: number, end: number | undefined) {
	return start === end || !end ? String(start) : [start, end].join('-');
}

function createSeverity(severity: Warning['severity']) {
	const el = document.createElement('span');

	el.append(severityIcons[severity].cloneNode(true));
	el.setAttribute('role', 'img');
	el.setAttribute('aria-label', severity);
	el.setAttribute('data-sd-severity', severity);

	return el;
}

function createInvalidOptionWarnings(optionWarnings: ReadonlyArray<{ text: string }>) {
	return optionWarnings.map(({ text }) => {
		const li = document.createElement('li');

		li.appendChild(createSeverity('error'));

		const message = document.createElement('span');

		message.textContent = text;

		li.appendChild(message);

		return li;
	});
}
