export type CopyLinkOptions = {
	element: HTMLElement;
};

export function setupCopyLink({ element }: CopyLinkOptions) {
	const button = document.createElement('button');
	const buttonText = 'Copy link';

	button.textContent = buttonText;
	button.addEventListener('click', copy);
	element.replaceChildren(button);

	async function copy() {
		try {
			// eslint-disable-next-line n/no-unsupported-features/node-builtins
			await navigator.clipboard.writeText(getShareableUrl());

			button.textContent = 'Copied!';
			setTimeout(() => {
				button.textContent = buttonText;
			}, 2000);
		} catch {
			// ignore
		}
	}
}

// Get the most appropriate URL to share.
function getShareableUrl(): string {
	if (window.parent === window) {
		return window.location.href;
	}

	try {
		return window.parent.location.href;
	} catch {
		// For cross-origin errors in iframe scenarios, fall back to referrer.
		const referrer = document.referrer;

		if (referrer) {
			const referrerUrl = new URL(referrer);

			referrerUrl.hash = window.location.hash;
			referrerUrl.search = window.location.search;

			return referrerUrl.href;
		}

		return window.location.href;
	}
}
