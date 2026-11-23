import copyIcon from './icons/copy.svg?raw';
import { createIcon } from './icon';
import { createTooltip } from './tooltip';
import { debounce } from '../utils/debounce';

export type CopyLinkOptions = {
	element: HTMLElement;
};

export function setupCopyLink({ element }: CopyLinkOptions) {
	const button = document.createElement('button');
	const text = 'Copy a link to this code, config and dependencies';
	const tooltip = createTooltip(button, 'sd-copy-link-tooltip', text);
	const restoreTooltip = debounce(() => {
		tooltip.hidePopover();
		tooltip.textContent = text;
	}, 2000);

	button.type = 'button';
	button.append(createIcon(copyIcon), 'Copy demo link');
	button.addEventListener('click', copy);
	element.replaceChildren(button, tooltip);

	async function copy() {
		try {
			// eslint-disable-next-line n/no-unsupported-features/node-builtins
			await navigator.clipboard.writeText(getShareableUrl());
			report('Copied');
		} catch {
			report('Copy failed');
		}
	}

	function report(message: string) {
		tooltip.textContent = message;

		if (CSS.supports('position-area: block-start')) tooltip.showPopover();

		restoreTooltip();
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

			// NOTE: This relies on the parent website's implementation, so we need to ensure it's consistent.
			referrerUrl.pathname = '/demo/';

			return referrerUrl.href;
		}

		return window.location.href;
	}
}
