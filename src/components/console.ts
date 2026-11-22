import '@xterm/xterm/css/xterm.css';
import { type ITheme, Terminal } from '@xterm/xterm';
import { type ThemeName, getPreferredThemeName } from '../monaco-editor/const';
import { FitAddon } from '@xterm/addon-fit';
import { themes } from '../monaco-editor/themes';

export type ConsoleOutput = {
	appendLine: (string: string) => void;
	append: (string: string) => void;
	clear: () => void;
	setTheme: (themeName: ThemeName) => void;
	setFontFamily: (fontFamily: string) => void;
};
export type ConsoleOutputOptions = {
	/** Specify a target element to set up the console output. */
	element: HTMLElement;
};

/** Setup a console output component. */
export function setupConsoleOutput({ element }: ConsoleOutputOptions): ConsoleOutput {
	const term = new Terminal({
		fontSize: 12,
		theme: getTheme(getPreferredThemeName()),
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
		setTheme: (themeName) => {
			term.options.theme = getTheme(themeName);
		},
		setFontFamily: (fontFamily) => {
			term.options.fontFamily = fontFamily;
			fitAddon.fit();
		},
	};

	return consoleOutput;
}

function getTheme(themeName: ThemeName): ITheme {
	const colors: Record<string, string | undefined> = themes[themeName].colors;

	return {
		background: colors['terminal.background'] ?? colors['panel.background'],
		foreground: colors['terminal.foreground'],
		selectionBackground: colors['terminal.selectionBackground'],
		scrollbarSliderBackground: colors['scrollbarSlider.background'],
		scrollbarSliderHoverBackground: colors['scrollbarSlider.hoverBackground'],
		scrollbarSliderActiveBackground: colors['scrollbarSlider.activeBackground'],
	};
}
