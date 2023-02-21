import defaultCSS from './defaults/css.css?raw';
import { setupMonacoEditor } from '../monaco-editor/monaco-setup.js';

export type CodeEditorOptions = {
	/** Specify a target element to set up the code editor. */
	element: HTMLElement;
	/** Specify the initial values. */
	init: {
		/** Code text to lint. */
		value?: string;
		/** The file name of the code. */
		fileName?: string;
	};
	/** Event listeners. */
	listeners: {
		/** Notifies that the code value have changed. */
		onChangeValue: (value: string) => void;
		/** Notifies that the code file name have changed. */
		onChangeFileName: (value: string) => void;
	};
};
/**
 * Setup a code editor component.
 * This component has a filename input and a code editor.
 */
export async function setupCodeEditor({ element, listeners, init }: CodeEditorOptions) {
	const fileNameInput = element.querySelector<HTMLInputElement>('.stylelint-demo-code-file-name')!;
	const initFileName = adjustFileName(init.fileName || 'example.css');
	const monacoEditor = await setupMonacoEditor({
		element: element.querySelector<HTMLDivElement>('.stylelint-demo-code-monaco')!,
		init: {
			language: getLanguage(initFileName),
			value: init.value ?? defaultCSS,
		},
		listeners: {
			onChangeValue: listeners.onChangeValue,
		},
		useDiffEditor: true,
	});

	fileNameInput.value = initFileName;
	fileNameInput.addEventListener('input', () => {
		const fileName = adjustFileName(fileNameInput.value);

		monacoEditor.setModelLanguage(getLanguage(fileName));
		listeners.onChangeFileName(fileName);
	});

	return {
		...monacoEditor,
		getFileName() {
			return adjustFileName(fileNameInput.value);
		},
	};

	function adjustFileName(fileName: string) {
		return fileName?.trim() || 'example.css';
	}

	function getLanguage(fileName: string) {
		const lower = fileName.toLowerCase();

		return lower.endsWith('.css')
			? 'css'
			: lower.endsWith('.scss')
			? 'scss'
			: lower.endsWith('.less')
			? 'less'
			: lower.endsWith('.sass')
			? 'sass'
			: lower.endsWith('.html') || lower.endsWith('.vue') || lower.endsWith('.svelte')
			? 'html'
			: lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')
			? 'javascript'
			: lower.endsWith('.ts') || lower.endsWith('.mts') || lower.endsWith('.cts')
			? 'typescript'
			: 'css';
	}
}
