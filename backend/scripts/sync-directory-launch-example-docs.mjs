/**
 * Inserts "Profile fields wired to autofill" sections into cli-examples / mcp-examples
 * directory pages. Path lists come from shipped fixtures in
 * `DIRECTORY_EXTENSION_CONFIG_FIXTURES` (same source as extension fill).
 *
 * Prerequisite: `pnpm common:build`
 *
 * Usage:
 *   pnpm sync:directory-launch-example-docs
 *   pnpm sync:directory-launch-example-docs:check
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const COMMON_DIST_INDEX = path.join(REPO_ROOT, 'common/dist/index.js');
const CLI_DIR = path.join(REPO_ROOT, 'web/src/content/docs/cli-examples');
const MCP_DIR = path.join(REPO_ROOT, 'web/src/content/docs/mcp-examples');

/** Curated example JSON bodies + manual-site notes (paths come from config.ts). */
const SITE_CURATED = {
	peerpush: {
		title: 'PeerPush',
		manual:
			'Paid checkout, free-queue timing, and final publish stay on peerpush.com. OpenQuok does not charge PeerPush for you.',
		patch: {
			tagline: 'Ship faster with one profile for every directory',
			profile_data: {
				categories: ['SaaS', 'Productivity'],
				use_cases: ['Product launches', 'Backlink outreach'],
				target_audiences: ['Indie founders', 'Small teams'],
				platforms: ['Web'],
				pricing_type: 'freemium',
				social_x: 'https://x.com/example',
				social_linkedin: 'https://www.linkedin.com/company/example',
				gallery_urls: [
					'https://cdn.example.com/shot-1.png',
					'https://cdn.example.com/shot-2.png',
				],
			},
		},
	},
	uneed: {
		title: 'Uneed',
		manual:
			'Join-the-line timing, paid slot checkout, maker-profile-only fields, and final submit stay on uneed.best. Tagline on Uneed is capped at 80 characters (`BUSINESS_PROFILE_DIRECTORY_TAGLINE_MAX`).',
		patch: {
			tagline: 'Short tagline for Uneed (max 80 characters)',
			profile_data: {
				tags: ['SaaS', 'Productivity', 'AI'],
				pricing_type: 'freemium',
				launch_date: '2026-12-01',
				gallery_urls: [
					'https://cdn.example.com/uneed-1.png',
					'https://cdn.example.com/uneed-2.png',
					'https://cdn.example.com/uneed-3.png',
				],
				social_x: 'https://x.com/example',
			},
		},
	},
	'open-launch': {
		title: 'Open Launch',
		manual:
			'Premium checkout, free-queue placement, and wizard steps after Details stay on open-launch.com. Product image on the form uses only the first gallery URL.',
		patch: {
			profile_data: {
				categories: ['SaaS', 'Developer Tools'],
				tech_stack: ['TypeScript', 'PostgreSQL'],
				platforms: ['Web'],
				pricing_type: 'freemium',
				gallery_urls: ['https://cdn.example.com/product-shot.png'],
			},
		},
	},
	tinylaunch: {
		title: 'TinyLaunch',
		manual:
			'Upvote pledge, Premium payment, and Standard queue timing stay manual on tinylaunch.com.',
		patch: {
			tagline: 'Launch your startup in one click',
			profile_data: {
				category: 'SaaS',
				gallery_urls: [
					'https://cdn.example.com/tl-1.png',
					'https://cdn.example.com/tl-2.png',
					'https://cdn.example.com/tl-3.png',
				],
			},
		},
	},
	fazier: {
		title: 'Fazier',
		manual:
			'Maker comments, badge embed, Lite Plan checkout, and moderation after the product wizard stay manual on fazier.com. Company page social rows beyond LinkedIn and X are manual.',
		patch: {
			profile_data: {
				slug: 'my-product',
				categories: ['SaaS'],
				use_cases: ['Automation', 'Analytics'],
				target_audiences: ['Startups'],
				platforms: ['Web'],
				tech_stack: ['TypeScript'],
				launch_date: '2026-12-01',
				pricing_type: 'freemium',
				social_linkedin: 'https://www.linkedin.com/company/example',
				social_x: 'https://x.com/example',
			},
		},
	},
	devhunt: {
		title: 'DevHunt',
		manual:
			'Maker comment, launch week, $49 checkout, and maker name stay manual on devhunt.org. DevHunt expects at least three screenshots in the gallery.',
		patch: {
			profile_data: {
				categories: ['Developer Tools', 'APIs'],
				pricing_type: 'freemium',
				social_github: 'https://github.com/org/repo',
				launch_video_url: 'https://www.youtube.com/watch?v=example',
				gallery_urls: [
					'https://cdn.example.com/dh-1.png',
					'https://cdn.example.com/dh-2.png',
					'https://cdn.example.com/dh-3.png',
				],
			},
		},
	},
	'nick-launches': {
		title: 'Nick Launches',
		manual:
			'Target keyword, discount, first comment, launch date, slug, and plan checkout on /submit/plan/ stay manual on nicklaunches.com.',
		patch: {
			profile_data: {
				categories: ['SaaS', 'AI'],
				use_cases: ['Product discovery'],
				pricing_type: 'freemium',
				is_open_source: false,
				launch_video_url: 'https://www.youtube.com/watch?v=example',
				social_x: 'https://x.com/example',
			},
		},
	},
	indiehub: {
		title: 'IndieHub',
		manual: 'Stripe payment (step 2) and Publish (step 3) stay manual on indiehub.best.',
		patch: {
			profile_data: {
				categories: ['SaaS'],
				tags: ['indie', 'bootstrap', 'saas'],
			},
		},
	},
	alternativeto: {
		title: 'AlternativeTo',
		manual:
			'Features, supported languages, suggest-as-alternative flows, Stripe upsell tiers, final Submit, and Reddit on user profile stay manual on alternativeto.net.',
		patch: {
			profile_data: {
				tags: ['project-management', 'collaboration'],
				platforms: ['Web', 'Windows', 'macOS'],
				pricing_type: 'freemium',
				is_open_source: false,
				social_x: 'https://x.com/example',
			},
		},
	},
	trustpilot: {
		title: 'Trustpilot',
		manual:
			'Contact info (email, phone, address), Save and publish, homepage screenshot updates, and business-email verification stay manual on Trustpilot Business.',
		patch: {
			description: 'Official company description for Trustpilot Business settings.',
		},
	},
	startupinspire: {
		title: 'StartupInspire',
		manual:
			'Social links beyond mapped fields, launch status, reCAPTCHA, and final publish stay manual on startupinspire.com.',
		patch: {
			profile_data: {
				tech_stack: ['React', 'Node.js'],
				gallery_urls: [
					'https://cdn.example.com/si-1.png',
					'https://cdn.example.com/si-2.png',
				],
			},
		},
	},
};

