import type * as monacoNS from 'modern-monaco/editor-core';
import { DARK_THEME_NAME, LIGHT_THEME_NAME } from './const';
import { init } from 'modern-monaco';
import schemaStylelintrc from '../schema/stylelintrc.json';

type Monaco = typeof monacoNS;

let monacoPromise: Promise<Monaco> | null = null;

/** Load the Monaco editor object. */
export function loadMonaco(): Promise<Monaco> {
	return (
		monacoPromise ||
		(monacoPromise = (async () => {
			const monaco = await init({
				themes: [DARK_THEME_NAME, LIGHT_THEME_NAME],
				lsp: {
					css: {
						diagnosticsOptions: {
							validate: false,
						},
					},
					json: {
						diagnosticsOptions: {
							validate: true,
						},
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
					},
				},
			});

			return monaco;
		})())
	);
}
