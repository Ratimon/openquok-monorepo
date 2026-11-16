import fs from 'node:fs';
import path from 'node:path';

const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';

/**
 * @typedef {Object} VercelRouteRule
 * @property {string} [src]
 * @property {string} [dest]
 * @property {string} [handle]
 * @property {number} [status]
 * @property {Record<string, string>} [headers]
 */

/**
 * @typedef {Object} VercelBuildOutputConfig
 * @property {VercelRouteRule[]} [routes]
 * @property {Record<string, { path?: string, contentType?: string }>} [overrides]
 */

/**
 * @param {unknown} route
 * @returns {route is VercelRouteRule}
 */
function isVercelRouteRule(route) {
	return typeof route === 'object' && route !== null;
}

/**
 * Kit only treats `content-type === 'text/html'` (exact) as HTML during prerender.
 * If a `handle` hook adds `charset=utf-8`, pages are written extensionless and registered
 * as assets — Vercel then serves them as `application/octet-stream` downloads.
 *
 * Normalize those files to `*.html` and move them onto `prerendered.pages` before
 * adapter-vercel writes Build Output overrides.
 *
 * @param {import('@sveltejs/kit').Builder} builder
 */
function repairPrerenderedHtmlPages(builder) {
	const pagesRoot = `${builder.config.kit.outDir}/output/prerendered/pages`;
	if (!fs.existsSync(pagesRoot)) return;

	/** @param {string} decodedPath */
	function htmlOutputFile(decodedPath) {
		const file = decodedPath.slice(1) || 'index.html';
		if (file.endsWith('.html')) return file;
		return file.endsWith('/') ? `${file}index.html` : `${file}.html`;
	}

	/** @param {string} fromRelative @param {string} toRelative */
	function renamePrerenderedFile(fromRelative, toRelative) {
		if (fromRelative === toRelative) return;
		const fromAbs = path.join(pagesRoot, fromRelative);
		const toAbs = path.join(pagesRoot, toRelative);
		if (!fs.existsSync(fromAbs) || fs.existsSync(toAbs)) return;
		fs.mkdirSync(path.dirname(toAbs), { recursive: true });
		fs.renameSync(fromAbs, toAbs);
	}

	for (const [decodedPath, asset] of [...builder.prerendered.assets]) {
		const type = typeof asset.type === 'string' ? asset.type.toLowerCase() : '';
		if (!type.startsWith('text/html')) continue;

		const htmlFile = htmlOutputFile(decodedPath);
		const extensionlessFile = decodedPath.slice(1) || 'index.html';
		renamePrerenderedFile(extensionlessFile, htmlFile);

		builder.prerendered.assets.delete(decodedPath);
		builder.prerendered.pages.set(decodedPath, { file: htmlFile });
	}

	/** @param {string} dir @param {string} relativeDir */
	function walkExtensionlessHtml(dir, relativeDir = '') {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
			const absolutePath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				walkExtensionlessHtml(absolutePath, relativePath);
				continue;
			}
			if (!entry.isFile() || entry.name.includes('.')) continue;

			const head = fs.readFileSync(absolutePath, { encoding: 'utf8' }).slice(0, 256);
			if (!/<!doctype html|<html[\s>]/i.test(head)) continue;

			const decodedPath = `/${relativePath}`;
			if (builder.prerendered.pages.has(decodedPath)) continue;

			const htmlFile = `${relativePath}.html`;
			renamePrerenderedFile(relativePath, htmlFile);
			builder.prerendered.assets.delete(decodedPath);
			builder.prerendered.pages.set(decodedPath, { file: htmlFile });
		}
	}

	walkExtensionlessHtml(pagesRoot);
}

/**
 * adapter-vercel emits one rewrite + one 308 redirect per prerendered page for trailing-slash
 * normalization (SvelteKit adapter-vercel). At ~1k prerendered URLs
 * that exceeds Vercel's 2,048 route cap. A single pattern rule preserves trailingSlash `never`
 * behavior (canonical URLs without a slash; slash suffix 308) without per-page route rows.
 *
 * @param {VercelRouteRule} route
 */
function isPrerenderSlashRewriteRoute(route) {
	return (
		!route.handle &&
		route.status == null &&
		typeof route.src === 'string' &&
		typeof route.dest === 'string' &&
		route.dest === `${route.src}/`
	);
}

