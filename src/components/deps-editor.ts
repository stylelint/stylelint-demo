import defaultDeps from './defaults/deps';
import { setupMonacoEditor } from '../monaco-editor/monaco-setup.js';

export type DepsEditorOptions = {
	/** Specify a target element to set up the dependencies editor. */
	element: HTMLElement;
	/** Specify the initial values. */
	init: {
		/** Dependency packages text. */
		value?: string;
	};
	/** Event listeners. */
	listeners: {
		/** Notifies that the dependency packages text have changed. */
		onChangeValue: (value: string) => void;
	};
};
/** Setup a dependencies editor component. */
export function setupDepsEditor({ element, listeners, init }: DepsEditorOptions) {
	return setupMonacoEditor({
		element,
		init: {
			language: 'json',
			value: init?.value ?? JSON.stringify(defaultDeps, null, 2),
		},
		listeners,
		useDiffEditor: false,
	});
}
