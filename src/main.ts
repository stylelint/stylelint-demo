import './style.css';
import { compress, decompress } from './utils/compress';
import type { ConfigFormat } from './components/config-editor';
import { debounce } from './utils/debounce';
import defaultConfig from './components/defaults/config.json';
import defaultDeps from './components/defaults/deps';
import { mount } from './demo';

const syntaxes = [
	{
		fileName: 'example.scss',
		id: 'scss',
		customSyntax: 'postcss-scss',
	},
	{
		fileName: 'example.sass',
		id: 'sass',
		customSyntax: 'postcss-sass',
	},
	{
		fileName: 'example.less',
		id: 'less',
		customSyntax: 'postcss-less',
	},
	{
		fileName: 'example.sss',
		id: 'sugarss',
		customSyntax: 'sugarss',
	},
	{
		fileName: 'example.html',
		id: 'html',
		customSyntax: 'postcss-html',
	},
];

const hashData = window.location.hash.slice(window.location.hash.indexOf('#') + 1);
const queryParam = decompress(hashData);

if (queryParam.syntax) {
	// Backward compatibility
	const syntax = syntaxes.find((s) => s.id === queryParam.syntax);

	if (syntax) {
		try {
			const customSyntax = syntax.customSyntax;

			if (!queryParam.deps) {
				const deps = { [customSyntax]: 'latest', ...(defaultDeps || {}) };

				queryParam.deps = JSON.stringify(deps, null, 2);
			}

			if (!queryParam.fileName) {
				queryParam.fileName = syntax.fileName;
			}

			const config = {
				customSyntax,
				...(queryParam.config ? JSON.parse(queryParam.config) : defaultConfig),
			};

			queryParam.config = JSON.stringify(config, null, 2);
		} catch {
			// ignore
		}
	}
}

const {
	code: codeQueryParam,
	fileName: fileNameQueryParam,
	config: configQueryParam,
	configFormat: configFormatQueryParam,
	deps: depsQueryParam,
} = queryParam;

mount({
	element: document.querySelector('#app')!,
	init: {
		code: codeQueryParam,
		fileName: fileNameQueryParam,
		config: configQueryParam,
		configFormat: configFormatQueryParam,
		deps: depsQueryParam,
	},
	listeners: {
		onChange: debounce(
			(values: {
				code: string;
				fileName: string;
				config: string;
				configFormat: ConfigFormat;
				deps: string;
			}) => {
				const query = compress(values);

				window.location.hash = query;

				if (window.parent) {
					window.parent.postMessage(query, '*');
				}
			},
			250,
		),
	},
});
