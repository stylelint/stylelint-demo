import { defineConfig } from 'vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor-esm';

export default defineConfig(() => ({
	server: {
		headers: {
			'Cross-Origin-Embedder-Policy': 'require-corp',
			'Cross-Origin-Opener-Policy': 'same-origin',
		},
	},
	plugins: [
		monacoEditorPlugin({
			languageWorkers: ['editorWorkerService', 'css', 'html', 'json', 'typescript'],
		}),
	],
}));
