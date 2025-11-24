import '@xterm/xterm/css/xterm.css';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
export type ConsoleOutput = {
	appendLine: (string: string) => void;
	append: (string: string) => void;
	clear: () => void;
};
export type ConsoleOutputOptions = {
	/** Specify a target element to set up the console output. */
	element: HTMLElement;
};

/** Setup a console output component. */
export function setupConsoleOutput({ element }: ConsoleOutputOptions): ConsoleOutput {
	const elementStyle = window.getComputedStyle(element);
	const term = new Terminal({
		fontSize: 12,
		theme: {
			background: elementStyle.backgroundColor,
			foreground: elementStyle.color,
		},
	});
	const fitAddon = new FitAddon();

	term.loadAddon(fitAddon);
	term.open(element);

	const resizeObserver = new ResizeObserver(() => {
		if (element.clientWidth) {
			fitAddon.fit();
		}
	});

	resizeObserver.observe(element);
	fitAddon.fit();

	const consoleOutput: ConsoleOutput = {
		appendLine: (string: string) => {
			term.writeln(string);
		},
		append: (string: string) => {
			term.write(string);
		},
		clear: () => {
			term.clear();
		},
	};

	return consoleOutput;
}
