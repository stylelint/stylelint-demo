export type Tabs = {
	setSelected: (name: string) => void;
};
export type TabsOptions = {
	/** Specify a target element to set up the tabs component. */
	element: HTMLElement;
};

/** Setup tabs component. */
export function setupTabs({ element }: TabsOptions): Tabs {
	const tabs = [...element.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
	const panels = new Map(
		tabs.map((tab) => [
			tab,
			element.parentElement!.querySelector<HTMLElement>(`[aria-labelledby="${tab.id}"]`)!,
		]),
	);
	const isFocusgroupSupported = 'focusGroup' in HTMLElement.prototype;

	for (const tab of tabs) {
		tab.addEventListener('click', () => select(tab));
		tab.addEventListener('focus', ({ relatedTarget }) => {
			if (tabs.some((other) => other === relatedTarget)) select(tab);
		});
	}

	if (!isFocusgroupSupported) element.addEventListener('keydown', moveFocus);

	select(tabs.find((tab) => tab.ariaSelected === 'true')!);

	return {
		setSelected: (name) => {
			select(tabs.find((tab) => tab.id === `sd-${name}-tab`)!);
		},
	};

	function select(selected: HTMLButtonElement) {
		for (const [tab, panel] of panels) {
			const isSelected = tab === selected;

			tab.ariaSelected = String(isSelected);
			tab.toggleAttribute('focusgroupstart', isSelected);
			panel.hidden = !isSelected;

			if (!isFocusgroupSupported) tab.tabIndex = isSelected ? 0 : -1;
		}
	}

	function moveFocus(event: KeyboardEvent) {
		const index = tabs.findIndex((tab) => tab === event.target);
		const targetIndex = new Map([
			['ArrowLeft', index - 1],
			['ArrowRight', index + 1],
			['Home', 0],
			['End', tabs.length - 1],
		]).get(event.key);

		if (index < 0 || targetIndex === undefined) return;

		event.preventDefault();
		tabs.at(Math.max(targetIndex, 0))?.focus();
	}
}
