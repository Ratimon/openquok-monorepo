import { truncatePlainText } from '$lib/utils/plainTextFromHtml';

import { SKILL_DEFAULT_VERSION } from '$lib/stack-builder/constants/defaults';
import { resolveListingHeaderSummary } from '$lib/listings/utils/resolveListingHeaderSummary';

type StackSummarySource = {
	excerpt?: string | null;
	description?: string | null;
	content?: string | null;
};

function stripMarkdownInline(markdown: string): string {
	return markdown
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/^#+\s+/gm, '')
		.replace(/[*_~]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function parseSkillFrontmatter(content: string): string | null {
	const match = content.trim().match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return null;
	return match[1];
}

function parseSkillFrontmatterField(frontmatter: string, field: string): string | null {
	const pattern = new RegExp(`^${field}:\\s*([\\s\\S]*?)(?=^\\S[\\w_-]*:\\s|$)`, 'm');
	const match = frontmatter.match(pattern);
	if (!match) return null;
	const value = match[1]
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.join(' ')
		.trim();
	return value || null;
}

function parseSkillMarkdownField(content: string | null | undefined, field: string): string | null {
	if (!content?.trim()) return null;
	const frontmatter = parseSkillFrontmatter(content);
	if (!frontmatter) return null;
	return parseSkillFrontmatterField(frontmatter, field);
}

function parseSkillMarkdownDescription(content: string | null | undefined): string | null {
	return parseSkillMarkdownField(content, 'description');
}

function parseSkillMarkdownOverview(content: string | null | undefined): string | null {
	if (!content?.trim()) return null;
	const body = content.replace(/^---[\s\S]*?---\r?\n?/, '');
	const match = body.match(/##\s+Overview\s*\n+([\s\S]*?)(?=\n##\s+|\s*$)/);
	if (!match) return null;
	const text = stripMarkdownInline(match[1]);
	return text || null;
}

/** Public summary for playbook headers, SEO, and share text. */
export function resolveStackListingHeaderSummary(stack: StackSummarySource): string | null {
	const fromFields = resolveListingHeaderSummary(stack);
	if (fromFields) return fromFields;

	const fromFrontmatter = parseSkillMarkdownDescription(stack.content);
	if (fromFrontmatter) return fromFrontmatter;

	const fromOverview = parseSkillMarkdownOverview(stack.content);
	if (fromOverview) return fromOverview;

	return null;
}

/** Truncate to listing excerpt column limit (160 chars). */
export function stackListingExcerptFromSummary(summary: string | null | undefined): string {
	if (!summary?.trim()) return '';
	return truncatePlainText(summary.trim(), 160);
}

type StackSkillMetadataSource = {
	skillName?: string | null;
	version?: string | null;
	license?: string | null;
	slug?: string | null;
	content?: string | null;
};

/** SKILL frontmatter `name`, stored skill_name, or listing slug. */
export function resolveStackSkillName(stack: StackSkillMetadataSource): string | null {
	const skillName = stack.skillName?.trim();
	if (skillName) return skillName;

	const fromFrontmatter = parseSkillMarkdownField(stack.content, 'name');
	if (fromFrontmatter) return fromFrontmatter;

	return stack.slug?.trim() || null;
}

/** Stored version or SKILL frontmatter `version`. */
export function resolveStackVersion(stack: StackSkillMetadataSource): string | null {
	const version = stack.version?.trim();
	if (version) return version;

	const fromFrontmatter = parseSkillMarkdownField(stack.content, 'version');
	if (fromFrontmatter) return fromFrontmatter;

	if (resolveStackSkillName(stack)) {
		return SKILL_DEFAULT_VERSION;
	}

	return null;
}

/** Stored license or SKILL frontmatter `license`. */
export function resolveStackLicense(
	stack: Pick<StackSkillMetadataSource, 'license' | 'content'>
): string | null {
	const license = stack.license?.trim();
	if (license) return license;

	return parseSkillMarkdownField(stack.content, 'license');
}
