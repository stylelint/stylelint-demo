import './demo.css';
import type { ConfigFormat } from './components/config-editor';
import type { LinterServiceResultSuccess } from './linter-service';
import type { PackageJsonData } from './components/deps-editor';
import type { Warning } from 'stylelint';
import { debounce } from './utils/debounce';
import type { editor } from 'monaco-editor';
import html from './demo.html?raw';
import { loadMonaco } from './monaco-editor';
import { setupCodeEditor } from './components/code-editor';
import { setupConfigEditor } from './components/config-editor';
import { setupConsoleOutput } from './components/console';
import { setupDepsEditor } from './components/deps-editor';
import { setupLintServer } from './linter-service';
import { setupTabs } from './components/output-tabs';
import { setupWarningsPanel } from './components/warnings';

export type InputValues = {
	/** Code text to lint. */
	code: string;
	/** The file name of the code. */
	fileName: string;
	/** Config text. */
	config: string;
	/** Config text format. */
	configFormat: ConfigFormat;
	/** Dependency packages text. */
	deps: string;
};

export type MountOptions = {
	/** Specify a target element to mount the Stylelint demo. */
	element: HTMLElement;
	/** Specify the initial values used for the demo. */
	init?: Partial<InputValues>;
	/** Event listeners. */
	listeners?: {
		/** Notifies that the input values have changed. */
		onChange?: (values: InputValues) => void;
	};
};

/**
 * Mount the Stylelint demo.
 */
export async function mount({ element, init, listeners }: MountOptions) {
	element.innerHTML = html;

	const inputTabs = setupTabs({
		element: element.querySelector<HTMLDivElement>('.sd-input-tabs')!,
	});
	const outputTabs = setupTabs({
		element: element.querySelector<HTMLDivElement>('.sd-output-tabs')!,
	});
	const consoleOutput = setupConsoleOutput({
		element: element.querySelector<HTMLDivElement>('.sd-console-xterm-wrapper')!,
	});

	consoleOutput.clear();
	consoleOutput.appendLine('Setup...');

	const warningsPanel = setupWarningsPanel({
		element: element.querySelector<HTMLDivElement>('.sd-warnings')!,
		listeners: {
			onClickWaning(warning) {
				const editor = codeEditor.getLeftEditor();

				// Focus on the warning part.
				editor.setSelection({
					startLineNumber: warning.line,
					startColumn: warning.column,
					endLineNumber: warning.endLine ?? warning.line,
					endColumn: warning.endColumn ?? warning.column,
				});
				editor.revealLineInCenter(warning.line);

				inputTabs.setChecked('code');
			},
		},
	});
	const [codeEditor, configEditor, depsEditor, lintServer, monaco] = await Promise.all([
		setupCodeEditor({
			element: element.querySelector<HTMLDivElement>('.sd-code')!,
			listeners: {
				onChangeValue: debounce(async (value) => {
					onChangeValues({
						code: value,
					});
				}),
				onChangeFileName: debounce(async (fileName) => {
					onChangeValues({
						fileName,
					});
				}),
			},
			init: { value: init?.code, fileName: init?.fileName },
		}),
		setupConfigEditor({
			element: element.querySelector<HTMLDivElement>('.sd-config')!,
			listeners: {
				onChangeValue: debounce(async (value) => {
					onChangeValues({
						config: value,
					});
				}),
				onChangeFormat: debounce((format) => {
					onChangeValues({
						configFormat: format,
					});
				}),
			},
			init: { value: init?.config, format: init?.configFormat },
		}),
		setupDepsEditor({
			element: element.querySelector<HTMLDivElement>('.sd-deps')!,
			listeners: {
				onChangeValue: debounce(async (value) => {
					if (!(await updateDependencies(value))) {
						return;
					}

					listeners?.onChange?.({
						code: codeEditor.getLeftValue(),
						fileName: codeEditor.getFileName(),
						config: configEditor.getValue(),
						configFormat: configEditor.getFormat(),
						deps: value,
					});

					consoleOutput.clear();
					await lintServer.install();
					updateInstalledPackages();
					await lintServer.restart();
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
		setupLintServer({ consoleOutput, outputTabs }),
		loadMonaco(),
	]);

	let seq = 0;

	if (await updateDependencies(depsEditor.getValue())) {
		await lintServer.install();
		updateInstalledPackages();
		lint({
			code: codeEditor.getLeftValue(),
			fileName: codeEditor.getFileName(),
			config: configEditor.getValue(),
			configFormat: configEditor.getFormat(),
		});
	}

	return {
		async dispose() {
			codeEditor.disposeEditor();
			configEditor.disposeEditor();
			depsEditor.disposeEditor();
			await lintServer.teardown();
			element.innerHTML = '';
		},
	};

	async function updateDependencies(deps: string) {
		try {
			await lintServer.updateDependencies(JSON.parse(deps));

			return true;
		} catch (e) {
			outputTabs.setChecked('console');
			consoleOutput.clear();
			consoleOutput.appendLine((e as Error).message);

			return false;
		}
	}

	/** Read the actual installed packages and display version information. */
	async function updateInstalledPackages() {
		const depsText = depsEditor.getValue();

		let deps = {};

		try {
			deps = JSON.parse(depsText);
		} catch (e) {
			console.warn(e);
		}

		const packages: PackageJsonData[] = [];

		for (const packageName of Object.keys(deps)) {
			try {
				const json = await lintServer.readFile(`/node_modules/${packageName}/package.json`);
				const packageJson = JSON.parse(json);

				packages.push(packageJson);
			} catch (e) {
				console.warn(e);
			}
		}

		depsEditor.setPackages(packages);
	}

	/** Handle input values change events. */
	function onChangeValues({
		code = codeEditor.getLeftValue(),
		fileName = codeEditor.getFileName(),
		config = configEditor.getValue(),
		configFormat = configEditor.getFormat(),
	}: {
		code?: string;
		fileName?: string;
		config?: string;
		configFormat?: ConfigFormat;
	}) {
		listeners?.onChange?.({
			code,
			fileName,
			config,
			configFormat,
			deps: depsEditor.getValue(),
		});
		lint({
			code,
			fileName,
			config,
			configFormat,
		});
	}

	/** Run the linting and display the results in the results panel and as markers in the editor. */
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
		const result = await lintServer.lint({ version, code, fileName, config, configFormat });

		if (result.version > version) {
			// Overtaken by the next linting
			return;
		}

		warningsPanel.setResult(result);
		outputTabs.setChecked('warnings');

		if (result.returnCode !== 0) {
			return;
		}

		codeEditor.setLeftMarkers(
			result.result.warnings.map((w) => messageToMarker(w, result.ruleMetadata)),
		);
		codeEditor.setRightMarkers(
			result.fixResult.warnings.map((w) => messageToMarker(w, result.ruleMetadata)),
		);
		codeEditor.setRightValue(result.output);
	}

	function messageToMarker(
		warning: Warning,
		ruleMetadata: LinterServiceResultSuccess['ruleMetadata'],
	): editor.IMarkerData {
		const startLineNumber = warning.line;
		const startColumn = warning.column;
		const endLineNumber = warning.endLine ?? startLineNumber;
		const endColumn = warning.endColumn ?? startColumn;
		const meta = ruleMetadata[warning.rule];
		const docUrl = meta?.url;
		const code = docUrl
			? {
					value: warning.rule,
					target:
						// Maybe monaco type bug
						docUrl as any,
			  }
			: warning.rule || 'FATAL';

		return {
			code,
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
}
