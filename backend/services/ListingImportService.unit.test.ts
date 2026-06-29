import {
    parseGithubUrl,
    toRawContentUrl,
    parseSkillMarkdown,
    hashContent,
    buildGithubImportPreview,
} from "./ListingImportService";

describe("ListingImportService helpers", () => {
    describe("parseGithubUrl", () => {
        it("parses blob SKILL.md URLs", () => {
            const parsed = parseGithubUrl(
                "https://github.com/peterskoett/self-improving-agent/blob/master/SKILL.md"
            );
            expect(parsed).toEqual({
                owner: "peterskoett",
                repo: "self-improving-agent",
                ref: "master",
                skillPath: "SKILL.md",
            });
        });

        it("parses tree folder URLs to SKILL.md in folder", () => {
            const parsed = parseGithubUrl(
                "https://github.com/acme/skills/tree/main/packages/foo"
            );
            expect(parsed).toEqual({
                owner: "acme",
                repo: "skills",
                ref: "main",
                skillPath: "packages/foo/SKILL.md",
            });
        });

        it("parses repo root URLs to root SKILL.md on main", () => {
            const parsed = parseGithubUrl("https://github.com/acme/my-skill");
            expect(parsed).toEqual({
                owner: "acme",
                repo: "my-skill",
                ref: "main",
                skillPath: "SKILL.md",
            });
        });

        it("parses raw.githubusercontent.com URLs", () => {
            const parsed = parseGithubUrl(
                "https://raw.githubusercontent.com/acme/repo/v1.0.0/skills/demo/SKILL.md"
            );
            expect(parsed).toEqual({
                owner: "acme",
                repo: "repo",
                ref: "v1.0.0",
                skillPath: "skills/demo/SKILL.md",
            });
        });
    });

    describe("parseSkillMarkdown", () => {
        it("splits YAML frontmatter and body", () => {
            const raw = `---
name: demo-skill
description: A demo skill for testing imports.
license: MIT
version: 1.2.0
metadata: {"tags":["demo"]}
---

## Overview

Body content here.
`;
            const parsed = parseSkillMarkdown(raw);
            expect(parsed.skillName).toBe("demo-skill");
            expect(parsed.description).toBe("A demo skill for testing imports.");
            expect(parsed.license).toBe("MIT");
            expect(parsed.version).toBe("1.2.0");
            expect(parsed.metadata).toEqual({ tags: ["demo"] });
            expect(parsed.body).toContain("## Overview");
        });
    });

    describe("buildGithubImportPreview", () => {
        it("maps SKILL.md fields to listing preview DTO", () => {
            const raw = `---
name: self-improvement
description: Long trigger description for the skill.
license: Apache-2.0
---

### Installation

\`\`\`bash
npm install -g demo-skill
\`\`\`
`;
            const parsedUrl = parseGithubUrl("https://github.com/acme/self-improving-agent/blob/main/SKILL.md")!;
            const preview = buildGithubImportPreview(raw, parsedUrl);

            expect(preview.extensionType).toBe("skills");
            expect(preview.skillName).toBe("self-improvement");
            expect(preview.title).toBe("Self Improvement");
            expect(preview.slug).toBe("self-improvement");
            expect(preview.excerpt).toBe("Long trigger description for the skill.");
            expect(preview.installCommandSkills).toBe("npm install -g demo-skill");
            expect(preview.skillSourceUrl).toBe(toRawContentUrl(parsedUrl));
            expect(preview.sourceRepoUrl).toBe("https://github.com/acme/self-improving-agent");
            expect(preview.sourceContentHash).toBe(hashContent(raw));
        });

        it("maps both extension type when override is both", () => {
            const raw = `---
name: openquok-core
description: Schedule posts with the openquok CLI.
---

## Overview

Body content here.
`;
            const parsedUrl = parseGithubUrl("https://github.com/acme/openquok-core/blob/main/SKILL.md")!;
            const preview = buildGithubImportPreview(raw, parsedUrl, "both");

            expect(preview.extensionType).toBe("both");
            expect(preview.descriptionSkills).toBe("Schedule posts with the openquok CLI.");
            expect(preview.contentSkills).toContain("## Overview");
            expect(preview.descriptionMcp).toBeNull();
            expect(preview.contentMcp).toBeNull();
        });

        it("reads extension_type from SKILL.md frontmatter", () => {
            const raw = `---
name: combo-skill
description: Skills and MCP combo.
extension_type: both
---

Body.
`;
            const parsedUrl = parseGithubUrl("https://github.com/acme/combo/blob/main/SKILL.md")!;
            const preview = buildGithubImportPreview(raw, parsedUrl);

            expect(preview.extensionType).toBe("both");
            expect(preview.contentSkills).toBe("Body.");
        });

        it("rejects MCP extension type for SKILL.md import", () => {
            const raw = `---
name: mcp-only
description: MCP listing.
extension_type: mcp
---

Body.
`;
            const parsedUrl = parseGithubUrl("https://github.com/acme/mcp-only/blob/main/SKILL.md")!;
            expect(() => buildGithubImportPreview(raw, parsedUrl)).toThrow(
                "GitHub import reads SKILL.md and supports Skills or Both extension types only."
            );
            expect(() => buildGithubImportPreview(raw, parsedUrl, "mcp")).toThrow(
                "GitHub import reads SKILL.md and supports Skills or Both extension types only."
            );
        });
    });
});
