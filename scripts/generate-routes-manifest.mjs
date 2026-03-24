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
const OUTPUT_FILE = path.join(__dirname, '../backend/static/routes-manifest.json');

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

function generateManifest() {
	console.log('Scanning routes directory...');
	console.log(`   Source: ${ROUTES_DIR}`);

	if (!fs.existsSync(ROUTES_DIR)) {
		console.error(`Routes directory not found: ${ROUTES_DIR}`);
		process.exit(1);
	}

	const routes = scanRoutes(ROUTES_DIR);

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
	console.log(`   Routes found: ${routes.length}`);
	if (routes.length > 0) {
		console.log('\nSample routes:');
		routes.slice(0, 8).forEach((route) => console.log(`   - ${route.path}`));
		if (routes.length > 8) {
			console.log(`   ... and ${routes.length - 8} more`);
		}
	}
}

try {
	generateManifest();
} catch (error) {
	console.error('Failed to generate routes manifest:', error);
	process.exit(1);
}
