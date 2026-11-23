export const DARK_THEME_NAME = 'dark-2026';
export const LIGHT_THEME_NAME = 'light-2026';

export type ThemeName = typeof DARK_THEME_NAME | typeof LIGHT_THEME_NAME;

export function getPreferredThemeName(): ThemeName {
	return window.matchMedia('(prefers-color-scheme: dark)').matches
		? DARK_THEME_NAME
		: LIGHT_THEME_NAME;
}
