import type { IDisposable, IRange, editor } from 'modern-monaco/editor-core';
import defaultDeps from './defaults/deps.json?raw';
import { loadMonaco } from '../monaco-editor/monaco-loader.js';
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
export type PackageJsonData = { name: string; version: string; homepage?: string };
/** Setup a dependencies editor component. */
export async function setupDepsEditor({ element, listeners, init }: DepsEditorOptions) {
	const monaco = await loadMonaco();
	const monacoEditor = await setupMonacoEditor({
		element: element.querySelector('sd-deps-monaco')!,
		init: {
			language: 'json',
			fileName: 'package-dependencies.json',
			value: init?.value ?? defaultDeps,
		},
		listeners,
		useDiffEditor: false,
	});
	const standaloneEditor = monacoEditor.getEditor();
	const model = standaloneEditor.getModel()!;
	const installedVersions = standaloneEditor.createDecorationsCollection();

	let installedPackages: PackageJsonData[] = [];
	let linkProvider: IDisposable | undefined;

	standaloneEditor.onDidChangeModelContent(() => installedVersions.clear());

	return {
		...monacoEditor,
		setPackages(packages: PackageJsonData[]) {
			if (model.isDisposed()) return;

			installedPackages = packages;
			installedVersions.set(
				findDependencies(model, packages).map(({ pkg, ranges }) =>
					createInstalledVersion(ranges.entry, pkg.version),
				),
			);

			linkProvider?.dispose();
			linkProvider = monaco.languages.registerLinkProvider('json', {
				provideLinks: (linkedModel) => ({
					links:
						linkedModel === model
							? findDependencies(model, packages).map(({ pkg, ranges }) => ({
									range: ranges.name,
									url: getPackageUrl(pkg),
								}))
							: [],
				}),
			});
		},
		getPackages() {
			return installedPackages;
		},
		disposeEditor() {
			linkProvider?.dispose();
			monacoEditor.disposeEditor();
		},
	};
}

function findDependencies(model: editor.ITextModel, packages: PackageJsonData[]) {
	return packages.flatMap((pkg) => {
		const ranges = findDependencyRanges(model, pkg.name);

		return ranges ? [{ pkg, ranges }] : [];
	});
}

function findDependencyRanges(model: editor.ITextModel, name: string) {
	for (const { range } of model.findMatches(`"${name}"`, false, false, true, null, false)) {
		const lineNumber = range.endLineNumber;
		const version = /^\s*:\s*"[^"]*"\s*,?/.exec(
			model.getLineContent(lineNumber).slice(range.endColumn - 1),
		);

		if (version) {
			return {
				name: range
					.setStartPosition(lineNumber, range.startColumn + 1)
					.setEndPosition(lineNumber, range.endColumn - 1),
				entry: range.setEndPosition(lineNumber, range.endColumn + version[0].length),
			};
		}
	}

	return undefined;
}

function createInstalledVersion(range: IRange, version: string): editor.IModelDeltaDecoration {
	return {
		range,
		options: {
			after: {
				content: `\u00a0\u00a0${version} installed`,
				inlineClassName: 'sd-installed-version',
			},
		},
	};
}

function getPackageUrl({ name, homepage }: PackageJsonData) {
	return homepage || `https://www.npmjs.com/package/${name}`;
}