async function loadFixtureHelpers() {
	if (!fs.existsSync(COMMON_DIST_INDEX)) {
		throw new Error('common/dist missing. Run `pnpm common:build` first.');
	}
	const mod = await import(pathToFileURL(COMMON_DIST_INDEX).href);
	return {
		fixtures: mod.DIRECTORY_EXTENSION_CONFIG_FIXTURES,
		directorySiteKeyFromProviderSlug: mod.directorySiteKeyFromProviderSlug,
	};
}

function collectProfilePathsFromFixture(fixture) {
	const paths = new Set();
	for (const step of fixture.steps ?? []) {
		for (const field of step.fields ?? []) {
			if (field.profilePath) {
				paths.add(field.profilePath);
			}
		}
	}
	return [...paths].sort((a, b) => a.localeCompare(b));
}

function getVariantsForSite(siteSlug, fixtures, directorySiteKeyFromProviderSlug) {
	/** @type {{ providerSlug: string, paths: string[] }[]} */
	const variants = [];
	for (const [providerSlug, fixture] of Object.entries(fixtures)) {
		if (directorySiteKeyFromProviderSlug(providerSlug) !== siteSlug) {
			continue;
		}
		variants.push({
			providerSlug,
			paths: collectProfilePathsFromFixture(fixture),
		});
	}
	return variants.sort((a, b) => a.providerSlug.localeCompare(b.providerSlug));
}

