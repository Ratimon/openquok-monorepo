import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { listSitemapCompareAndAgentChannelPaths } from './listSitemapCompareAndAgentChannelPaths';

const repoBackendStaticDir = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	'../../../../../backend/static'
);

export function writeSitemapProgrammaticPathsJson(
	outputFile = path.join(repoBackendStaticDir, 'sitemap-programmatic-paths.json')
): { compare: number; agentChannel: number } {
	const paths = listSitemapCompareAndAgentChannelPaths();

	const payload = {
		generated: new Date().toISOString(),
		compare: paths.compare,
		agentChannel: paths.agentChannel
	};

	fs.mkdirSync(path.dirname(outputFile), { recursive: true });
	fs.writeFileSync(outputFile, `${JSON.stringify(payload, null, 2)}\n`);

	return { compare: paths.compare.length, agentChannel: paths.agentChannel.length };
}
