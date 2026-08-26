import { stripComposerBodyForEditor } from "./stripComposerBodyForEditor.js";

describe("stripComposerBodyForEditor", () => {
    it("returns empty for blank input", () => {
        expect(stripComposerBodyForEditor("normal", "")).toBe("");
        expect(stripComposerBodyForEditor("markdown", "   ")).toBe("");
    });

    it("normal mode strips HTML to plain text with line breaks", () => {
        expect(stripComposerBodyForEditor("normal", "<p>Hello<br>world</p>")).toBe("Hello\nworld");
    });

    it("none mode matches normal plain-text output today", () => {
        const html = "<p><strong>Bold</strong> text</p>";
        expect(stripComposerBodyForEditor("none", html)).toBe(
            stripComposerBodyForEditor("normal", html)
        );
    });

    it("markdown mode converts common TipTap HTML to markdown", () => {
        expect(
            stripComposerBodyForEditor(
                "markdown",
                "<p>Hello <strong>world</strong></p><p><a href=\"https://example.com\">link</a></p>"
            )
        ).toBe("Hello **world**\n\n[link](https://example.com)");
    });

    it("markdown mode preserves legacy plain text", () => {
        expect(stripComposerBodyForEditor("markdown", "Already plain")).toBe("Already plain");
    });

    it("html mode keeps allowed tags and strips scripts", () => {
        const out = stripComposerBodyForEditor(
            "html",
            "<p onclick=\"alert(1)\">Hi</p><script>bad()</script>"
        );
        expect(out).toContain("<p");
        expect(out).toContain("Hi");
        expect(out).not.toContain("script");
        expect(out).not.toContain("onclick");
    });

    it("html mode preserves legacy plain text", () => {
        expect(stripComposerBodyForEditor("html", "Plain caption")).toBe("Plain caption");
    });
});
