import type { UserConfigFn } from 'vite';
import baseConfig from './vite.config';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import pkg from './package.json';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async (env) => {
	const base = await (baseConfig as UserConfigFn)(env);

	return {
		...base,
		build: {
			...base.build,
			lib: {
				entry: path.resolve(dirname, './src/demo.ts'),
				fileName: 'stylelint-demo',
				formats: ['es'],
			},
			rollupOptions: {
				external: Object.keys(pkg.dependencies),
			},
			outDir: 'dist/lib',
		},
	};
});
