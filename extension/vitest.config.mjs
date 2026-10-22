import path from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('vitest/config').UserConfig} */
export default {
	root: extensionDir,
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.ts'],
		passWithNoTests: false,
		testTimeout: 15_000
	},
	resolve: {
		alias: {
			'openquok-common': path.join(extensionDir, '../common/src/index.ts')
		}
	}
};
