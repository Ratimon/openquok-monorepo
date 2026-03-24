import { Feed } from "feed";
import type { BlogPostLike } from "./dtos/BlogDTO";
import { companyService, marketingService } from "../services";

export type BlogFeedFormat = "rss" | "atom" | "json";

export interface BlogFeedResult {
    rss2: string;
    atom: string;
    json: string;
}

export async function generateBlogRSSFeed(posts: BlogPostLike[]): Promise<BlogFeedResult> {
    const companyInfo = await companyService.getCompanyInformationByProperties(["URL", "NAME"]);
    const marketingInfo = await marketingService.getMarketingInformationByProperties([
        "META_DESCRIPTION",
    ]);

    const URL = companyInfo.URL ?? "";
    const NAME = companyInfo.NAME ?? "Blog";
    const META_DESCRIPTION =
        marketingInfo.META_DESCRIPTION || `Latest blog posts from ${NAME}`;

    const URLtoIMAGES = `${process.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog_images/`;
    const blogURL = `${URL.replace(/\/$/, "")}/blog`;

    const feed = new Feed({
        title: `${NAME} Blog`,
        description: META_DESCRIPTION,
        id: blogURL,
        link: blogURL,
        language: "en",
        favicon: `${URL.replace(/\/$/, "")}/favicon.ico`,
        copyright: `All rights reserved ${new Date().getFullYear()}, ${NAME}`,
        generator: "Content OS Blog System",
        feedLinks: {
            rss2: `${blogURL}/rss.xml`,
            json: `${blogURL}/feed.json`,
            atom: `${blogURL}/atom.xml`,
        },
    });

    posts.forEach((post) => {
        const author = Array.isArray(post.author) ? post.author[0] : post.author;
        const postUrl = `${blogURL}/${post.slug}`;
        feed.addItem({
            title: post.title,
            id: postUrl,
            link: postUrl,
            description: post.description ?? "",
            content: post.content ?? "",
            author: [
                {
                    name: author?.full_name ?? "Anonymous",
                    link: author?.website ?? undefined,
                },
            ],
            date: post.published_at ? new Date(post.published_at) : new Date(),
            image: post.hero_image_filename
                ? `${URLtoIMAGES}${post.hero_image_filename}`
                : undefined,
        });
    });

    return {
        rss2: feed.rss2(),
        atom: feed.atom1(),
        json: feed.json1(),
    };
}

