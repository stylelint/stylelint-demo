import type { LintResult, RuleMeta } from 'stylelint';
import type { ConfigFormat } from '../components/config-editor.js';
import type { ConsoleOutput } from '../components/console';
import type { FileSystemTree } from '@webcontainer/api';
import { Installer } from './installer';
import { Server } from './server';
import type { Tabs } from '../components/output-tabs';
import { WebContainer } from '@webcontainer/api';

export type LinterServiceResult = LinterServiceResultSuccess | LinterServiceResultError;
export type LinterServiceResultSuccess = {
	version: number;
	exit: 0;
	result: LintResult;
	fixResult: LintResult;
	output: string;
	ruleMetadata: { [ruleName: string]: Partial<RuleMeta> };
};
export type LinterServiceResultError = {
	version: number;
	exit: 1;
	result: string;
};
export type LintInput = {
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
	/** Install dependencies and restart the server. */
	reinstallAndRestart: () => Promise<void>;
}

/** Setup a linter service. */
export async function setupLinter({
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
		import.meta.glob('./server/**/*.mjs', { as: 'raw' }),
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

		return installer.install();
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
			if (!installer.haveRunInstallation()) {
				await installDeps();
			}

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
		async reinstallAndRestart() {
			await installDeps();
			await server.restart();
		},
	};
}

async function lint(server: Server, input: LintInput) {
	const content = await server.request(input, (content) => content.version >= input.version);

	return content;
}