function unionPaths(variants) {
	return [...new Set(variants.flatMap((v) => v.paths))].sort((a, b) => a.localeCompare(b));
}

function pathsToBadgeRows(paths) {
	return paths.map((p) => `<Badge text="${p}" variant="path" />`).join('\n');
}

function buildVariantSubsection(variants) {
	if (variants.length <= 1) {
		return '';
	}

	const signature = (v) => v.paths.join('\0');
	const allSame = variants.every((v) => signature(v) === signature(variants[0]));

	if (allSame) {
		const slugBadges = variants
			.map((v) => `<Badge text="${v.providerSlug}" variant="default" />`)
			.join(' ');
		return `### Provider slugs on this site

<p>These launch paths share the same <Badge text="profilePath" variant="param" /> set: ${slugBadges}.</p>

`;
	}

	let out = `### By provider slug

<p>Use <Badge text="providerSlug" variant="param" /> on <Badge text="directory:listings" variant="default" /> rows when you prepare a specific variant — field requirements can differ per form.</p>

`;
	for (const v of variants) {
		out += `#### <Badge text="${v.providerSlug}" variant="default" />\n\n${pathsToBadgeRows(v.paths)}\n\n`;
	}
	return out;
}

function buildCliSection(siteSlug, paths, variants, curated) {
	const patchJson = JSON.stringify(curated.patch, null, 2);
	const pathRows = pathsToBadgeRows(paths);
	const variantBlock = buildVariantSubsection(variants);

	return `## Profile fields wired to autofill

<Callout type="tip" title="Same paths as the extension">
<p><Badge text="directory:listings" variant="default" /> readiness gaps use the same <Badge text="profilePath" variant="param" /> keys as <Badge text="DIRECTORY_EXTENSION_CONFIG_FIXTURES" variant="param" /> in <Badge text="common/src/auto-launch/destination-configs/" variant="path" />. Patch the <strong>variant</strong> id from <Badge text="directory:variants:ensure" variant="default" /> when JSON lists missing fields.</p>
</Callout>

### Mapped \`profilePath\` values (all variants on this site)

${pathRows}

${variantBlock}Full operator context: <a href="/docs/directory-integration/${siteSlug}">${curated.title} directory integration</a>.

### Example \`directory:profiles:update\` patch

Use after <Badge text="directory:variants:ensure" variant="default" /> when readiness lists missing discovery or media fields:

\`\`\`json
${patchJson}
\`\`\`

<Callout type="note" title="Manual on ${curated.title}">
<p>${curated.manual}</p>
</Callout>

`;
}

function buildMcpSection(siteSlug, paths, variants, curated) {
	const patchJson = JSON.stringify(curated.patch, null, 2);
	const pathRows = pathsToBadgeRows(paths);
	const variantBlock = buildVariantSubsection(variants);

	return `## Profile fields wired to autofill

<Callout type="tip" title="Same paths as the extension">
<p><Badge text="directoryListingSummary" variant="default" /> mirrors missing <Badge text="profilePath" variant="param" /> values from <Badge text="DIRECTORY_EXTENSION_CONFIG_FIXTURES" variant="param" />. Call <Badge text="directoryProfilesUpdate" variant="default" /> on the variant <Badge text="productProfileId" variant="param" /> after <Badge text="directoryVariantsEnsure" variant="default" />.</p>
</Callout>

### Mapped \`profilePath\` values (all variants on this site)

${pathRows}

${variantBlock}Operator guide: <a href="/docs/directory-integration/${siteSlug}">${curated.title} directory integration</a>.

### Example \`directoryProfilesUpdate\` payload fragment

> Patch my ${curated.title} variant with discovery and media fields from this draft before I open the submit form.

\`\`\`json
${patchJson}
\`\`\`

<Callout type="note" title="Manual on ${curated.title}">
<p>${curated.manual}</p>
</Callout>

`;
}

