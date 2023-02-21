import './demo.css';
import type { ConfigFormat } from './components/config-editor';
import type { Warning } from 'stylelint';
import { debounce } from './utils/debounce';
import type { editor } from 'monaco-editor';
import html from './demo.html?raw';
import { loadMonacoEditor } from './monaco-editor';
import { setupCodeEditor } from './components/code-editor';
import { setupConfigEditor } from './components/config-editor';
import { setupConsoleOutput } from './components/console';
import { setupDepsEditor } from './components/deps-editor';
import { setupLinter } from './linter-service';
import { setupTabs } from './components/output-tabs';
import { setupWarningsPanel } from './components/warnings';

export async function mount({
	element,
	init,
	listeners,
}: {
	element: HTMLElement;
	init?: {
		code?: string;
		config?: string;
		deps?: string;
		fileName?: string;
		configFormat?: ConfigFormat;
	};
	listeners?: {
		onChange?: (values: {
			code: string;
			fileName: string;
			config: string;
			deps: string;
			configFormat: ConfigFormat;
		}) => void;
	};
}) {
	element.innerHTML = html;

	const outputTabs = setupTabs({
		element: element.querySelector<HTMLDivElement>('.stylelint-demo-output-tabs')!,
	});
	const consoleOutput = setupConsoleOutput({
		element: element.querySelector<HTMLDivElement>('.stylelint-demo-console')!,
	});

	consoleOutput.clear();
	consoleOutput.appendLine('Setup...');

	const warningsPanel = setupWarningsPanel({
		element: element.querySelector<HTMLDivElement>('.stylelint-demo-warnings')!,
	});
	const [codeEditor, configEditor, depsEditor, linter, monaco] = await Promise.all([
		setupCodeEditor({
			element: element.querySelector<HTMLDivElement>('.stylelint-demo-code')!,
			listeners: {
				onChangeValue: debounce(async (value) => {
					listeners?.onChange?.({
						code: value,
						fileName: codeEditor.getFileName(),
						config: configEditor.getValue(),
						configFormat: configEditor.getFormat(),
						deps: depsEditor.getValue(),
					});
					lint({
						code: value,
						fileName: codeEditor.getFileName(),
						config: configEditor.getValue(),
						configFormat: configEditor.getFormat(),
					});
				}),
				onChangeFileName: debounce(async (value) => {
					listeners?.onChange?.({
						code: codeEditor.getLeftValue(),
						fileName: value,
						config: configEditor.getValue(),
						configFormat: configEditor.getFormat(),
						deps: depsEditor.getValue(),
					});
					lint({
						code: codeEditor.getLeftValue(),
						fileName: value,
						config: configEditor.getValue(),
						configFormat: configEditor.getFormat(),
					});
				}),
			},
			init: { value: init?.code, fileName: init?.fileName },
		}),
		setupConfigEditor({
			element: element.querySelector<HTMLDivElement>('.stylelint-demo-config')!,
			listeners: {
				onChangeValue: debounce(async (value) => {
					listeners?.onChange?.({
						code: codeEditor.getLeftValue(),
						fileName: codeEditor.getFileName(),
						config: value,
						configFormat: configEditor.getFormat(),
						deps: depsEditor.getValue(),
					});
					lint({
						code: codeEditor.getLeftValue(),
						fileName: codeEditor.getFileName(),
						config: value,
						configFormat: configEditor.getFormat(),
					});
				}),
				onChangeFormat(format) {
					listeners?.onChange?.({
						code: codeEditor.getLeftValue(),
						fileName: codeEditor.getFileName(),
						config: configEditor.getValue(),
						configFormat: format,
						deps: depsEditor.getValue(),
					});
					lint({
						code: codeEditor.getLeftValue(),
						fileName: codeEditor.getFileName(),
						config: configEditor.getValue(),
						configFormat: format,
					});
				},
			},
			init: { value: init?.config, format: init?.configFormat },
		}),
		setupDepsEditor({
			element: element.querySelector<HTMLDivElement>('.stylelint-demo-deps')!,
			listeners: {
				onChangeValue: debounce(async (value) => {
					try {
						await linter.updateDependencies(JSON.parse(value));
					} catch (e) {
						outputTabs.setChecked('console');
						consoleOutput.clear();
						consoleOutput.appendLine((e as Error).message);

						return;
					}

					listeners?.onChange?.({
						code: codeEditor.getLeftValue(),
						fileName: codeEditor.getFileName(),
						config: configEditor.getValue(),
						configFormat: configEditor.getFormat(),
						deps: value,
					});

					await linter.reinstall();
					lint({
						code: codeEditor.getLeftValue(),
						fileName: codeEditor.getFileName(),
						config: configEditor.getValue(),
						configFormat: configEditor.getFormat(),
					});
				}),
			},
			init: { value: init?.deps },
		}),
		setupLinter({ consoleOutput, outputTabs }),
		loadMonacoEditor(),
	]);

	let seq = 0;

	try {
		await linter.updateDependencies(JSON.parse(depsEditor.getValue()));
	} catch (e) {
		outputTabs.setChecked('console');
		consoleOutput.clear();
		consoleOutput.appendLine((e as Error).message);

		return;
	}

	lint({
		code: codeEditor.getLeftValue(),
		fileName: codeEditor.getFileName(),
		config: configEditor.getValue(),
		configFormat: configEditor.getFormat(),
	});

	async function lint({
		code,
		fileName,
		config,
		configFormat,
	}: {
		code: string;
		fileName: string;
		config: string;
		configFormat: ConfigFormat;
	}) {
		const version = seq++;

		codeEditor.setRightValue(code);
		codeEditor.setLeftMarkers([]);
		codeEditor.setRightMarkers([]);
		const result = await linter.lint({ version, code, fileName, config, configFormat });

		if (result.version > version) {
			// Overtaken by the next linting
			return;
		}

		warningsPanel.setResult(result);
		outputTabs.setChecked('warnings');

		if (result.exit !== 0) {
			return;
		}

		codeEditor.setLeftMarkers(result.result.warnings.map(messageToMarker));
		codeEditor.setRightMarkers(result.fixResult.warnings.map(messageToMarker));
		codeEditor.setRightValue(result.output);
	}

	function messageToMarker(warning: Warning): editor.IMarkerData {
		const startLineNumber = ensurePositiveInt(warning.line, 1);
		const startColumn = ensurePositiveInt(warning.column, 1);
		const endLineNumber = ensurePositiveInt(warning.endLine, startLineNumber);
		const endColumn = ensurePositiveInt(warning.endColumn, startColumn);
		const docUrl = `https://stylelint.io/user-guide/rules/${warning.rule}`;
		const code = docUrl
			? { value: warning.rule, link: docUrl, target: docUrl }
			: warning.rule || 'FATAL';

		return {
			code: code as any,
			severity:
				warning.severity === 'warning'
					? monaco.MarkerSeverity.Warning
					: monaco.MarkerSeverity.Error,
			source: 'stylelint',
			message: warning.text,
			startLineNumber,
			startColumn,
			endLineNumber,
			endColumn,
		};
	}

	/**
	 * Ensure that a given value is a positive value.
	 * @param value The value to check.
	 * @param defaultValue The default value which is used if the `value` is undefined.
	 * @returns {number} The positive value as the result.
	 */
	function ensurePositiveInt(value: number | undefined, defaultValue: number) {
		return Math.max(1, (value !== undefined ? value : defaultValue) | 0);
	}
}
