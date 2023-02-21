import type { FileSystemTree, WebContainerProcess } from '@webcontainer/api';
import { createJsonPayload, extractJson } from './server/extract-json.mjs';
import type { ConfigFormat } from '../components/config-editor.js';
import type { ConsoleOutput } from '../components/console';
import type { LintResult } from 'stylelint';
import type { Tab } from '../components/output-tabs';
import { WebContainer } from '@webcontainer/api';

export type LinterServiceResult = LinterServiceResultSuccess | LinterServiceResultError;
export type LinterServiceResultSuccess = {
	version: number;
	exit: 0;
	result: LintResult;
	fixResult: LintResult;
	output: string;
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
	lint: (input: LintInput) => Promise<LinterServiceResult>;
	updateDependencies: (pkg: any) => Promise<void>;
	reinstall: () => Promise<void>;
}

export async function setupLinter({
	consoleOutput,
	outputTabs,
}: {
	consoleOutput: ConsoleOutput;
	outputTabs: Tab;
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
	let installProcess: Promise<WebContainerProcess> | null = null;

	async function installDeps() {
		if (installProcess != null) {
			(await installProcess).kill();
		}

		await updatingDependencies;
		outputTabs.setChecked('console');
		consoleOutput.appendLine('Installing dependencies...');
		installProcess = installDependencies(webContainer, consoleOutput);

		return installProcess;
	}

	const server = buildServer(webContainer, { consoleOutput, outputTabs });

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
			const exitCode = await (await (installProcess || installDeps())).exit;

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
		async reinstall() {
			await installDeps();
			await server.restart();
		},
	};
}

async function installDependencies(webContainer: WebContainer, consoleOutput: ConsoleOutput) {
	const installProcess = await webContainer.spawn('npm', ['install']);

	void installProcess.output.pipeTo(
		new WritableStream({
			write(data) {
				consoleOutput.append(data);
			},
		}),
	);
	installProcess.exit.then((exitCode) => {
		if (exitCode !== 0) {
			consoleOutput.appendLine('Installation failed');
		} else {
			consoleOutput.appendLine('Installation succeeded');
		}
	});

	return installProcess;
}

type Server = {
	request: (data: any, test: (res: any) => boolean) => Promise<any>;
	restart: () => Promise<void>;
};

function buildServer(
	webContainer: WebContainer,
	{
		consoleOutput,
		outputTabs,
	}: {
		consoleOutput: ConsoleOutput;
		outputTabs: Tab;
	},
): Server {
	let server: Awaited<ReturnType<typeof startServerInternal>> | null = null;

	let waitPromise = Promise.resolve(undefined as any);

	function restart() {
		return (waitPromise = waitPromise.then(async () => {
			if (server) {
				server.process.kill();
				await server.process.exit;
			}

			server = await startServerInternal();
		}));
	}

	return {
		async request(data, test) {
			return (waitPromise = waitPromise.then(async () => {
				if (!server) {
					server = await startServerInternal();
				}

				await server.ready;
				while (server.isExit) {
					await restart();
					await server.ready;
				}

				return server.request(data, test);
			}));
		},
		restart,
	};

	async function startServerInternal() {
		outputTabs.setChecked('console');
		consoleOutput.appendLine(server ? 'Restarting server...' : 'Starting server...');
		const serverProcess = await webContainer.spawn('node', ['./server.mjs']);

		let boot = false;
		const callbacks: ((json: string) => void)[] = [];

		serverProcess.output.pipeTo(
			new WritableStream({
				write(str) {
					if (!callbacks.length) {
						// eslint-disable-next-line no-console
						if (!boot) console.log(str);

						return;
					}

					const output = extractJson(str);

					if (!output) {
						// eslint-disable-next-line no-console
						if (!boot) console.log(str);

						return;
					}

					callbacks.forEach((f) => f(output));
				},
			}),
		);

		const writer = serverProcess.input.getWriter();

		async function request(data: any, test: (data: any) => boolean): Promise<string> {
			writer.write(createJsonPayload(data));

			return new Promise((resolve) => {
				const callback = (output: string) => {
					if (test(output)) {
						const i = callbacks.indexOf(callback);

						if (i > 0) callbacks.splice(i);

						resolve(output);
					}
				};

				callbacks.push(callback);
			});
		}

		const serverInternal = {
			process: serverProcess,
			request,
			ready: request('ok?', (res) => res === 'ok' || res === 'boot').then(() => {
				consoleOutput.appendLine('Server started');
				boot = true;
			}),
			isExit: false,
		};

		serverProcess.exit.then(() => {
			serverInternal.isExit = true;
		});

		return serverInternal;
	}
}

async function lint(server: Server, input: LintInput) {
	const content = await server.request(input, (content) => content.version >= input.version);

	return content;
}
