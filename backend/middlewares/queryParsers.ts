import type { Request, RequestHandler } from "express";

/** Primitive query parsers for reuse. */
export const QueryParsers = {
    string: (value: string | string[] | undefined): string | null => {
        if (!value) return null;
        if (typeof value === "string") return value;
        if (Array.isArray(value)) return value[0] ?? null;
        return null;
    },
    number: (value: string | string[] | undefined): number | undefined => {
        if (!value) return undefined;
        const str = Array.isArray(value) ? value[0] : value;
        if (typeof str !== "string") return undefined;
        const parsed = Number.parseInt(str, 10);
        return Number.isNaN(parsed) ? undefined : parsed;
    },
    boolean: (value: string | string[] | undefined): boolean | null => {
        if (!value) return null;
        const str = Array.isArray(value) ? value[0] : value;
        if (typeof str !== "string") return null;
        return str.toLowerCase() === "true";
    },
    json: <T = unknown>(value: string | string[] | undefined): T | null => {
        if (!value) return null;
        const str = Array.isArray(value) ? value[0] : value;
        if (typeof str !== "string") return null;
        try {
            return JSON.parse(str) as T;
        } catch {
            return null;
        }
    },
};

const stringArray = (value: string | string[] | undefined): string[] | null => {
    if (!value) return null;
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [value];
        } catch {
            if (value.includes(",")) {
                return value
                    .split(",")
                    .map((item) => item.trim())
                    .filter((item) => item.length > 0);
            }
            return [value];
        }
    }
    return null;
};

interface QueryParseRules {
    [key: string]: (value: string | string[] | undefined) => unknown;
}

function createQueryParser<TQuery extends Record<string, unknown>>(
    rules: QueryParseRules
): RequestHandler {
    return (req, _res, next) => {
        try {
            const parsedQuery: Partial<TQuery> = {};
            for (const [key, parser] of Object.entries(rules)) {
                (parsedQuery as Record<string, unknown>)[key] = parser(
                    req.query[key] as string | string[] | undefined
                );
            }
            (req as Request & { parsedQuery: Partial<TQuery> }).parsedQuery = parsedQuery;
            next();
        } catch (error) {
            next(error);
        }
    };
}

export interface ParsedConfigPropertiesQuery {
    properties?: string[] | null;
}

export function createConfigPropertiesParser(): RequestHandler {
    return createQueryParser<Record<string, unknown> & ParsedConfigPropertiesQuery>({
        properties: stringArray,
    });
}

export interface ParsedCombinedConfigPropertiesQuery {
    companyProperties?: string[] | null;
    marketingProperties?: string[] | null;
}

export function createCombinedConfigPropertiesParser(): RequestHandler {
    return createQueryParser<Record<string, unknown> & ParsedCombinedConfigPropertiesQuery>({
        companyProperties: stringArray,
        marketingProperties: stringArray,
    });
}

/** Published blog posts list query (limit, skipId, skip, searchTerm, topicId, sortByKey, sortByOrder, range, authorId). */
export interface ParsedPublishedBlogPostsQuery extends Record<string, unknown> {
    limit?: number;
    skipId?: string | null;
    skip?: number;
    searchTerm?: string | null;
    topicId?: string | null;
    sortByKey?: string | null;
    sortByOrder?: boolean | null;
    range?: { start: number; end: number } | null;
    authorId?: string | null;
}

const combineParsers = (...parserSets: QueryParseRules[]): QueryParseRules =>
    parserSets.reduce((combined, parsers) => ({ ...combined, ...parsers }), {});

const CommonQueryParsers = {
    pagination: { limit: QueryParsers.number, skipId: QueryParsers.string },
    skip: { skip: QueryParsers.number },
    search: { searchTerm: QueryParsers.string },
    blogFiltering: { topicId: QueryParsers.string, authorId: QueryParsers.string },
    sorting: { sortByKey: QueryParsers.string, sortByOrder: QueryParsers.boolean },
    range: { range: QueryParsers.json<{ start: number; end: number }> },
};

const publishedBlogPostsRules = combineParsers(
    CommonQueryParsers.pagination,
    CommonQueryParsers.skip,
    CommonQueryParsers.search,
    CommonQueryParsers.blogFiltering,
    CommonQueryParsers.sorting,
    CommonQueryParsers.range
);

export function createPublishedBlogPostsParser(): RequestHandler {
    return createQueryParser<ParsedPublishedBlogPostsQuery>(publishedBlogPostsRules);
}

/** Admin blog posts list query (limit, searchTerm, topicId, sortByKey, sortByOrder, range). No skipId/skip/authorId. */
export interface ParsedAdminBlogPostsQuery extends Record<string, unknown> {
    limit?: number;
    searchTerm?: string | null;
    topicId?: string | null;
    sortByKey?: string | null;
    sortByOrder?: boolean | null;
    range?: { start: number; end: number } | null;
}

const adminBlogPostsRules = combineParsers(
    CommonQueryParsers.pagination,
    CommonQueryParsers.search,
    CommonQueryParsers.blogFiltering,
    CommonQueryParsers.sorting,
    CommonQueryParsers.range
);

export function createAdminBlogPostsParser(): RequestHandler {
    return createQueryParser<ParsedAdminBlogPostsQuery>(adminBlogPostsRules);
}

/** Admin blog comments list query (limit, searchTerm, sortByKey, sortByOrder, range). No topicId. */
export interface ParsedAdminBlogCommentsQuery extends Record<string, unknown> {
    limit?: number;
    searchTerm?: string | null;
    sortByKey?: string | null;
    sortByOrder?: boolean | null;
    range?: { start: number; end: number } | null;
}

const adminBlogCommentsRules = combineParsers(
    CommonQueryParsers.pagination,
    CommonQueryParsers.search,
    CommonQueryParsers.sorting,
    CommonQueryParsers.range
);

export function createAdminBlogCommentsParser(): RequestHandler {
    return createQueryParser<ParsedAdminBlogCommentsQuery>(adminBlogCommentsRules);
}

/** Admin blog activities list query (limit, sortByKey, sortByOrder, range, post_id, activity_type). */
export interface ParsedAdminBlogActivitiesQuery extends Record<string, unknown> {
    limit?: number;
    sortByKey?: string | null;
    sortByOrder?: boolean | null;
    range?: { start: number; end: number } | null;
    post_id?: string | null;
    activity_type?: string | null;
}

const adminBlogActivitiesRules = combineParsers(
    CommonQueryParsers.pagination,
    CommonQueryParsers.sorting,
    CommonQueryParsers.range,
    { post_id: QueryParsers.string, activity_type: QueryParsers.string }
);

export function createAdminBlogActivitiesParser(): RequestHandler {
    return createQueryParser<ParsedAdminBlogActivitiesQuery>(adminBlogActivitiesRules);
}
