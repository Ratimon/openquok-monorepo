/** @type {import('jest').Config} */
module.exports = {
	rootDir: 'src',
	testEnvironment: 'node',
	testMatch: ['**/*.test.ts'],
	transform: {
		'^.+\\.ts$': [
			'ts-jest',
			{
				diagnostics: { ignoreCodes: [151002] },
				tsconfig: {
					module: 'ESNext',
					moduleResolution: 'bundler',
					types: ['node', 'jest'],
					typeRoots: ['../backend/node_modules/@types', '../node_modules/@types'],
				},
			},
		],
	},
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	moduleFileExtensions: ['ts', 'js'],
};
