/// <reference types="jest" />

import { RedditProvider } from "../../integrations/providers/reddit/redditProvider";
import {
    buildMemberBrowserHandoffDto,
    parseReleaseFieldsFromHandoffUrl,
} from "./memberBrowserHandoff";
import type { SocialPostLike } from "../dtos/PostDTO";

function minimalPost(overrides: Partial<SocialPostLike> = {}): SocialPostLike {
    const now = new Date().toISOString();
    return {
        id: "post-1",
        state: "AWAITING_MEMBER",
        publish_date: now,
        organization_id: "org-1",
        integration_id: "int-1",
        content: "Hello **world**",
        delay: 0,
        post_group: "group-1",
        title: null,
        description: null,
        parent_post_id: null,
        release_id: null,
        release_url: null,
        settings: JSON.stringify({
            providerSettings: {
                reddit: {
                    subreddit: "test",
                    title: "My title",
                },
            },
        }),
        image: null,
        interval_in_days: null,
        error: null,
        deleted_at: null,
        created_by_user_id: null,
        note: null,
        is_agent_edited: false,
        is_reviewed: false,
        created_at: now,
        updated_at: now,
        ...overrides,
    };
}

describe("memberBrowserHandoff", () => {
    it("buildMemberBrowserHandoffDto maps reddit settings and body", () => {
        const provider = new RedditProvider();
        const dto = buildMemberBrowserHandoffDto(minimalPost(), provider);
        expect(dto.subreddit).toBe("r/test");
        expect(dto.title).toBe("My title");
        expect(dto.body).toContain("Hello");
        expect(dto.providerIdentifier).toBe("reddit");
        expect(dto.mediaUrls).toEqual([]);
        expect(dto.mediaItems).toEqual([]);
    });

    it("buildMemberBrowserHandoffDto resolves http and storage media paths", () => {
        const provider = new RedditProvider();
        const image = JSON.stringify({
            items: [
                { id: "m1", path: "https://cdn.example.com/photo.jpg" },
                { id: "m2", path: "user-1/upload/video.mp4" },
            ],
        });
        const dto = buildMemberBrowserHandoffDto(minimalPost({ image }), provider);
        expect(dto.mediaUrls[0]).toBe("https://cdn.example.com/photo.jpg");
        expect(dto.mediaItems).toHaveLength(2);
        expect(dto.mediaItems[0]?.fileName).toBe("photo.jpg");
    });

    it("parseReleaseFieldsFromHandoffUrl extracts reddit post id from comments URL", () => {
        const result = parseReleaseFieldsFromHandoffUrl(
            "reddit",
            "https://www.reddit.com/r/test/comments/abc123/slug/"
        );
        expect(result.releaseId).toBe("abc123");
        expect(result.releaseUrl).toContain("abc123");
    });
});
