import defaultConfig from './defaults/config.json';
import { setupMonacoEditor } from '../monaco-editor/monaco-setup.js';

const FORMATS: ConfigFormat[] = ['json', 'js', 'yaml'];

export type ConfigFormat = 'json' | 'js' | 'yaml';

export async function setupConfigEditor({
	element,
	listeners,
	init,
}: {
	element: HTMLElement;
	listeners: {
		onChangeValue: (value: string) => void;
		onChangeFormat: (format: ConfigFormat) => void;
	};
	init?: {
		value?: string;
		format?: ConfigFormat;
	};
}) {
	const formatSelect = element.querySelector<HTMLSelectElement>('.stylelint-demo-config-format')!;

	formatSelect.innerHTML = '';

	for (const format of FORMATS) {
		const option = document.createElement('option');

		option.value = format;
		option.textContent = format;
		formatSelect.appendChild(option);
	}

	const initFormat = adjustFormat(init?.format || 'json');

	const monacoEditor = await setupMonacoEditor({
		element: element.querySelector<HTMLDivElement>('.stylelint-demo-config-monaco')!,
		init: {
			language: getLanguage(initFormat),
			value: init?.value ?? JSON.stringify(defaultConfig, null, 2),
		},
		listeners,
		useDiffEditor: false,
	});

	formatSelect.value = initFormat;
	formatSelect.addEventListener('change', () => {
		const format = adjustFormat(formatSelect.value);

		monacoEditor.setModelLanguage(getLanguage(format));
		listeners.onChangeFormat(format);
	});

	return {
		...monacoEditor,
		getFormat() {
			return adjustFormat(formatSelect.value);
		},
	};

	function adjustFormat(format: string): ConfigFormat {
		const str = (format?.trim()?.toLowerCase() || 'json') as ConfigFormat;

		return FORMATS.includes(str) ? str : 'json';
	}

	function getLanguage(format: string) {
		return format === '.js' ? 'javascript' : format;
	}
}
