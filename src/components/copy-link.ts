export type CopyLinkOptions = {
	element: HTMLElement;
};

export function setupCopyLink({ element }: CopyLinkOptions) {
	const button = document.createElement('button');

	button.textContent = 'Copy link';
	button.addEventListener('click', copy);
	element.replaceChildren(button);

	async function copy() {
		try {
			// eslint-disable-next-line n/no-unsupported-features/node-builtins
			await navigator.clipboard.writeText(window.location.href);
		} catch {
			// ignore
		}
	}
}
