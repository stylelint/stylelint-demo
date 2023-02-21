import type { Monaco } from './types.js';
import { version as monacoVersion } from 'monaco-editor/package.json';

async function setupMonaco(): Promise<void> {
	if (typeof window !== 'undefined') {
		const monacoScript =
			Array.from(document.head.querySelectorAll('script')).find(
				(script) => script.src && script.src.includes('monaco') && script.src.includes('vs/loader'),
			) || (await appendMonacoEditorScript());

		// @ts-expect-error -- global Monaco's require
		window.require.config({
			paths: {
				vs: monacoScript.src.replace(/\/vs\/.*$/u, '/vs'),
			},
		});
	}
}

async function appendMonacoEditorScript(): Promise<HTMLScriptElement> {
	const script = document.createElement('script');

	return new Promise((resolve) => {
		script.src = `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/${monacoVersion}/min/vs/loader.min.js`;
		script.onload = () => {
			script.onload = null;

			watch();

			function watch() {
				// @ts-expect-error -- global Monaco's require
				if (window.require) {
					resolve(script);

					return;
				}

				setTimeout(watch, 200);
			}
		};
		document.head.append(script);
	});
}

let setupedMonaco: Promise<void> | null = null;
let editorLoaded: Promise<Monaco> | null = null;

export function loadMonacoEngine(): Promise<void> {
	return setupedMonaco || (setupedMonaco = setupMonaco());
}
export function loadMonacoEditor(): Promise<Monaco> {
	if (editorLoaded) {
		return editorLoaded;
	}

	return (editorLoaded = (async () => {
		const monaco: Monaco = await loadModuleFromMonaco('vs/editor/editor.main');

		monaco.languages.css.cssDefaults.setOptions({
			validate: false, //Turn off CSS built-in validation.
		});

		return monaco;
	})());
}

export async function loadModuleFromMonaco<T>(moduleName: string): Promise<T> {
	await loadMonacoEngine();

	return new Promise((resolve) => {
		if (typeof window !== 'undefined') {
			// @ts-expect-error -- global Monaco's require
			window.require([moduleName], (r: T) => {
				resolve(r);
			});
		}
	});
}
