import { defineConfig } from "tsup";

export default defineConfig({
	// Vercel's rewrite destination `/api` resolves to api/index.js — that file must exist.
	// api/[[...path]].js is the optional catch-all so /api/v1/* reaches Express (index alone would not).
	entry: {
		"api/index": "handler/index.ts",
		"api/[[...path]]": "handler/index.ts",
	},
	format: ["cjs"],
	outDir: ".",
	outExtension: () => ({ js: ".js" }),
	splitting: false,
	clean: false,
	target: "node20",
	platform: "node",
	/** Workspace packages are ESM (`"type": "module"`); CJS output must not `require()` them — bundle them in. */
	noExternal: ["openquok-common"],
	external: [
		"fs",
		"path",
		"http",
		"https",
		"crypto",
		"stream",
		"url",
		"util",
		"events",
		"buffer",
		"querystring",
		"os",
		"net",
		"tls",
		"zlib",
		"child_process",
		"cluster",
		"dgram",
		"dns",
		"readline",
		"repl",
		"tty",
		"v8",
		"vm",
		"worker_threads",
		"assert",
		"async_hooks",
		"console",
		"constants",
		"domain",
		"inspector",
		"module",
		"perf_hooks",
		"process",
		"punycode",
		"string_decoder",
		"sys",
		"timers",
		"trace_events",
		"wasi",
	],
	treeshake: true,
	sourcemap: false,
	tsconfig: "tsconfig.json",
	/**
	 * Lets ESM-only helpers (e.g. `readImportMetaUrl`) gate on a bundler-substituted constant so
	 * esbuild can dead-code-eliminate their `eval("import.meta.url")` fallback inside this CJS
	 * bundle. tsc and ts-jest leave the expression as a normal `process.env` read at runtime
	 * (undefined -> falsy), preserving the ESM/CJS-test code paths unchanged.
	 */
	env: {
		__TSUP_BUNDLE__: "true",
	},
	/**
	 * esbuild's `direct-eval` warning is emitted during parsing, before define-based dead-code
	 * elimination runs. We've verified the `eval("import.meta.url")` call is removed from the
	 * emitted CJS bundle (it lives behind a `process.env.__TSUP_BUNDLE__` gate that resolves to
	 * `true` here), so silencing the parser-side warning is safe and not a real risk.
	 */
	esbuildOptions(options) {
		options.logOverride = {
			...(options.logOverride ?? {}),
			"direct-eval": "silent",
		};
	},
	banner: {
		js: "/* Bundled by tsup for Vercel */",
	},
});
