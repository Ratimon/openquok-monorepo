import type { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "../utils/Logger";

import bundledRoutesManifest from "../static/routes-manifest.json";

export interface GenerateSitemapOptions {
    supabaseClient: SupabaseClient;
    baseURL: string;
    routesPath?: string;
    routesManifestPath?: string;
}

interface SitemapUrl {
    url: string;
    lastMod?: string;
    changeFreq?: string;
}

interface RouteManifest {
    generated: string;
    version: string;
    routes: Array<{
        path: string;
        priority?: number;
        changeFreq?: string;
        type: string;
    }>;
    metadata: {
        totalRoutes: number;
        excludedPatterns: unknown;
        excludedPaths?: string[];
    };
}

const EXCLUDED_PATHS: string[] = ["/robots.txt", "/sitemap.xml"];

const CUSTOM_CHANGEFREQ: Record<string, string> = {
    "/blog": "daily",
};

const MANIFEST_EXCLUDED = new Set(["sitemap.xml", "robots.txt", "api", "favicon.ico"]);

/** Keep in sync with scripts/generate-routes-manifest.mjs (MANIFEST_NON_INDEXABLE_*). */
const COMPARE_HUB_BASE_SLUG = "openquok";

const MANIFEST_NON_INDEXABLE_EXACT = new Set([
    "/p",
    "/docs/markdown",
    "/llms.txt",
    "/llms-full.txt",
    "/rss.xml",
]);

const MANIFEST_NON_INDEXABLE_PREFIXES = ["/oauth", "/integration", "/join-org", "/cli"];

const PUBLIC_TOOL_CHANNEL_PATHS = ["/tools/photo-editor", "/tools/skill-builder"] as const;

const LISTING_HUB_PREFIXES = ["/playbooks", "/building-blocks"] as const;

/** Keep parsing logic in sync with scripts/generate-routes-manifest.mjs. */
const AGENT_HOST_PAGE_REGEX =
    /pageType:\s*['"]agent-host['"][\s\S]*?slug:\s*['"]([^'"]+)['"][\s\S]*?available:\s*(true|false)/g;

const CHANNEL_PAGE_REGEX =
    /slug:\s*['"]([^'"]+)['"],\s*\n\s*platformId:[\s\S]*?available:\s*(true|false)/g;

const CHANNEL_SLUG_REGEX = /slug:\s*['"]([^'"]+)['"],\s*\n\s*platformId:/g;

const COMPARE_PRODUCT_SLUG_REGEX = /slug:\s*['"]([^'"]+)['"],/;

interface PublicCatalogSlugs {
    agents: string[];
    channels: string[];
}

function readCatalogDirFiles(dirPath: string): string[] {
    if (!fs.existsSync(dirPath)) return [];

    const skip = new Set(["index.ts", "types.ts", "shared.ts", "hub.ts", "builders.ts"]);

    return fs
        .readdirSync(dirPath, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".ts") && !skip.has(entry.name))
        .map((entry) => fs.readFileSync(path.join(dirPath, entry.name), "utf-8"));
}

function extractMcpSeedSlugs(content: string): string[] {
    const slugs: string[] = [];
    const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;

    for (const match of content.matchAll(slugRegex)) {
        if (match[1]) slugs.push(match[1]);
    }

    return slugs;
}

function extractAvailableSlugs(content: string, regex: RegExp): string[] {
    const slugs: string[] = [];

    for (const match of content.matchAll(regex)) {
        const slug = match[1];
        const available = match[2];
        if (slug && available === "true") {
            slugs.push(slug);
        }
    }

    return slugs;
}

function extractPublicCatalogSlugsFromDir(constantsDir: string): PublicCatalogSlugs {
    const agentFiles = readCatalogDirFiles(path.join(constantsDir, "agents"));
    const channelFiles = readCatalogDirFiles(path.join(constantsDir, "channels"));
    const mcpFiles = readCatalogDirFiles(path.join(constantsDir, "mcps"));

    const agentHosts = agentFiles.flatMap((content) =>
        extractAvailableSlugs(content, AGENT_HOST_PAGE_REGEX),
    );
    const mcpClients = mcpFiles.flatMap((content) => extractMcpSeedSlugs(content));
    const channels = channelFiles.flatMap((content) =>
        extractAvailableSlugs(content, CHANNEL_PAGE_REGEX),
    );

    return {
        agents: [...new Set([...agentHosts, ...mcpClients])],
        channels: [...new Set(channels)],
    };
}

function extractPublicCatalogSlugsFromFiles(options: {
    agentConfigPath: string;
    mcpConfigPath: string;
    channelConfigPath: string;
}): PublicCatalogSlugs {
    const constantsDir = path.dirname(options.channelConfigPath);
    return extractPublicCatalogSlugsFromDir(constantsDir);
}

function resolveWebConstantsDir(routesPath?: string): string | undefined {
    const candidates = [
        routesPath ? path.join(routesPath, "../lib/content/constants") : null,
        path.join(process.cwd(), "../web/src/lib/content/constants"),
        path.join(process.cwd(), "web/src/lib/content/constants"),
    ].filter((candidate): candidate is string => Boolean(candidate));

    for (const dir of candidates) {
        if (fs.existsSync(path.join(dir, "publicChannelConfig.ts"))) {
            return dir;
        }
    }

    return undefined;
}

function loadPublicCatalogSlugs(routesPath?: string): PublicCatalogSlugs | null {
    const constantsDir = resolveWebConstantsDir(routesPath);
    if (!constantsDir) return null;

    try {
        return extractPublicCatalogSlugsFromFiles({
            agentConfigPath: path.join(constantsDir, "publicAgentConfig.ts"),
            mcpConfigPath: path.join(constantsDir, "publicMcpConfig.ts"),
            channelConfigPath: path.join(constantsDir, "publicChannelConfig.ts"),
        });
    } catch {
        return null;
    }
}

function publicCatalogSlugsToSitemapPaths(catalog: PublicCatalogSlugs): {
    agents: string[];
    channels: string[];
} {
    return {
        agents: catalog.agents.map((slug) => `/agents/${encodeURIComponent(slug)}`),
        channels: catalog.channels.map((slug) => `/channels/${encodeURIComponent(slug)}`),
    };
}

function isIndexableManifestPath(url: string): boolean {
    if (MANIFEST_NON_INDEXABLE_EXACT.has(url)) return false;

    for (const prefix of MANIFEST_NON_INDEXABLE_PREFIXES) {
        if (url === prefix || url.startsWith(`${prefix}/`)) {
            return false;
        }
    }

    return true;
}

function extractAllChannelSlugs(constantsDir: string): string[] {
    const channelFiles = readCatalogDirFiles(path.join(constantsDir, "channels"));
    const slugs: string[] = [];

    for (const content of channelFiles) {
        for (const match of content.matchAll(CHANNEL_SLUG_REGEX)) {
            if (match[1]) slugs.push(match[1]);
        }
    }

    return [...new Set(slugs)];
}

function extractCompareProductSlugs(constantsDir: string): string[] {
    const competitorFiles = readCatalogDirFiles(path.join(constantsDir, "competitors"));
    const slugs: string[] = [];

    for (const content of competitorFiles) {
        const match = content.match(COMPARE_PRODUCT_SLUG_REGEX);
        if (match?.[1]) slugs.push(match[1]);
    }

    return [...new Set(slugs)];
}

function buildProgrammaticSitemapPaths(constantsDir: string): string[] {
    const catalog = extractPublicCatalogSlugsFromDir(constantsDir);
    const compareSlugs = extractCompareProductSlugs(constantsDir);
    const allChannels = extractAllChannelSlugs(constantsDir);
    const paths: string[] = [];

    for (const productA of compareSlugs) {
        for (const productB of compareSlugs) {
            if (productA !== productB) {
                paths.push(
                    `/compare/${encodeURIComponent(productA)}/${encodeURIComponent(productB)}`,
                );
            }
        }
    }

    for (const slug of compareSlugs) {
        if (slug !== COMPARE_HUB_BASE_SLUG) {
            paths.push(`/alternatives/${encodeURIComponent(slug)}`);
        }
    }

    for (const agentSlug of catalog.agents) {
        for (const channelSlug of allChannels) {
            paths.push(
                `/agents/${encodeURIComponent(agentSlug)}/${encodeURIComponent(channelSlug)}`,
            );
        }
    }

    for (const toolPrefix of PUBLIC_TOOL_CHANNEL_PATHS) {
        for (const channelSlug of catalog.channels) {
            paths.push(`${toolPrefix}/${encodeURIComponent(channelSlug)}`);
        }
    }

    return paths;
}

function pushSitemapPaths(
    urls: SitemapUrl[],
    paths: string[],
    changeFreq: string,
    lastMod: string,
): void {
    for (const urlPath of paths) {
        urls.push({ url: urlPath, lastMod, changeFreq });
    }
}

function readFolderStructure(dirPath: string, previousFolder = ""): SitemapUrl[] {
    const urls: SitemapUrl[] = [];
    const disabledIncludes = ["(protected)", "(auth)", "not-found"];
    const disabledStartsWith = ["_", "["];

    try {
        const dirents = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const dirent of dirents) {
            if (!dirent.isDirectory()) continue;

            const dirName = dirent.name;

            if (
                disabledIncludes.some((d) => dirName.includes(d)) ||
                disabledStartsWith.some((d) => dirName.startsWith(d)) ||
                MANIFEST_EXCLUDED.has(dirName)
            ) {
                continue;
            }

            const fullPath = path.join(dirPath, dirName);
            const isRouteGroup = dirName.match(/^\(.*\)$/);

            if (!isRouteGroup) {
                const urlPath =
                    previousFolder === "" ? `/${dirName}` : `/${previousFolder}/${dirName}`;

                if (!EXCLUDED_PATHS.some((ex) => urlPath === ex || urlPath.startsWith(ex + "/"))) {
                    urls.push({
                        url: urlPath,
                        lastMod: new Date().toISOString().slice(0, 10),
                        changeFreq: "weekly",
                    });
                }
            }

            const childUrls = readFolderStructure(
                fullPath,
                isRouteGroup ? previousFolder : previousFolder ? `${previousFolder}/${dirName}` : dirName
            );
            urls.push(...childUrls);
        }
    } catch (error) {
        logger.error({
            msg: "Error reading folder structure for sitemap",
            error: error instanceof Error ? error.message : String(error),
            dirPath,
        });
    }

    return urls;
}

function sitemapUrlsFromManifest(manifest: RouteManifest, source: string): SitemapUrl[] {
    logger.info({
        msg: "Loaded routes from manifest",
        source,
        routeCount: manifest.routes.length,
        generated: manifest.generated,
    });

    return manifest.routes.map((route) => ({
        url: route.path,
        lastMod: new Date().toISOString().slice(0, 10),
        changeFreq: route.changeFreq || "monthly",
    }));
}

/**
 * Prefer the on-disk manifest (Docker / local refresh), then the JSON bundled into the
 * serverless build. Vercel only ships the tsup `api/*.js` output — `static/` is not on disk
 * at runtime, so without the bundled fallback hubs like `/alternatives` never enter the sitemap.
 */
function loadRoutesFromManifest(manifestPath?: string): SitemapUrl[] {
    if (manifestPath && fs.existsSync(manifestPath)) {
        try {
            const manifestData = fs.readFileSync(manifestPath, "utf-8");
            const manifest = JSON.parse(manifestData) as RouteManifest;
            return sitemapUrlsFromManifest(manifest, manifestPath);
        } catch (error) {
            logger.error({
                msg: "Error loading routes manifest from disk; falling back to bundled copy",
                error,
                manifestPath,
            });
        }
    } else if (manifestPath) {
        logger.warn({
            msg: "Routes manifest path missing on disk; using bundled copy",
            manifestPath,
        });
    }

    return sitemapUrlsFromManifest(bundledRoutesManifest as RouteManifest, "bundled");
}

function escapeXml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function dedupeByUrl(urls: SitemapUrl[]): SitemapUrl[] {
    const seen = new Map<string, SitemapUrl>();
    for (const u of urls) {
        if (!seen.has(u.url)) seen.set(u.url, u);
    }
    return [...seen.values()];
}

const POST_PAGE_SIZE = 1000;
const LISTING_PAGE_SIZE = 1000;

async function fetchPublishedPostSlugs(supabase: SupabaseClient): Promise<
    Array<{ slug: string; updated_at: string | null }>
> {
    const rows: Array<{ slug: string; updated_at: string | null }> = [];
    let from = 0;

    for (;;) {
        const { data, error } = await supabase
            .from("blog_posts")
            .select("slug, updated_at")
            .match({ is_user_published: true, is_admin_approved: true })
            .order("published_at", { ascending: false })
            .range(from, from + POST_PAGE_SIZE - 1);

        if (error) {
            logger.error({
                msg: "Error fetching blog posts for sitemap",
                error: error.message,
                code: error.code,
            });
            break;
        }

        const batch = data ?? [];
        for (const row of batch) {
            if (row.slug) {
                rows.push({ slug: row.slug, updated_at: row.updated_at ?? null });
            }
        }

        if (batch.length < POST_PAGE_SIZE) break;
        from += POST_PAGE_SIZE;
    }

    return rows;
}

async function fetchPublishedListingSlugs(
    supabase: SupabaseClient,
    listingKind: "extension" | "stack"
): Promise<Array<{ slug: string; owner_username: string | null; updated_at: string | null }>> {
    const rows: Array<{ slug: string; owner_username: string | null; updated_at: string | null }> = [];
    let from = 0;

    for (;;) {
        const { data, error } = await supabase
            .from("listings")
            .select("slug, updated_at, owner:users!owner_id(username)")
            .match({
                is_user_published: true,
                is_admin_published: true,
                listing_kind: listingKind,
            })
            .order("published_at", { ascending: false })
            .range(from, from + LISTING_PAGE_SIZE - 1);

        if (error) {
            logger.error({
                msg: "Error fetching listings for sitemap",
                listingKind,
                error: error.message,
                code: error.code,
            });
            break;
        }

        const batch = data ?? [];
        for (const row of batch) {
            if (row.slug) {
                const ownerRaw = row.owner as { username?: string | null } | { username?: string | null }[] | null;
                const owner = Array.isArray(ownerRaw) ? ownerRaw[0] : ownerRaw;
                rows.push({
                    slug: row.slug,
                    owner_username: owner?.username?.trim() || null,
                    updated_at: row.updated_at ?? null,
                });
            }
        }

        if (batch.length < LISTING_PAGE_SIZE) break;
        from += LISTING_PAGE_SIZE;
    }

    return rows;
}

async function fetchListingCreatorUsernames(supabase: SupabaseClient): Promise<string[]> {
    const { data, error } = await supabase.rpc("get_listing_creators");

    if (error) {
        logger.error({
            msg: "Error fetching listing creators for sitemap",
            error: error.message,
            code: error.code,
        });
        return [];
    }

    const usernames: string[] = [];
    for (const row of (data ?? []) as Array<{ username: string | null }>) {
        const username = row.username?.trim();
        if (username) usernames.push(username);
    }

    return usernames;
}

async function fetchActiveListingCategorySlugs(supabase: SupabaseClient): Promise<string[]> {
    const { data, error } = await supabase.rpc("get_active_listing_categories");

    if (error) {
        logger.error({
            msg: "Error fetching listing categories for sitemap",
            error: error.message,
            code: error.code,
        });
        return [];
    }

    const slugs: string[] = [];
    for (const row of (data ?? []) as Array<{ slug: string | null }>) {
        const slug = row.slug?.trim();
        if (slug) slugs.push(slug);
    }

    return slugs;
}

async function fetchActiveListingTagSlugs(supabase: SupabaseClient): Promise<string[]> {
    const { data, error } = await supabase.rpc("get_active_listing_tags");

    if (error) {
        logger.error({
            msg: "Error fetching listing tags for sitemap",
            error: error.message,
            code: error.code,
        });
        return [];
    }

    const slugs: string[] = [];
    for (const row of (data ?? []) as Array<{ slug: string | null }>) {
        const slug = row.slug?.trim();
        if (slug) slugs.push(slug);
    }

    return slugs;
}

function listingHubPathsFromSlugs(categorySlugs: string[], tagSlugs: string[]): string[] {
    const paths: string[] = [];

    for (const hubPrefix of LISTING_HUB_PREFIXES) {
        for (const slug of categorySlugs) {
            paths.push(`${hubPrefix}/categories/${encodeURIComponent(slug)}`);
        }
        for (const slug of tagSlugs) {
            paths.push(`${hubPrefix}/tags/${encodeURIComponent(slug)}`);
        }
    }

    return paths;
}

async function generateSitemapUrls(options: GenerateSitemapOptions): Promise<SitemapUrl[]> {
    const { supabaseClient, routesPath, routesManifestPath } = options;
    const urls: SitemapUrl[] = [];

    urls.push({
        url: "/",
        lastMod: new Date().toISOString().slice(0, 10),
        changeFreq: "weekly",
    });

    if (routesManifestPath) {
        logger.info({
            msg: "Using routes manifest for static and programmatic pages",
            path: routesManifestPath,
        });
        const manifestUrls = loadRoutesFromManifest(routesManifestPath).filter((entry) =>
            isIndexableManifestPath(entry.url),
        );
        urls.push(...manifestUrls);
    } else if (routesPath && fs.existsSync(routesPath)) {
        logger.info({ msg: "Scanning file system for routes", path: routesPath });
        try {
            urls.push(...readFolderStructure(routesPath));
        } catch (error) {
            logger.error({ msg: "Error reading routes folder for sitemap", error, routesPath });
        }
    } else {
        logger.warn({
            msg: "No routesPath; using bundled routes manifest for static and programmatic pages",
            manifestPath: routesManifestPath,
            routesPath,
        });
        const manifestUrls = loadRoutesFromManifest().filter((entry) =>
            isIndexableManifestPath(entry.url),
        );
        urls.push(...manifestUrls);
    }

    try {
        const posts = await fetchPublishedPostSlugs(supabaseClient);
        for (const p of posts) {
            urls.push({
                url: `/blog/${p.slug}`,
                lastMod: p.updated_at
                    ? new Date(p.updated_at).toISOString().slice(0, 10)
                    : new Date().toISOString().slice(0, 10),
                changeFreq: "weekly",
            });
        }
        logger.info({ msg: `Added ${posts.length} blog post URLs to sitemap` });
    } catch (error) {
        logger.error({
            msg: "Error processing blog posts for sitemap",
            error: error instanceof Error ? error.message : String(error),
        });
    }

    try {
        const { data: topicRows, error: topicsError } = await supabaseClient.rpc("get_active_blog_topics");

        if (topicsError) {
            logger.error({
                msg: "Error fetching topics for sitemap",
                error: topicsError.message,
                code: topicsError.code,
            });
        } else if (topicRows && topicRows.length > 0) {
            for (const t of topicRows as Array<{ slug: string }>) {
                if (t.slug) {
                    urls.push({
                        url: `/blog/topic/${encodeURIComponent(t.slug)}`,
                        lastMod: new Date().toISOString().slice(0, 10),
                        changeFreq: "weekly",
                    });
                }
            }
            logger.info({ msg: `Added ${topicRows.length} blog topic URLs to sitemap` });
        }
    } catch (error) {
        logger.error({
            msg: "Error processing blog topics for sitemap",
            error: error instanceof Error ? error.message : String(error),
        });
    }

    try {
        const { data: authorRows, error: authorsError } =
            await supabaseClient.rpc("get_published_blog_authors");

        if (authorsError) {
            logger.error({
                msg: "Error fetching authors for sitemap",
                error: authorsError.message,
                code: authorsError.code,
            });
        } else if (authorRows && authorRows.length > 0) {
            for (const a of authorRows as Array<{ id: string; username: string | null }>) {
                const segment = (a.username && a.username.trim()) || a.id;
                urls.push({
                    url: `/blog/author/${encodeURIComponent(segment)}`,
                    lastMod: new Date().toISOString().slice(0, 10),
                    changeFreq: "monthly",
                });
            }
            logger.info({ msg: `Added ${authorRows.length} blog author URLs to sitemap` });
        }
    } catch (error) {
        logger.error({
            msg: "Error processing blog authors for sitemap",
            error: error instanceof Error ? error.message : String(error),
        });
    }

    try {
        const catalog = loadPublicCatalogSlugs(routesPath);
        if (catalog) {
            const { agents, channels } = publicCatalogSlugsToSitemapPaths(catalog);
            const today = new Date().toISOString().slice(0, 10);

            for (const agentUrl of agents) {
                urls.push({ url: agentUrl, lastMod: today, changeFreq: "monthly" });
            }
            for (const channelUrl of channels) {
                urls.push({ url: channelUrl, lastMod: today, changeFreq: "monthly" });
            }

            logger.info({
                msg: "Added public catalog URLs to sitemap",
                agentCount: agents.length,
                channelCount: channels.length,
            });

            const constantsDir = resolveWebConstantsDir(routesPath);
            if (constantsDir) {
                const programmaticPaths = buildProgrammaticSitemapPaths(constantsDir);
                const today = new Date().toISOString().slice(0, 10);
                pushSitemapPaths(urls, programmaticPaths, "monthly", today);
                logger.info({
                    msg: "Added programmatic SEO URLs to sitemap",
                    count: programmaticPaths.length,
                });
            }
        } else {
            logger.warn({ msg: "Public catalog config not found for sitemap", routesPath });
        }
    } catch (error) {
        logger.error({
            msg: "Error processing public catalog for sitemap",
            error: error instanceof Error ? error.message : String(error),
        });
    }

    try {
        const [buildingBlocks, playbooks, creatorUsernames] = await Promise.all([
            fetchPublishedListingSlugs(supabaseClient, "extension"),
            fetchPublishedListingSlugs(supabaseClient, "stack"),
            fetchListingCreatorUsernames(supabaseClient),
        ]);

        for (const listing of buildingBlocks) {
            if (!listing.owner_username) continue;
            urls.push({
                url: `/creators/${encodeURIComponent(listing.owner_username)}/building-blocks/${encodeURIComponent(listing.slug)}`,
                lastMod: listing.updated_at
                    ? new Date(listing.updated_at).toISOString().slice(0, 10)
                    : new Date().toISOString().slice(0, 10),
                changeFreq: "weekly",
            });
        }

        for (const listing of playbooks) {
            if (!listing.owner_username) continue;
            urls.push({
                url: `/creators/${encodeURIComponent(listing.owner_username)}/playbooks/${encodeURIComponent(listing.slug)}`,
                lastMod: listing.updated_at
                    ? new Date(listing.updated_at).toISOString().slice(0, 10)
                    : new Date().toISOString().slice(0, 10),
                changeFreq: "weekly",
            });
        }

        for (const username of creatorUsernames) {
            urls.push({
                url: `/creators/${encodeURIComponent(username)}`,
                lastMod: new Date().toISOString().slice(0, 10),
                changeFreq: "monthly",
            });
        }

        logger.info({
            msg: "Added listing catalog URLs to sitemap",
            buildingBlockCount: buildingBlocks.length,
            playbookCount: playbooks.length,
            creatorCount: creatorUsernames.length,
        });
    } catch (error) {
        logger.error({
            msg: "Error processing listing catalog for sitemap",
            error: error instanceof Error ? error.message : String(error),
        });
    }

    try {
        const [categorySlugs, tagSlugs] = await Promise.all([
            fetchActiveListingCategorySlugs(supabaseClient),
            fetchActiveListingTagSlugs(supabaseClient),
        ]);
        const hubPaths = listingHubPathsFromSlugs(categorySlugs, tagSlugs);
        const today = new Date().toISOString().slice(0, 10);
        pushSitemapPaths(urls, hubPaths, "weekly", today);
        logger.info({
            msg: "Added listing hub filter URLs to sitemap",
            categoryCount: categorySlugs.length,
            tagCount: tagSlugs.length,
            urlCount: hubPaths.length,
        });
    } catch (error) {
        logger.error({
            msg: "Error processing listing hub filters for sitemap",
            error: error instanceof Error ? error.message : String(error),
        });
    }

    const filtered = urls.filter((u) => {
        const exclude = EXCLUDED_PATHS.some(
            (excluded) => u.url === excluded || u.url.startsWith(excluded + "/")
        );
        return !exclude;
    });

    const withChangefreq = filtered.map((u) => {
        for (const [pattern, changefreq] of Object.entries(CUSTOM_CHANGEFREQ)) {
            if (u.url === pattern) {
                return { ...u, changeFreq: changefreq };
            }
        }
        return u;
    });

    return dedupeByUrl(withChangefreq);
}

function toSitemapXml(urls: SitemapUrl[], baseURL: string): string {
    const base = baseURL.replace(/\/$/, "");
    const urlEntries = urls
        .map((u) => {
            const pathPart = u.url.startsWith("/") ? u.url : `/${u.url}`;
            const loc = escapeXml(`${base}${pathPart}`);
            const lastmod = u.lastMod ? `<lastmod>${escapeXml(u.lastMod)}</lastmod>` : "";
            const cf = u.changeFreq ? `<changefreq>${escapeXml(u.changeFreq)}</changefreq>` : "";
            return `  <url><loc>${loc}</loc>${lastmod}${cf}</url>`;
        })
        .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;
}

export function generateSitemapMiddleware(options: GenerateSitemapOptions): RequestHandler {
    const { baseURL } = options;
    return async (_req, res) => {
        try {
            const urls = await generateSitemapUrls(options);
            const xml = toSitemapXml(urls, baseURL);
            logger.info({ msg: "Sitemap generated", urlCount: urls.length });
            res.type("application/xml").send(xml);
        } catch (error) {
            logger.error({
                msg: "Sitemap generation error",
                error: error instanceof Error ? error.message : String(error),
            });
            const fallback = toSitemapXml(
                [{ url: "/", changeFreq: "daily", lastMod: new Date().toISOString().slice(0, 10) }],
                baseURL
            );
            res.type("application/xml").send(fallback);
        }
    };
}
