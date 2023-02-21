import type {
	CancellationToken,
	MonacoEditor,
	MonacoEditorLanguages,
	MonacoEditorRange,
} from './types.js';
import { loadMonacoEditor } from './monaco-loader.js';

export type ProvideCodeActions = (
	model: MonacoEditor.ITextModel,
	range: MonacoEditorRange,
	context: MonacoEditorLanguages.CodeActionContext,
	token: CancellationToken,
) => MonacoEditorLanguages.ProviderResult<MonacoEditorLanguages.CodeActionList>;
export type MonacoEditorResult = {
	setModelLanguage: (language: string) => void;
	setValue: (value: string) => void;
	getValue: () => string;
	setMarkers: (markers: MonacoEditor.IMarkerData[]) => void;
	getEditor: () => MonacoEditor.IStandaloneCodeEditor;
	disposeEditor: () => void;
};
export type MonacoDiffEditorResult = {
	setModelLanguage: (language: string) => void;
	setLeftValue: (value: string) => void;
	getLeftValue: () => string;
	setRightValue: (value: string) => void;
	setLeftMarkers: (markers: MonacoEditor.IMarkerData[]) => void;
	setRightMarkers: (markers: MonacoEditor.IMarkerData[]) => void;
	getLeftEditor: () => MonacoEditor.IStandaloneCodeEditor;
	getRightEditor: () => MonacoEditor.IStandaloneCodeEditor | null;
	disposeEditor: () => void;
};
/** Setup editor */
export async function setupMonacoEditor({
	init,
	listeners,
	element,
	useDiffEditor,
}: {
	init: {
		value: string;
		language: string;
		readOnly?: boolean;
	};
	listeners?: {
		onChangeValue?: (value: string) => void;
	};
	element: HTMLElement;
	useDiffEditor: false;
}): Promise<MonacoEditorResult>;
export async function setupMonacoEditor({
	init,
	listeners,
	element,
	useDiffEditor,
}: {
	init: {
		value: string;
		language: string;
		readOnly?: boolean;
	};
	listeners?: {
		onChangeValue?: (value: string) => void;
	};
	element: HTMLElement;
	useDiffEditor: true;
}): Promise<MonacoDiffEditorResult>;
export async function setupMonacoEditor({
	init,
	listeners,
	element,
	useDiffEditor,
}: {
	init: {
		value: string;
		language: string;
		readOnly?: boolean;
	};
	listeners?: {
		onChangeValue?: (value: string) => void;
	};
	element: HTMLElement;
	useDiffEditor: boolean;
}): Promise<MonacoEditorResult | MonacoDiffEditorResult> {
	element.textContent = 'Loading...';
	element.style.padding = '0 8px';
	const monaco = await loadMonacoEditor();

	element.textContent = '';
	element.style.padding = '';
	const language = init.language;

	const options = {
		value: init.value,
		readOnly: init.readOnly,
		theme: 'vs-dark',
		language,
		automaticLayout: true,
		fontSize: 14,
		// tabSize: 2,
		minimap: {
			enabled: false,
		},
		renderControlCharacters: true,
		renderIndentGuides: true,
		renderValidationDecorations: 'on' as const,
		renderWhitespace: 'boundary' as const,
		scrollBeyondLastLine: false,
		scrollbar: { alwaysConsumeMouseWheel: false },
	};

	if (useDiffEditor) {
		const diffEditor = monaco.editor.createDiffEditor(element, {
			originalEditable: true,
			...options,
		});
		const original = monaco.editor.createModel(init.value, language);
		const modified = monaco.editor.createModel(init.value, language);

		const leftEditor = diffEditor.getOriginalEditor();
		const rightEditor = diffEditor.getModifiedEditor();

		rightEditor.updateOptions({ readOnly: true });
		diffEditor.setModel({ original, modified });
		original.onDidChangeContent(() => {
			const value = original.getValue();

			listeners?.onChangeValue?.(value);
		});

		const result: MonacoDiffEditorResult = {
			setModelLanguage: (lang) => {
				for (const model of [original, modified]) {
					monaco.editor.setModelLanguage(model, lang);
				}
			},
			setLeftValue: (code) => {
				const value = original.getValue();

				if (code !== value) {
					original.setValue(code);
				}
			},
			getLeftValue: () => original.getValue(),
			setRightValue: (code) => {
				const value = modified.getValue();

				if (code !== value) {
					modified.setValue(code);
				}
			},
			setLeftMarkers: (markers) => {
				void updateMarkers(leftEditor, markers);
			},
			setRightMarkers: (markers) => {
				void updateMarkers(rightEditor, markers);
			},
			getLeftEditor: () => leftEditor,
			getRightEditor: () => rightEditor,

			disposeEditor: () => {
				leftEditor.getModel()?.dispose();
				rightEditor.getModel()?.dispose();
				leftEditor.dispose();
				rightEditor.dispose();
				diffEditor.dispose();
			},
		};

		return result;
	}

	const standaloneEditor = monaco.editor.create(element, options);

	standaloneEditor.onDidChangeModelContent(() => {
		const value = standaloneEditor.getValue();

		listeners?.onChangeValue?.(value);
	});

	const result: MonacoEditorResult = {
		setModelLanguage: (lang) => {
			const model = standaloneEditor.getModel();

			if (model) {
				monaco.editor.setModelLanguage(model, lang);
			}
		},
		setValue: (code) => {
			const value = standaloneEditor.getValue();

			if (code !== value) {
				standaloneEditor.setValue(code);
			}
		},
		getValue: () => standaloneEditor.getValue(),
		setMarkers: (markers) => {
			void updateMarkers(standaloneEditor, markers);
		},
		getEditor: () => standaloneEditor,

		disposeEditor: () => {
			standaloneEditor.getModel()?.dispose();
			standaloneEditor.dispose();
		},
	};

	return result;

	/** Update markers */
	function updateMarkers(
		editor: MonacoEditor.IStandaloneCodeEditor,
		markers: MonacoEditor.IMarkerData[],
	) {
		const model = editor.getModel()!;
		const id = editor.getId();

		monaco.editor.setModelMarkers(
			model,
			id,
			JSON.parse(JSON.stringify(markers)) as MonacoEditor.IMarkerData[],
		);
	}
}
