import { type FileSystemTree, WebContainer } from '@webcontainer/api';
import type { LintResult, RuleMeta } from 'stylelint';
import type { ConfigFormat } from '../components/config-editor.js';
import type { ConsoleOutput } from '../components/console';
import { Installer } from './installer';
import { Server } from './server';
import type { Tabs } from '../components/output-tabs';

export type LinterServiceResult = LinterServiceResultSuccess | LinterServiceResultError;
export type LinterServiceResultSuccess = {
	version: number;
	returnCode: 0;
	result: LintResult;
	fixResult: LintResult;
	output: string;
	ruleMetadata: { [ruleName: string]: Partial<RuleMeta> };
};
export type LinterServiceResultError = {
	version: number;
	returnCode: 1;
	result: string;
};
export type LintInput = {
	/** Input version. Check if it matches the version returned. */
	version: number;
	code: string;
	fileName: string;
	config: string;
	configFormat: ConfigFormat;
};

export interface LinterService {
	/**
	 * Run linting.
	 * However, if called consecutively, it returns the result of the last call.
	 * Check the `version` and qualitatively check if it is the desired result.
	 */
	lint: (input: LintInput) => Promise<LinterServiceResult>;
	/** Update dependency packages. */
	updateDependencies: (pkg: any) => Promise<void>;
	/** Install dependencies. */
	install: () => Promise<void>;
	/** Restart the server. */
	restart: () => Promise<void>;
	/** Read a file in the server. */
	readFile: (path: string) => Promise<string>;

	teardown: () => Promise<void>;
}

/** Setup a linter service. */
export async function setupLintServer({
	consoleOutput,
	outputTabs,
}: {
	consoleOutput: ConsoleOutput;
	outputTabs: Tabs;
}): Promise<LinterService> {
	outputTabs.setChecked('console');
	consoleOutput.appendLine('Starting WebContainer...');

	const webContainer = await WebContainer.boot();
	const serverFiles: FileSystemTree = {};

	for (const [file, contents] of Object.entries(
		import.meta.glob('./server/**/*.mjs', { query: '?raw', import: 'default' }),
	).map(([file, load]) => {
		return [file.slice(9), load() as Promise<string>] as const;
	})) {
		serverFiles[file] = {
			file: {
				contents: await contents,
			},
		};
	}

	await webContainer.mount(serverFiles);

	let updatingDependencies = Promise.resolve();
	const installer = new Installer({ webContainer, consoleOutput, outputTabs });

	async function installDeps() {
		await updatingDependencies;

		const exitCode = await installer.install();

		if (exitCode !== 0) {
			throw new Error('Installation failed');
		}
	}

	const server = new Server({ webContainer, consoleOutput, outputTabs });

	let processing: Promise<void> | null = null;
	let next: (() => Promise<LinterServiceResult>) | null = null;
	let last: Promise<LinterServiceResult> | null = null;

	async function setLintProcess(
		run: () => Promise<LinterServiceResult>,
	): Promise<LinterServiceResult> {
		if (processing) {
			next = run;
			while (processing) {
				await processing;
			}

			return last!;
		}

		const promise = run();

		processing = promise.then(() => {
			processing = null;

			if (next) {
				setLintProcess(next);
				next = null;
			}
		});
		last = promise;

		return promise;
	}

	return {
		async lint(input: LintInput) {
			const exitCode = await installer.getExitCode();

			if (exitCode !== 0) {
				throw new Error('Installation failed');
			}

			// Returns the result of the last linting process.
			return setLintProcess(() => lint(server, input));
		},
		async updateDependencies(deps) {
			updatingDependencies = webContainer.fs.writeFile(
				'/package.json',
				JSON.stringify({ devDependencies: deps }, null, 2),
			);
			await updatingDependencies;
		},
		async install() {
			await installDeps();
		},
		async restart() {
			await server.restart();
		},
		readFile: async (path) => {
			return webContainer.fs.readFile(path, 'utf8');
		},

		async teardown() {
			webContainer.teardown();
		},
	};
}

async function lint(server: Server, input: LintInput) {
	const content = await server.request(input, (content) => content.version >= input.version);

	return content;
}
