import { close, createIndex } from 'pagefind';
import fs from 'node:fs/promises';
import path from 'node:path';

const siteDir = path.resolve('.svelte-kit/output/prerendered/pages');
const outputPath = path.resolve('.svelte-kit/output/client/pagefind');

async function listRegularFiles(dir, relativeDir = '') {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
		const absolutePath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			files.push(...(await listRegularFiles(absolutePath, relativePath)));
			continue;
		}

		if (entry.isFile()) {
			files.push({ absolutePath, relativePath });
		}
	}

	return files;
}

async function main() {
	const files = await listRegularFiles(siteDir);
	const htmlFiles = [];

	for (const file of files) {
		const head = await fs.readFile(file.absolutePath, { encoding: 'utf8' });
		if (!head.includes('<html')) continue;
		htmlFiles.push({ ...file, content: head });
	}

	if (htmlFiles.length === 0) {
		console.error(`No HTML files found under ${siteDir}`);
		process.exit(1);
	}

	const { errors, index } = await createIndex();
	if (errors.length > 0 || !index) {
		console.error('Failed to start Pagefind:', errors.join('\n'));
		process.exit(1);
	}

	let indexed = 0;
	for (const file of htmlFiles) {
		const result = await index.addHTMLFile({
			sourcePath: file.relativePath,
			content: file.content
		});
		if (result.errors.length > 0) {
			console.error(`Failed to index ${file.relativePath}:`, result.errors.join('\n'));
			process.exit(1);
		}
		indexed += 1;
	}

	const writeResult = await index.writeFiles({ outputPath });
	if (writeResult.errors.length > 0) {
		console.error('Failed to write Pagefind bundle:', writeResult.errors.join('\n'));
		process.exit(1);
	}

	await close();
	console.log(`Pagefind indexed ${indexed} pages into ${outputPath}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
