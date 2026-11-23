import { DARK_THEME_NAME, LIGHT_THEME_NAME } from '../const';
import darkTheme from './dark-2026.json' with { type: 'json' };
import lightTheme from './light-2026.json' with { type: 'json' };

export const themes = {
	[DARK_THEME_NAME]: { name: DARK_THEME_NAME, type: 'dark', ...darkTheme },
	[LIGHT_THEME_NAME]: { name: LIGHT_THEME_NAME, type: 'light', ...lightTheme },
} as const;
