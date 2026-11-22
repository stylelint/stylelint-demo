export function createIcon(source: string) {
	const template = document.createElement('template');

	template.innerHTML = source;

	const icon = template.content.firstElementChild!;

	icon.setAttribute('aria-hidden', 'true');

	return icon;
}
