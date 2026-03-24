import type { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "../utils/Logger";

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

function loadRoutesFromManifest(manifestPath: string): SitemapUrl[] {
    try {
        const manifestData = fs.readFileSync(manifestPath, "utf-8");
        const manifest: RouteManifest = JSON.parse(manifestData);

        logger.info({
            msg: "Loaded routes from manifest",
            manifestPath,
            routeCount: manifest.routes.length,
            generated: manifest.generated,
        });

        return manifest.routes.map((route) => ({
            url: route.path,
            lastMod: new Date().toISOString().slice(0, 10),
            changeFreq: route.changeFreq || "monthly",
        }));
    } catch (error) {
        logger.error({ msg: "Error loading routes manifest", error, manifestPath });
        return [];
    }
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

async function generateSitemapUrls(options: GenerateSitemapOptions): Promise<SitemapUrl[]> {
    const { supabaseClient, routesPath, routesManifestPath } = options;
    const urls: SitemapUrl[] = [];

    urls.push({
        url: "/",
        lastMod: new Date().toISOString().slice(0, 10),
        changeFreq: "weekly",
    });

    if (routesManifestPath && fs.existsSync(routesManifestPath)) {
        logger.info({ msg: "Using routes manifest for static pages", path: routesManifestPath });
        urls.push(...loadRoutesFromManifest(routesManifestPath));
    } else if (routesPath && fs.existsSync(routesPath)) {
        logger.info({ msg: "Scanning file system for routes", path: routesPath });
        try {
            urls.push(...readFolderStructure(routesPath));
        } catch (error) {
            logger.error({ msg: "Error reading routes folder for sitemap", error, routesPath });
        }
    } else {
        logger.warn({
            msg: "No routes source available for static pages",
            manifestPath: routesManifestPath,
            routesPath,
        });
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
