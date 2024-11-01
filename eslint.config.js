import globals from 'globals';
import stylelintConfig from 'eslint-config-stylelint';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: ['dist/*'],
	},
	...stylelintConfig,
	...tseslint.configs.recommended,
	{
		files: ['**/*.ts'],
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},
		rules: {
			'no-shadow': 'off',
			'no-use-before-define': 'off',
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'n/no-missing-import': 'off',
			'n/no-unpublished-import': 'off',
			'n/no-unsupported-features/es-syntax': 'off',
		},
	},
);
