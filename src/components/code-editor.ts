import type * as monaco from 'modern-monaco/editor-core';
import { type CodeActionProvider, setupMonacoEditor } from '../monaco-editor/monaco-setup.js';
import defaultCSS from './defaults/css.css?raw';

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
	const fileNameInput = element.querySelector<HTMLInputElement>('#sd-code-file-name')!;
	const initFileName = adjustFileName(init.fileName);
	let monacoEditor = await setupMonacoEditor({
		element: element.querySelector<HTMLDivElement>('sd-code-monaco')!,
		init: {
			language: getLanguage(initFileName),
			fileName: initFileName,
			value: init.value ?? defaultCSS,
		},
		listeners: {
			onChangeValue: listeners.onChangeValue,
		},
		useDiffEditor: true,
	});

	fileNameInput.value = initFileName;
	fileNameInput.addEventListener('input', async () => {
		const fileName = adjustFileName(fileNameInput.value);

		if (fileNameInput.value && fileNameInput.value !== fileName) {
			fileNameInput.value = fileName;
		}

		const value = monacoEditor.getLeftValue();

		monacoEditor = await setupMonacoEditor({
			element: element.querySelector<HTMLDivElement>('sd-code-monaco')!,
			init: {
				language: getLanguage(fileName),
				fileName,
				value,
			},
			listeners: {
				onChangeValue: listeners.onChangeValue,
			},
			useDiffEditor: true,
		});
		listeners.onChangeFileName(fileName);
	});

	return {
		getLeftValue: () => monacoEditor.getLeftValue(),
		getLeftEditor: () => monacoEditor.getLeftEditor(),
		getFileName() {
			return adjustFileName(fileNameInput.value);
		},
		setLeftMarkers: (markers: monaco.editor.IMarkerData[]) => monacoEditor.setLeftMarkers(markers),
		setRightValue: (value: string) => monacoEditor.setRightValue(value),
		setRightMarkers: (markers: monaco.editor.IMarkerData[]) =>
			monacoEditor.setRightMarkers(markers),
		setCodeActionProvider: (codeActionProvider: CodeActionProvider) =>
			monacoEditor.setCodeActionProvider(codeActionProvider),
		disposeEditor: () => monacoEditor.disposeEditor(),
	};

	function adjustFileName(fileName: string | undefined) {
		return fileName?.trim() || 'example.css';
	}

	function getLanguage(fileName: string) {
		const lower = fileName.toLowerCase();

		// TODO: Ternary formatting by Prettier breaks. Maybe https://github.com/prettier/prettier/issues/15655
		// prettier-ignore
		return lower.endsWith('.css')
			? 'css'
			: lower.endsWith('.scss')
			? 'scss'
			: lower.endsWith('.less')
			? 'less'
			: lower.endsWith('.sass')
			? 'sass'
			: lower.endsWith('.html')
			? 'html'
			: lower.endsWith('.vue')
			? 'vue'
			: lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs') || lower.endsWith('.jsx')
			? 'javascript'
			: lower.endsWith('.ts') || lower.endsWith('.mts') || lower.endsWith('.cts') || lower.endsWith('.tsx')
			? 'typescript'
			: lower.endsWith('.svelte')
			? 'svelte'
			: lower.endsWith('.astro')
			? 'astro'
			: lower.endsWith('.stylus') || lower.endsWith('.styl')
			? 'stylus'
			: 'css';
	}
}
