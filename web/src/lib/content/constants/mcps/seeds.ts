import type { McpLandingSeed } from '$lib/content/constants/mcps/types';

import { antigravity_cliMcpSeed } from '$lib/content/constants/mcps/antigravity-cli';
import { chatgptMcpSeed } from '$lib/content/constants/mcps/chatgpt';
import { codexMcpSeed } from '$lib/content/constants/mcps/codex';
import { cursorMcpSeed } from '$lib/content/constants/mcps/cursor';
import { claude_codeMcpSeed } from '$lib/content/constants/mcps/claude-code';
import { claude_coworkMcpSeed } from '$lib/content/constants/mcps/claude-cowork';
import { vscode_copilotMcpSeed } from '$lib/content/constants/mcps/vscode-copilot';
import { devin_desktopMcpSeed } from '$lib/content/constants/mcps/devin-desktop';
import { ampMcpSeed } from '$lib/content/constants/mcps/amp';
import { warpMcpSeed } from '$lib/content/constants/mcps/warp';
import { muse_codeMcpSeed } from '$lib/content/constants/mcps/muse-code';

/** Single registry for MCP landing seeds — order drives hub, nav, and footer columns. */
export const MCP_LANDING_SEEDS: readonly McpLandingSeed[] = [
	antigravity_cliMcpSeed,
	chatgptMcpSeed,
	codexMcpSeed,
	cursorMcpSeed,
	claude_codeMcpSeed,
	claude_coworkMcpSeed,
	vscode_copilotMcpSeed,
	devin_desktopMcpSeed,
	ampMcpSeed,
	warpMcpSeed,
	muse_codeMcpSeed
];

export type PublicMcpFooterEntry = { slug: string; label: string };

/** Footer list derived from `MCP_LANDING_SEEDS` (seed modules must not import getMcpClientConfig). */
export function listPublicMcpLandingSeedsForFooter(): PublicMcpFooterEntry[] {
	return MCP_LANDING_SEEDS.map(({ slug, label }) => ({ slug, label }));
}
