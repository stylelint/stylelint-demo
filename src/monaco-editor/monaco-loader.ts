import * as monaco from 'monaco-editor';
import schemaStylelintrc from '../schema/stylelintrc.json';

type Monaco = typeof monaco;

let monacoPromise: Promise<Monaco> | null = null;

/** Load the Monaco editor object. */
export function loadMonaco(): Promise<Monaco> {
	return (
		monacoPromise ||
		(monacoPromise = (async () => {
			monaco.css.cssDefaults.setOptions({
				validate: false, //Turn off CSS built-in validation.
			});

			monaco.json.jsonDefaults.setDiagnosticsOptions({
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
