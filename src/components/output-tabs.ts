export type Tab = {
	setChecked: (dataRadioName: string) => void;
};
export function setupTabs({ element }: { element: HTMLElement }): Tab {
	return {
		setChecked: (dataRadioName) => {
			const radio = element.querySelector<HTMLInputElement>(
				`input[data-radio-name="${dataRadioName}"]`,
			)!;

			radio.checked = true;
		},
	};
}
