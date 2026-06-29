import { createHash } from "node:crypto";
import YAML from "yaml";
import { stringToSlug } from "../utils/blog/slug";
import { ValidationError } from "../errors/InfraError";
import type { ListingGithubImportPreview } from "../data/types/extensionTypeModels";

export interface ParsedGithubUrl {
    owner: string;
    repo: string;
    ref: string;
    skillPath: string;
}

export interface ParsedSkillMarkdown {
    skillName: string | null;
    description: string | null;
    metadata: Record<string, unknown> | null;
    license: string | null;
    version: string | null;
    extensionType: "skills" | "mcp" | "both" | null;
    body: string;
}

const DEFAULT_REF = "main";

export function parseGithubUrl(url: string): ParsedGithubUrl | null {
    const trimmed = url.trim();

    const rawMatch = trimmed.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)/i);
    if (rawMatch) {
        const [, owner, repo, ref, path] = rawMatch;
        return { owner, repo, ref, skillPath: path };
    }

    const githubMatch = trimmed.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
    if (!githubMatch) return null;

    const owner = githubMatch[1];
    const repo = githubMatch[2].replace(/\.git$/i, "");

    const blobMatch = trimmed.match(/github\.com\/[^/]+\/[^/]+\/blob\/([^/]+)\/(.+)/i);
    if (blobMatch) {
        const [, ref, path] = blobMatch;
        return { owner, repo, ref, skillPath: path.replace(/\/$/, "") };
    }

    const treeMatch = trimmed.match(/github\.com\/[^/]+\/[^/]+\/tree\/([^/]+)\/?(.*)?$/i);
    if (treeMatch) {
        const [, ref, folderPath = ""] = treeMatch;
        const base = folderPath.replace(/\/$/, "");
        const skillPath = base ? `${base}/SKILL.md` : "SKILL.md";
        return { owner, repo, ref, skillPath };
    }

    return { owner, repo, ref: DEFAULT_REF, skillPath: "SKILL.md" };
}

export function toRawContentUrl(parsed: ParsedGithubUrl): string {
    return `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${parsed.ref}/${parsed.skillPath}`;
}

export function toSourceRepoUrl(parsed: ParsedGithubUrl): string {
    return `https://github.com/${parsed.owner}/${parsed.repo}`;
}

function parseExtensionType(value: unknown): "skills" | "mcp" | "both" | null {
    if (value === "skills" || value === "mcp" || value === "both") return value;
    return null;
}

export function parseSkillMarkdown(raw: string): ParsedSkillMarkdown {
    const normalized = raw.replace(/^\uFEFF/, "");
    const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

    if (!match) {
        return {
            skillName: null,
            description: null,
            metadata: null,
            license: null,
            version: null,
            extensionType: null,
            body: normalized.trim(),
        };
    }

    const [, frontmatterRaw, body] = match;
    let frontmatter: Record<string, unknown> = {};

    try {
        const parsed = YAML.parse(frontmatterRaw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            frontmatter = parsed as Record<string, unknown>;
        }
    } catch {
        throw new ValidationError("Could not parse SKILL.md YAML frontmatter.");
    }

    const skillName = typeof frontmatter.name === "string" ? frontmatter.name.trim() : null;
    const description =
        typeof frontmatter.description === "string" ? frontmatter.description.trim() : null;
    const license = typeof frontmatter.license === "string" ? frontmatter.license.trim() : null;
    const version = typeof frontmatter.version === "string" ? frontmatter.version.trim() : null;
    const extensionType = parseExtensionType(frontmatter.extension_type);
    const metadata =
        frontmatter.metadata != null && typeof frontmatter.metadata === "object"
            ? (frontmatter.metadata as Record<string, unknown>)
            : typeof frontmatter.metadata === "string"
              ? tryParseMetadataJson(frontmatter.metadata)
              : null;

    return {
        skillName,
        description,
        metadata,
        license,
        version,
        extensionType,
        body: body.trim(),
    };
}

function tryParseMetadataJson(value: string): Record<string, unknown> | null {
    try {
        const parsed = JSON.parse(value) as unknown;
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? (parsed as Record<string, unknown>)
            : null;
    } catch {
        return null;
    }
}

