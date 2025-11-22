import defaultConfigRaw from './defaults/config.mjs?raw';
import { setupMonacoEditor } from '../monaco-editor/monaco-setup.js';

const FORMATS: ConfigFormat[] = [
	'stylelint.config.mjs',
	'stylelint.config.cjs',
	'.stylelintrc.json',
	'.stylelintrc.yaml',
];

export type ConfigFormat =
	| 'stylelint.config.mjs'
	| 'stylelint.config.cjs'
	| '.stylelintrc.json'
	| '.stylelintrc.yaml';

export type ConfigEditorOptions = {
	/** Specify a target element to set up the config editor. */
	element: HTMLElement;
	/** Specify the initial values. */
	init: {
		/** Config text. */
		value?: string;
		/** Config text format. */
		format?: ConfigFormat;
	};
	/** Event listeners. */
	listeners: {
		/** Notifies that the config value have changed. */
		onChangeValue: (value: string) => void;
		/** Notifies that the config format have changed. */
		onChangeFormat: (format: ConfigFormat) => void;
	};
};

/**
 * Setup a config editor component.
 * This component has a config format select and a config editor.
 */
export async function setupConfigEditor({ element, listeners, init }: ConfigEditorOptions) {
	const formatSelect = element.querySelector<HTMLSelectElement>('#sd-config-format')!;

	formatSelect.innerHTML = '';

	for (const format of FORMATS) {
		const option = document.createElement('option');

		option.value = format;
		option.textContent = format;
		formatSelect.appendChild(option);
	}

	const initFormat = (
		FORMATS.includes(init?.format as ConfigFormat) ? init?.format : 'stylelint.config.mjs'
	) as ConfigFormat;

	const monacoEditor = await setupMonacoEditor({
		element: element.querySelector<HTMLDivElement>('sd-config-monaco')!,
		init: {
			language: getLanguage(initFormat),
			value: init?.value ?? defaultConfigRaw,
			fileName: initFormat,
		},
		listeners,
		useDiffEditor: false,
	});

	formatSelect.value = initFormat;
	formatSelect.addEventListener('change', () => {
		const format = formatSelect.value as ConfigFormat;

		monacoEditor.setModelLanguage(getLanguage(format));
		listeners.onChangeFormat(format);
	});

	return {
		...monacoEditor,
		getFormat() {
			return formatSelect.value as ConfigFormat;
		},
	};

	function getLanguage(format: ConfigFormat) {
		if (format.endsWith('.mjs') || format.endsWith('.cjs')) {
			return 'javascript';
		}

		return format.split('.').pop() ?? 'json';
	}
}
