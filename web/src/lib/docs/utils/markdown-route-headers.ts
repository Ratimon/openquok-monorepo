/**
 * Shared headers for raw Markdown GET routes. Not listed in sitemap (duplicate of HTML docs);
 * `noindex` avoids indexing alternate-format URLs if crawlers discover them.
 */
export const markdownResourceHeaders: HeadersInit = {
	'Content-Type': 'text/markdown; charset=utf-8',
	'X-Content-Type-Options': 'nosniff',
	'X-Robots-Tag': 'noindex'
};
