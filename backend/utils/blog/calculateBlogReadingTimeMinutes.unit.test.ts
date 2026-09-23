import { calculateBlogReadingTimeMinutes } from "./calculateBlogReadingTimeMinutes";

describe("calculateBlogReadingTimeMinutes", () => {
    it("returns at least 1 minute for empty content", () => {
        expect(calculateBlogReadingTimeMinutes("")).toBe(1);
    });

    it("strips HTML tags before counting words", () => {
        const words = Array.from({ length: 400 }, (_, i) => `word${i}`).join(" ");
        const html = `<p>${words}</p><p>More <strong>text</strong> here.</p>`;
        expect(calculateBlogReadingTimeMinutes(html)).toBe(3);
    });

    it("respects 200 words per minute", () => {
        const words = Array.from({ length: 200 }, () => "word").join(" ");
        expect(calculateBlogReadingTimeMinutes(words)).toBe(1);
        expect(calculateBlogReadingTimeMinutes(`${words} extra`)).toBe(2);
    });
});
