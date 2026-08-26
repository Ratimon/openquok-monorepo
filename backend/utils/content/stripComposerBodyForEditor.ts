import { htmlToPlainText } from "./htmlToPlain.js";

export type IntegrationEditorMode = "none" | "normal" | "markdown" | "html";

export type StripComposerBodyOptions = {
    /** Trim the transformed body (default `true`). */
    trim?: boolean;
};

const COMPOSER_HTML_TAG_RE = /<[a-z][\s\S]*>/i;

const ALLOWED_COMPOSER_HTML_TAGS = new Set([
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "a",
    "h1",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
]);

function looksLikeHtml(value: string): boolean {
    return COMPOSER_HTML_TAG_RE.test(value);
}

function decodeBasicHtmlEntities(text: string): string {
    return text
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, "\"")
        .replace(/&#39;/gi, "'");
}

function collapseComposerWhitespace(text: string): string {
    return text
        .replace(/[ \t]+\n/g, "\n")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function stripDisallowedComposerHtmlTags(html: string): string {
    return html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tagName: string) => {
        const tag = tagName.toLowerCase();
        return ALLOWED_COMPOSER_HTML_TAGS.has(tag) ? match : "";
    });
}

function sanitizeComposerHtml(html: string): string {
    if (!html.trim()) return "";
    if (!looksLikeHtml(html)) {
        return html;
    }

    let out = html
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
        .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
        .replace(/<(iframe|object|embed|form|input|meta|link)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
        .replace(/<(iframe|object|embed|form|input|meta|link)\b[^>]*\/?>/gi, "");

    out = stripDisallowedComposerHtmlTags(out);
    return out.replace(/\s+href\s*=\s*(?=\s|>)/gi, "");
}

function htmlToMarkdown(html: string): string {
    if (!html.trim()) return "";
    if (!looksLikeHtml(html)) return html.trim();

    let s = html
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");

    s = s.replace(/<br\s*\/?>/gi, "\n");
    s = s.replace(/<\/p>\s*<p[^>]*>/gi, "\n\n");
    s = s.replace(/<\/div>\s*<div[^>]*>/gi, "\n\n");
    s = s.replace(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level: string, inner: string) => {
        const hashes = "#".repeat(Number(level));
        return `\n\n${hashes} ${inner.trim()}\n\n`;
    });
    s = s.replace(/<li[^>]*>/gi, "\n- ");
    s = s.replace(/<\/li>/gi, "");
    s = s.replace(/<\/?[uo]l[^>]*>/gi, "\n");
    s = s.replace(/<(?:strong|b)>([\s\S]*?)<\/(?:strong|b)>/gi, "**$1**");
    s = s.replace(/<(?:em|i)>([\s\S]*?)<\/(?:em|i)>/gi, "*$1*");
    s = s.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
    s = s.replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`");
    s = s.replace(/<\/p>/gi, "\n\n");
    s = s.replace(/<p[^>]*>/gi, "");
    s = s.replace(/<[^>]+>/g, "");
    s = decodeBasicHtmlEntities(s);
    return collapseComposerWhitespace(s);
}

/**
 * Transform composer storage (HTML from TipTap or legacy plain text) into the body shape
 * each provider expects at publish / validation time.
 */
export function stripComposerBodyForEditor(
    editor: IntegrationEditorMode,
    html: string,
    options?: StripComposerBodyOptions
): string {
    const raw = typeof html === "string" ? html : "";
    if (!raw.trim()) return "";

    let out: string;
    switch (editor) {
        case "none":
        case "normal":
            out = htmlToPlainText(raw);
            break;
        case "markdown":
            out = htmlToMarkdown(raw);
            break;
        case "html":
            out = sanitizeComposerHtml(raw);
            break;
        default:
            out = htmlToPlainText(raw);
            break;
    }

    if (options?.trim === false) return out;
    return out.trim();
}