const SECTION_HEADING = '## Profile fields wired to autofill';

function upsertSection(filePath, newSection) {
	if (!fs.existsSync(filePath)) {
		console.warn(`skip missing ${filePath}`);
		return;
	}
	let body = fs.readFileSync(filePath, 'utf8');
	const sectionStart = body.indexOf(SECTION_HEADING);
	if (sectionStart !== -1) {
		const after = body.slice(sectionStart + SECTION_HEADING.length);
		const nextHeading = after.search(/\n## /);
		const end =
			nextHeading === -1 ? body.length : sectionStart + SECTION_HEADING.length + nextHeading + 1;
		body = body.slice(0, sectionStart) + newSection.trimEnd() + '\n\n' + body.slice(end).trimStart();
	} else {
		const insertAnchors = [
			'\n## Logo and screenshots',
			'\n## Submissions (read-only)',
			'\n## Directory SEO (cached metrics)',
		];
		let insertBefore = -1;
		for (const anchor of insertAnchors) {
			insertBefore = body.indexOf(anchor);
			if (insertBefore !== -1) break;
		}
		if (insertBefore === -1) {
			throw new Error(`${filePath}: cannot find insertion point`);
		}
		body = body.slice(0, insertBefore) + '\n' + newSection + body.slice(insertBefore + 1);
	}
	// Remove hand-maintained patch blocks superseded by the synced example JSON section
	body = body.replace(
		/\n(?:Patch copy on the variant[^\n]*\n\n```bash\nopenquok directory:profiles:update[^\n]+\n```\n\n|Patch (?:discovery fields|maker or pricing fields)[^\n]*\n\n```bash\nopenquok directory:profiles:update[^\n]+\n```\n\nExample patch fragment:\n\n```json\n[\s\S]*?```\n\n)(?=\n## Profile fields wired to autofill)/,
		'\n'
	);
	fs.writeFileSync(filePath, body);
}

async function main() {
	const check = process.argv.includes('--check');
	let drift = false;

	const { fixtures, directorySiteKeyFromProviderSlug } = await loadFixtureHelpers();

	for (const siteSlug of Object.keys(SITE_CURATED).sort()) {
		const curated = SITE_CURATED[siteSlug];
		const variants = getVariantsForSite(siteSlug, fixtures, directorySiteKeyFromProviderSlug);
		if (variants.length === 0) {
			console.warn(`warn: no fixtures for site slug ${siteSlug}`);
		}
		const paths = unionPaths(variants);
		if (paths.length === 0) {
			console.warn(`warn: no profilePath in fixtures for ${siteSlug}`);
		}
		const cliSection = buildCliSection(siteSlug, paths, variants, curated);
		const mcpSection = buildMcpSection(siteSlug, paths, variants, curated);
		const cliFile = path.join(CLI_DIR, `${siteSlug}.md`);
		const mcpFile = path.join(MCP_DIR, `${siteSlug}.md`);

		if (check) {
			for (const [file, section] of [
				[cliFile, cliSection],
				[mcpFile, mcpSection],
			]) {
				const body = fs.readFileSync(file, 'utf8');
				if (!body.includes(section.trim())) {
					console.error(`drift: ${path.relative(REPO_ROOT, file)} needs sync`);
					drift = true;
				}
			}
			continue;
		}

		upsertSection(cliFile, cliSection);
		upsertSection(mcpFile, mcpSection);
		console.log(`synced ${siteSlug}`);
	}

	if (check && drift) {
		process.exit(1);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});