/** @param {VercelRouteRule} route */
function isPrerenderSlashRedirectRoute(route) {
	const location = route.headers?.Location;
	return (
		!route.handle &&
		route.status === 308 &&
		typeof route.src === 'string' &&
		typeof location === 'string' &&
		route.src === `${location}/`
	);
}

/** @param {unknown} route */
export function isPrerenderTrailingSlashPairRoute(route) {
	return (
		isVercelRouteRule(route) &&
		(isPrerenderSlashRewriteRoute(route) || isPrerenderSlashRedirectRoute(route))
	);
}

/** @type {VercelRouteRule} */
const COLLAPSED_TRAILING_SLASH_REDIRECT = {
	src: '/(.*)/$',
	status: 308,
	headers: { Location: '/$1' }
};

/**
 * @param {VercelBuildOutputConfig} config
 * @returns {{ config: VercelBuildOutputConfig, removed: number, collapsed: boolean }}
 */
export function collapsePrerenderTrailingSlashRoutes(config) {
	if (!Array.isArray(config.routes) || config.routes.length === 0) {
		return { config, removed: 0, collapsed: false };
	}

	const routes = config.routes.filter(isVercelRouteRule);
	const pairs = routes.filter(isPrerenderTrailingSlashPairRoute);
	const rewriteCount = pairs.filter(isPrerenderSlashRewriteRoute).length;
	const redirectCount = pairs.filter(isPrerenderSlashRedirectRoute).length;

	// Require a large paired block from adapter-vercel static config — do not strip lone redirects.
	if (rewriteCount < 8 || redirectCount < 8 || rewriteCount !== redirectCount) {
		return { config, removed: 0, collapsed: false };
	}

	const remaining = config.routes.filter(
		(route) => isVercelRouteRule(route) && !isPrerenderTrailingSlashPairRoute(route)
	);
	const alreadyCollapsed = remaining.some(
		(route) =>
			isVercelRouteRule(route) &&
			route.status === COLLAPSED_TRAILING_SLASH_REDIRECT.status &&
			route.src === COLLAPSED_TRAILING_SLASH_REDIRECT.src
	);

	if (alreadyCollapsed) {
		return { config, removed: 0, collapsed: false };
	}

	return {
		config: { ...config, routes: [COLLAPSED_TRAILING_SLASH_REDIRECT, ...remaining] },
		removed: pairs.length,
		collapsed: true
	};
}

/** Pin HTML content-type on Build Output overrides so CDN never falls back to octet-stream. */
function patchVercelOutputConfig() {
	const configPath = path.resolve('.vercel/output/config.json');
	if (!fs.existsSync(configPath)) return;

	/** @type {VercelBuildOutputConfig} */
	let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

	let changed = false;

	if (config.overrides && typeof config.overrides === 'object') {
		for (const [overrideFile, override] of Object.entries(config.overrides)) {
			if (!overrideFile.endsWith('.html')) continue;
			if (override?.contentType === HTML_CONTENT_TYPE) continue;
			config.overrides[overrideFile] = {
				...override,
				contentType: HTML_CONTENT_TYPE
			};
			changed = true;
		}
	}

	const { config: nextConfig, collapsed } = collapsePrerenderTrailingSlashRoutes(config);
	if (collapsed) {
		config = nextConfig;
		changed = true;
	}

	if (changed) {
		fs.writeFileSync(configPath, `${JSON.stringify(config, null, '\t')}\n`);
	}
}

/**
 * @param {() => import('@sveltejs/kit').Adapter} createAdapter
 * @returns {import('@sveltejs/kit').Adapter}
 */
export function adapterVercelWithoutPrerenderDeps(createAdapter) {
	const base = createAdapter();

	return {
		name: base.name,
		/** @param {import('@sveltejs/kit').Builder} builder */
		async adapt(builder) {
			const deps = `${builder.config.kit.outDir}/output/prerendered/dependencies`;
			if (fs.existsSync(deps)) {
				fs.rmSync(deps, { recursive: true, force: true });
			}
			repairPrerenderedHtmlPages(builder);
			await base.adapt(builder);
			patchVercelOutputConfig();
		}
	};
}