export function extractInstallCommandFromBody(body: string): string | null {
    const installationSection = body.match(/###\s+Installation[\s\S]*?(?=###\s|\n##\s|$)/i);
    if (!installationSection) return null;

    const bashBlock = installationSection[0].match(/```(?:bash|sh|shell)\r?\n([\s\S]*?)```/i);
    if (!bashBlock) return null;

    const command = bashBlock[1]
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"))
        .join("\n")
        .trim();

    return command || null;
}

export function suggestInstallCommand(skillName: string, sourceRepoUrl: string): string {
    const skillFlag = skillName ? ` --skill ${skillName}` : "";
    return `npx skills add ${sourceRepoUrl}${skillFlag} -y`;
}

export function titleCaseSkillName(skillName: string): string {
    return skillName
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function hashContent(raw: string): string {
    return createHash("sha256").update(raw).digest("hex");
}

export function buildGithubImportPreview(
    raw: string,
    parsedUrl: ParsedGithubUrl,
    extensionTypeOverride?: "skills" | "mcp" | "both" | null
): ListingGithubImportPreview {
    const skill = parseSkillMarkdown(raw);
    const sourceRepoUrl = toSourceRepoUrl(parsedUrl);
    const skillSourceUrl = toRawContentUrl(parsedUrl);
    const slugBase = skill.skillName ?? parsedUrl.repo;
    const title = skill.skillName ? titleCaseSkillName(skill.skillName) : titleCaseSkillName(parsedUrl.repo);
    const description = skill.description;
    const excerpt = description ? description.slice(0, 160) : null;
    const body = skill.body || null;
    const installFromBody = extractInstallCommandFromBody(skill.body);
    const installCommandSkills =
        installFromBody ?? (skill.skillName ? suggestInstallCommand(skill.skillName, sourceRepoUrl) : null);

    const base = {
        title,
        slug: stringToSlug(slugBase),
        description,
        excerpt,
        content: body,
        skillName: skill.skillName,
        skillMetadata: skill.metadata,
        sourceRepoUrl,
        skillSourceUrl,
        installCommandSkills,
        license: skill.license,
        version: skill.version,
        sourceContentHash: hashContent(raw),
    };

    const extensionType = extensionTypeOverride ?? skill.extensionType ?? "skills";

    if (extensionType === "mcp") {
        throw new ValidationError(
            "GitHub import reads SKILL.md and supports Skills or Both extension types only."
        );
    }

    const resolvedType = extensionType === "both" ? "both" : "skills";

    return {
        ...base,
        extensionType: resolvedType,
        descriptionSkills: description,
        contentSkills: body,
        ...(resolvedType === "both" ? { descriptionMcp: null, contentMcp: null } : {}),
    };
}

export class ListingImportService {
    async fetchRawMarkdown(url: string): Promise<string> {
        const parsed = parseGithubUrl(url);
        if (!parsed) {
            throw new ValidationError("Could not parse GitHub URL. Paste a github.com or raw.githubusercontent.com link.");
        }

        const rawUrl = toRawContentUrl(parsed);
        const response = await fetch(rawUrl, {
            headers: {
                Accept: "text/plain, text/markdown, */*",
                "User-Agent": "OpenQuok-ListingImport/1.0",
            },
        });

        if (!response.ok) {
            throw new ValidationError(
                `Could not fetch SKILL.md (${response.status}). Check the URL, branch, and file path.`
            );
        }

        const text = await response.text();
        if (!text.trim()) {
            throw new ValidationError("Fetched SKILL.md is empty.");
        }

        return text;
    }

    async previewGithubImport(
        githubUrl: string,
        extensionTypeOverride?: "skills" | "mcp" | "both" | null
    ): Promise<ListingGithubImportPreview> {
        const parsed = parseGithubUrl(githubUrl);
        if (!parsed) {
            throw new ValidationError("Could not parse GitHub URL. Paste a github.com or raw.githubusercontent.com link.");
        }

        const raw = await this.fetchRawMarkdown(githubUrl);
        return buildGithubImportPreview(raw, parsed, extensionTypeOverride);
    }
}

export const listingImportService = new ListingImportService();
