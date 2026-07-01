import { OPENQUOK_CORE_EXTENSION_SLUG } from '$lib/stack-builder/constants/defaults';
import { OPENQUOK_CORE_QUICK_REFERENCE } from '$lib/stack-builder/constants/openquokCliCommandSnippets';

export type QuickReferenceExtension = {
	slug: string;
	title: string;
	extensionType: string | null;
	mcpTools: Array<{ name: string; description: string }>;
	mcpServerConfig: Record<string, unknown> | null;
};

/** MCP server id as registered in the agent MCP config (`mcp_config.json`, Codex TOML, etc.). */
export function resolveMcpServerName(extension: QuickReferenceExtension): string {
	const configured = extension.mcpServerConfig?.name;
	if (typeof configured === 'string' && configured.trim()) {
		return configured.trim();
	}

	return extension.slug.replace(/-mcp$/, '');
}

/** MCP-only extensions with tools — used for SKILL.md `mcp_servers` frontmatter. */
export function collectMcpServerNames(extensions: QuickReferenceExtension[]): string[] {
	const names: string[] = [];

	for (const extension of extensions) {
		if (extension.extensionType !== 'mcp' || extension.mcpTools.length === 0) continue;
		const name = resolveMcpServerName(extension);
		if (!names.includes(name)) names.push(name);
	}

	return names.sort((a, b) => a.localeCompare(b));
}

function formatMcpToolLinkLabel(toolName: string, serverName: string): string {
	const prefix = `${serverName}_`;
	const stripped = toolName.startsWith(prefix) ? toolName.slice(prefix.length) : toolName;
	return stripped
		.split('_')
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function buildOpenQuokCliSubsection(): string {
	return ['### OpenQuok Core', '', '```bash', OPENQUOK_CORE_QUICK_REFERENCE, '```'].join('\n');
}

function buildMcpExtensionSubsection(extension: QuickReferenceExtension): string {
	const serverName = resolveMcpServerName(extension);
	const lines = [
		`### ${extension.title}`,
		'',
		`Register server **${serverName}** in your agent MCP config, then call tools with following links:`,
		''
	];

	for (const tool of extension.mcpTools) {
		const label = formatMcpToolLinkLabel(tool.name, serverName);
		const description = tool.description?.trim() || tool.name;
		lines.push(`- [${label}](mcp://${serverName}/${tool.name}) — ${description}`);
	}

	return lines.join('\n').trimEnd();
}

/** Build `## Quick Reference` body with per-extension subheadings. CLI wins for `both`; MCP tools for `mcp` only. */
export function buildQuickReferenceMarkdown(
	extensions: QuickReferenceExtension[],
	selectedSlugs: string[]
): string {
	const selected = extensions.filter((extension) => selectedSlugs.includes(extension.slug));
	const sections: string[] = [];

	if (selectedSlugs.includes(OPENQUOK_CORE_EXTENSION_SLUG)) {
		sections.push(buildOpenQuokCliSubsection());
	}

	const mcpExtensions = selected
		.filter((extension) => extension.extensionType === 'mcp' && extension.mcpTools.length > 0)
		.sort((a, b) => a.title.localeCompare(b.title));

	for (const extension of mcpExtensions) {
		sections.push(buildMcpExtensionSubsection(extension));
	}

	return sections.join('\n\n');
}
