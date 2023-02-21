import defaultDeps from './defaults/deps';
import { setupMonacoEditor } from '../monaco-editor/monaco-setup.js';

export function setupDepsEditor({
	element,
	listeners,
	init,
}: {
	element: HTMLElement;
	listeners: {
		onChangeValue: (value: string) => void;
	};
	init?: {
		value?: string;
	};
}) {
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
