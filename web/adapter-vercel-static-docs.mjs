import fs from 'node:fs';
import path from 'node:path';

const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';

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

/** Pin HTML content-type on Build Output overrides so CDN never falls back to octet-stream. */
function pinHtmlOverrideContentTypes() {
	const configPath = path.resolve('.vercel/output/config.json');
	if (!fs.existsSync(configPath)) return;

	const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
	if (!config.overrides || typeof config.overrides !== 'object') return;

	let changed = false;
	for (const [overrideFile, override] of Object.entries(config.overrides)) {
		if (!overrideFile.endsWith('.html')) continue;
		if (override?.contentType === HTML_CONTENT_TYPE) continue;
		config.overrides[overrideFile] = {
			...override,
			contentType: HTML_CONTENT_TYPE
		};
		changed = true;
	}

	if (changed) {
		fs.writeFileSync(configPath, `${JSON.stringify(config, null, '\t')}\n`);
	}
}

export function adapterVercelWithoutPrerenderDeps(createAdapter) {
	const base = createAdapter();

	return {
		name: base.name,
		async adapt(builder) {
			const deps = `${builder.config.kit.outDir}/output/prerendered/dependencies`;
			if (fs.existsSync(deps)) {
				fs.rmSync(deps, { recursive: true, force: true });
			}
			repairPrerenderedHtmlPages(builder);
			await base.adapt(builder);
			pinHtmlOverrideContentTypes();
		}
	};
}
