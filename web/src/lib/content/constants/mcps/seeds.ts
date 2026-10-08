import type { McpLandingSeed } from '$lib/content/constants/mcps/types';

import { antigravity_cliMcpSeed } from '$lib/content/constants/mcps/hosts/antigravity-cli';
import { chatgptMcpSeed } from '$lib/content/constants/mcps/hosts/chatgpt';
import { codexMcpSeed } from '$lib/content/constants/mcps/hosts/codex';
import { cursorMcpSeed } from '$lib/content/constants/mcps/hosts/cursor';
import { claude_codeMcpSeed } from '$lib/content/constants/mcps/hosts/claude-code';
import { claude_coworkMcpSeed } from '$lib/content/constants/mcps/hosts/claude-cowork';
import { vscode_copilotMcpSeed } from '$lib/content/constants/mcps/hosts/vscode-copilot';
import { devin_desktopMcpSeed } from '$lib/content/constants/mcps/hosts/devin-desktop';
import { ampMcpSeed } from '$lib/content/constants/mcps/hosts/amp';
import { warpMcpSeed } from '$lib/content/constants/mcps/hosts/warp';
import { muse_codeMcpSeed } from '$lib/content/constants/mcps/hosts/muse-code';
import { grok_buildMcpSeed } from '$lib/content/constants/mcps/hosts/grok-build';

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
	muse_codeMcpSeed,
	grok_buildMcpSeed
];

export type PublicMcpFooterEntry = { slug: string; label: string };

/** Footer list derived from `MCP_LANDING_SEEDS` (seed modules must not import getMcpClientConfig). */
export function listPublicMcpLandingSeedsForFooter(): PublicMcpFooterEntry[] {
	return MCP_LANDING_SEEDS.map(({ slug, label }) => ({ slug, label }));
}
