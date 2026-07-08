#!/usr/bin/env node
/**
 * Generate Routes Manifest
 *
 * Scans the SvelteKit routes directory and writes JSON for backend sitemap generation
 * when the web app tree is not available at runtime (e.g. production API host).
 *
 * Usage: pnpm backend:generate-routes-manifest
 * Output: backend/static/routes-manifest.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTES_DIR = path.join(__dirname, '../web/src/routes');
const WEB_CONSTANTS_DIR = path.join(__dirname, '../web/src/lib/content/constants');
const OUTPUT_FILE = path.join(__dirname, '../backend/static/routes-manifest.json');

const AGENT_HOST_PAGE_REGEX =
	/pageType:\s*['"]agent-host['"][\s\S]*?slug:\s*['"]([^'"]+)['"][\s\S]*?available:\s*(true|false)/g;

const CHANNEL_PAGE_REGEX =
	/slug:\s*['"]([^'"]+)['"],\s*\n\s*platformId:[\s\S]*?available:\s*(true|false)/g;

const EXCLUDED_PATTERNS = {
	includes: ['(protected)', '(auth)', 'not-found'],
	startsWith: ['_', '[']
};

const EXCLUDED_PATHS = ['sitemap.xml', 'robots.txt', 'api', 'favicon.ico'];

function scanRoutes(dirPath, previousFolder = '') {
	const routes = [];

	try {
		const dirents = fs.readdirSync(dirPath, { withFileTypes: true });

		for (const dirent of dirents) {
			if (!dirent.isDirectory()) continue;

			const dirName = dirent.name;

			if (
				EXCLUDED_PATTERNS.includes.some((pattern) => dirName.includes(pattern)) ||
				EXCLUDED_PATTERNS.startsWith.some((pattern) => dirName.startsWith(pattern)) ||
				EXCLUDED_PATHS.includes(dirName)
			) {
				continue;
			}

			const fullPath = path.join(dirPath, dirName);
			const isRouteGroup = dirName.match(/^\(.*\)$/);

			if (!isRouteGroup) {
				const routePath = previousFolder === '' ? `/${dirName}` : `/${previousFolder}/${dirName}`;

				if (
					!EXCLUDED_PATHS.some(
						(excluded) => routePath.includes(`/${excluded}`) || routePath === `/${excluded}`
					)
				) {
					routes.push({
						path: routePath,
						priority: 0.7,
						changeFreq: 'monthly',
						type: 'static'
					});
				}
			}

			const childRoutes = scanRoutes(
				fullPath,
				isRouteGroup ? previousFolder : previousFolder ? `${previousFolder}/${dirName}` : dirName
			);
			routes.push(...childRoutes);
		}
	} catch (error) {
		console.error(`Error reading directory ${dirPath}:`, error.message);
	}

	return routes;
}

function readCatalogDirFiles(dirPath) {
	if (!fs.existsSync(dirPath)) return [];

	const skip = new Set(['index.ts', 'types.ts', 'shared.ts', 'hub.ts', 'builders.ts']);

	return fs
		.readdirSync(dirPath, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.ts') && !skip.has(entry.name))
		.map((entry) => fs.readFileSync(path.join(dirPath, entry.name), 'utf-8'));
}

function extractMcpSeedSlugs(content) {
	const slugs = [];
	const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;

	for (const match of content.matchAll(slugRegex)) {
		if (match[1]) slugs.push(match[1]);
	}

	return slugs;
}

function extractAvailableSlugs(content, regex) {
	const slugs = [];

	for (const match of content.matchAll(regex)) {
		const slug = match[1];
		const available = match[2];
		if (slug && available === 'true') {
			slugs.push(slug);
		}
	}

	return slugs;
}

function extractPublicCatalogSlugs(constantsDir = WEB_CONSTANTS_DIR) {
	const agentFiles = readCatalogDirFiles(path.join(constantsDir, 'agents'));
	const channelFiles = readCatalogDirFiles(path.join(constantsDir, 'channels'));
	const mcpFiles = readCatalogDirFiles(path.join(constantsDir, 'mcps'));

	const agentHosts = agentFiles.flatMap((content) =>
		extractAvailableSlugs(content, AGENT_HOST_PAGE_REGEX)
	);
	const mcpClients = mcpFiles.flatMap((content) => extractMcpSeedSlugs(content));
	const channels = channelFiles.flatMap((content) =>
		extractAvailableSlugs(content, CHANNEL_PAGE_REGEX)
	);

	return {
		agents: [...new Set([...agentHosts, ...mcpClients])],
		channels: [...new Set(channels)]
	};
}

function publicCatalogSlugsToRoutes(catalog) {
	const routes = [];

	for (const slug of catalog.agents) {
		routes.push({
			path: `/agents/${encodeURIComponent(slug)}`,
			priority: 0.8,
			changeFreq: 'monthly',
			type: 'public-catalog'
		});
	}

	for (const slug of catalog.channels) {
		routes.push({
			path: `/channels/${encodeURIComponent(slug)}`,
			priority: 0.8,
			changeFreq: 'monthly',
			type: 'public-catalog'
		});
	}

	return routes;
}

function generateManifest() {
	console.log('Scanning routes directory...');
	console.log(`   Source: ${ROUTES_DIR}`);

	if (!fs.existsSync(ROUTES_DIR)) {
		console.error(`Routes directory not found: ${ROUTES_DIR}`);
		process.exit(1);
	}

	const routes = scanRoutes(ROUTES_DIR);
	const catalogRoutes = publicCatalogSlugsToRoutes(extractPublicCatalogSlugs());
	routes.push(...catalogRoutes);

	const manifest = {
		generated: new Date().toISOString(),
		version: '1.0.0',
		routes,
		metadata: {
			totalRoutes: routes.length,
			excludedPatterns: EXCLUDED_PATTERNS,
			excludedPaths: EXCLUDED_PATHS
		}
	};

	const outputDir = path.dirname(OUTPUT_FILE);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

	console.log(`Routes manifest written: ${OUTPUT_FILE}`);
	console.log(`   Routes found: ${routes.length} (${catalogRoutes.length} from public catalog)`);
	if (routes.length > 0) {
		console.log('\nSample routes:');
		routes.slice(0, 8).forEach((route) => console.log(`   - ${route.path}`));
		if (routes.length > 8) {
			console.log(`   ... and ${routes.length - 8} more`);
		}
	}
	if (catalogRoutes.length > 0) {
		console.log('\nPublic catalog routes:');
		catalogRoutes.forEach((route) => console.log(`   - ${route.path}`));
	}
}

try {
	generateManifest();
} catch (error) {
	console.error('Failed to generate routes manifest:', error);
	process.exit(1);
}
