import type { ExtensionType } from "./listingTypes";

/** MCP tool row for the tools table on MCP detail pages. */
export interface McpToolDefinition {
    name: string;
    description: string;
}

export type McpTransport = "stdio" | "sse" | "http";

/** Fields specific to skills extensions (SKILL.md import + ClawHub-style detail). */
export interface SkillsExtensionFields {
    skillName: string | null;
    skillSourceUrl: string | null;
    skillMetadata: Record<string, unknown> | null;
    sourceSyncedAt: string | null;
    sourceContentHash: string | null;
    license: string | null;
    version: string | null;
}

/** Fields specific to MCP server listings (MCP Market-style detail). */
export interface McpExtensionFields {
	mcpTools: McpToolDefinition[];
	mcpTransport: McpTransport | null;
	mcpServerConfig: Record<string, unknown> | null;
}

/** Shared source/repo fields used by skills and MCP listings. */
export interface ExtensionSourceFields {
    sourceRepoUrl: string | null;
    license: string | null;
    version: string | null;
}

/** Discriminated extension field shapes keyed by extension_type. */
export type ExtensionTypeFieldModel =
    | { extensionType: "skills"; fields: SkillsExtensionFields }
    | { extensionType: "mcp"; fields: McpExtensionFields }
    | { extensionType: "both"; fields: SkillsExtensionFields & McpExtensionFields };

/** Preview DTO returned by POST /listings/import/github (no DB write). */
export interface ListingGithubImportPreview {
    title: string;
    slug: string;
    description: string | null;
    excerpt: string | null;
    content: string | null;
    extensionType: ExtensionType;
    descriptionSkills?: string | null;
    descriptionMcp?: string | null;
    contentSkills?: string | null;
    contentMcp?: string | null;
    skillName: string | null;
    skillMetadata: Record<string, unknown> | null;
    sourceRepoUrl: string;
    skillSourceUrl: string;
    installCommandSkills: string | null;
    license: string | null;
    version: string | null;
    sourceContentHash: string;
}

/** Result of POST /listings/:id/sync-github. */
export interface ListingGithubSyncResult {
    updated: boolean;
    contentChanged: boolean;
    sourceSyncedAt: string;
    sourceContentHash: string;
}
