import type * as _monaco from 'monaco-editor';
type Monaco = typeof _monaco;
import { version as monacoVersion } from 'monaco-editor/package.json';

import schemaStylelintrc from '../schema/stylelintrc.json';

let monacoPromise: Promise<Monaco> | null = null;

/** Load the Monaco editor object. */
export function loadMonaco(): Promise<Monaco> {
	return (
		monacoPromise ||
		(monacoPromise = (async () => {
			const monaco: Monaco = await loadModuleFromMonaco('vs/editor/editor.main');

			monaco.languages.css.cssDefaults.setOptions({
				validate: false, //Turn off CSS built-in validation.
			});

			monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
				validate: true,
				enableSchemaRequest: false, // TODO: When switching a remote schema, enable it.
				schemas: [
					{
						// TODO: Note that this schema URL is actually absent. It's the same as `schemaStylelintrc.$id`.
						// We need to rewrite it when switching to a remote schema in the future.
						uri: 'https://stylelint.io/schema/stylelintrc.json',
						fileMatch: ['.stylelintrc.json'],

						// TODO: When switching to a remote schema in the future, delete it and its file.
						// Currently, schemastore.org doesn't support a schema for new Stylelint versions, so we shouldn't use it yet.
						// See https://github.com/stylelint/stylelint-demo/pull/425#issuecomment-2349046490
						schema: schemaStylelintrc,
					},
				],
			});

			setupEnhancedLanguages(monaco);

			return monaco;
		})())
	);
}

async function loadModuleFromMonaco<T>(moduleName: string): Promise<T> {
	await setupMonaco();

	return new Promise((resolve) => {
		if (typeof window !== 'undefined') {
			// @ts-expect-error -- global Monaco's require
			window.require([moduleName], (r: T) => {
				resolve(r);
			});
		}
	});
}

async function setupMonaco(): Promise<void> {
	if (typeof window !== 'undefined') {
		const monacoScript =
			Array.from(document.head.querySelectorAll('script')).find(
				(script) => script.src && script.src.includes('monaco') && script.src.includes('vs/loader'),
			) ||
			// If the script tag that loads the Monaco editor is not found, insert the script tag.
			(await appendMonacoEditorScript());

		// @ts-expect-error -- global Monaco's require
		window.require.config({
			paths: {
				vs: monacoScript.src.replace(/\/vs\/.*$/u, '/vs'),
			},
		});
	}
}

/** Appends a script tag that loads the Monaco editor. */
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

function setupEnhancedLanguages(monaco: Monaco) {
	monaco.languages.register({ id: 'astro' });
	monaco.languages.registerTokensProviderFactory('astro', {
		async create() {
			const astro = await import('./monarch-syntaxes/astro');

			return astro.language;
		},
	});
	monaco.languages.register({ id: 'stylus', aliases: ['styl'] });
	monaco.languages.registerTokensProviderFactory('stylus', {
		async create() {
			const stylus = await import('./monarch-syntaxes/stylus');

			return stylus.language;
		},
	});
	monaco.languages.register({ id: 'svelte' });
	monaco.languages.registerTokensProviderFactory('svelte', {
		async create() {
			const svelte = await import('./monarch-syntaxes/svelte');

			return svelte.language;
		},
	});
}
