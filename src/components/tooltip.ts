export function createTooltip(control: HTMLElement, id: string, text = '') {
	const tooltip = document.createElement('sd-tooltip');

	tooltip.id = id;
	tooltip.textContent = text;
	tooltip.setAttribute('popover', 'hint');
	control.setAttribute('interestfor', id);

	return tooltip;
}
