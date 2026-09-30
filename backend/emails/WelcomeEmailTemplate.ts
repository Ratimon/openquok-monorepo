import { AbstractEmailTemplate } from "./AbstractEmailTemplate";
import { EMAIL_PRIMARY_COLOR } from "./emailTheme";
import { escapeHtml } from "./htmlEscape";

const SUPPORT_EMAIL = "admin@openquok.com";
const DISCORD_SUPPORT_INVITE_URL = "https://discord.gg/wXgWcYzU4";

type GettingStartedStep = {
    title: string;
    description: string;
    path: string;
};

type GuideLink = {
    label: string;
    href: string;
};

/** Core in-app path every new account should take first. */
const GETTING_STARTED_STEPS: GettingStartedStep[] = [
    {
        title: "Open your dashboard",
        description:
            "See connected channels, drafts, and quick actions on My Dashboard.",
        path: "/account",
    },
    {
        title: "Connect a channel",
        description:
            "Link X, LinkedIn, TikTok, and other networks — OAuth or credentials, depending on the platform.",
        path: "/docs/channels/connect",
    },
    {
        title: "Schedule your first post",
        description:
            "Walk through compose, pick a time, and confirm on the calendar.",
        path: "/docs/getting-started/quickstart",
    },
];

/**
 * Curated guides — product docs entry points, key blogs, and technical onboarding.
 * (General docs tab sections: getting-started, channels, creating-posts, … — start from overview.)
 */
const GUIDE_LINKS: GuideLink[] = [
    {
        label: "Product docs overview",
        href: "/docs/getting-started",
    },
    {
        label: "Channels overview",
        href: "/docs/channels",
    },
    {
        label: "Team collaboration: workspaces, clients, and preview links",
        href: "/blog/team-collaboration-in-openquok-workspaces-clients-and-preview-links",
    },
    {
        label: "Warm up a TikTok account before you scale posting",
        href: "/blog/how-to-warm-up-a-tiktok-account-to-reach-a-us-audience",
    },
    {
        label:
            "CLI getting started — connect OpenClaw, Grok Bot, or another agent host",
        href: "/docs/getting-started-for-cli",
    },
    {
        label: "MCP getting started — connect Claude, ChatGPT, or another MCP client",
        href: "/docs/getting-started-for-mcp",
    },
    {
        label: "Agent & MCP integrations (pick your client)",
        href: "/agents",
    },
    {
        label: "Self-host quick start",
        href: "/docs/getting-started-for-dev/quick-start",
    },
    {
        label: "Join our Discord community",
        href: DISCORD_SUPPORT_INVITE_URL,
    },
];

function absoluteUrl(frontendDomainUrl: string, path: string): string {
    const base = frontendDomainUrl.replace(/\/$/, "");
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${normalizedPath}`;
}

function buildGuideLinkHtml(href: string, label: string): string {
    return `<a href="${escapeHtml(href)}" style="color: ${EMAIL_PRIMARY_COLOR}; text-decoration: underline; font-size: 15px;">${escapeHtml(label)}</a>`;
}

export class WelcomeEmailTemplate extends AbstractEmailTemplate {
    private fullName: string;
    private frontendBaseUrl: string;

    constructor(frontendDomainUrl: string, fullName: string) {
        super();
        this.frontendBaseUrl = frontendDomainUrl.replace(/\/$/, "");
        this.fullName = fullName;
    }

    public buildSubject(): string {
        return "Welcome to OpenQuok!";
    }

    public buildText(): string {
        const greeting = this.fullName || "there";
        const accountUrl = absoluteUrl(this.frontendBaseUrl, "/account");

        const steps = GETTING_STARTED_STEPS.map(
            (step) =>
                `• ${step.title} — ${step.description}\n  ${absoluteUrl(this.frontendBaseUrl, step.path)}`
        ).join("\n\n");

        const guides = GUIDE_LINKS.map(
            (link) => `• ${link.label}\n  ${absoluteUrl(this.frontendBaseUrl, link.href)}`
        ).join("\n\n");

        return `
Hello ${greeting},

Congratulations — your email is verified and your account is ready. You can plan, draft, and schedule social content from one workspace.

Start here:

${steps}

Guides and next steps

${guides}

Questions? Email ${SUPPORT_EMAIL} or join Discord: ${DISCORD_SUPPORT_INVITE_URL}

Open your dashboard: ${accountUrl}

Best regards,
The OpenQuok Team
`.trim();
    }

    public buildHtml(): string {
        const greeting = escapeHtml(this.fullName || "there");
        const accountUrl = absoluteUrl(this.frontendBaseUrl, "/account");

        const stepsHtml = GETTING_STARTED_STEPS.map((step) => {
            const stepUrl = escapeHtml(absoluteUrl(this.frontendBaseUrl, step.path));
            return `
        <li style="margin-bottom: 16px; color: #111;">
            <strong><a href="${stepUrl}" style="color: ${EMAIL_PRIMARY_COLOR}; text-decoration: underline;">${escapeHtml(step.title)}</a></strong>
            — ${escapeHtml(step.description)}
        </li>`;
        }).join("");

        const guidesHtml = GUIDE_LINKS.map((link) => {
            const href = absoluteUrl(this.frontendBaseUrl, link.href);
            return `
        <li style="margin-bottom: 12px; color: #111; font-size: 15px;">
            ${buildGuideLinkHtml(href, link.label)}
        </li>`;
        }).join("");

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to OpenQuok</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff;">
    <h1 style="font-size: 2rem; font-weight: 700; color: #111; margin: 0 0 24px 0; line-height: 1.25;">
        <span style="background-color: #fef3c7; padding: 2px 6px;">Welcome to</span> OpenQuok!
    </h1>
    <p style="margin: 0 0 20px; color: #111; font-size: 16px;">
        Hello <strong>${greeting}</strong>,
    </p>
    <p style="margin: 0 0 28px; color: #111; font-size: 16px;">
        Congratulations — your email is verified and your account is ready. Plan, draft, and schedule social content from one workspace.
    </p>
    <p style="margin: 0 0 16px; font-size: 17px; font-weight: 700; color: #111;">Start here</p>
    <ul style="margin: 0 0 32px 0; padding-left: 20px; font-size: 15px;">
        ${stepsHtml}
    </ul>
    <p style="margin: 32px 0 20px; text-align: center;">
        <a href="${escapeHtml(accountUrl)}" style="display: inline-block; background-color: ${EMAIL_PRIMARY_COLOR}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Open your dashboard</a>
    </p>
    <h2 style="font-size: 1.125rem; font-weight: 700; color: #111; margin: 40px 0 16px 0;">Guides and next steps</h2>
    <ul style="margin: 0 0 32px 0; padding-left: 20px;">
        ${guidesHtml}
    </ul>
    <p style="margin: 0 0 16px; color: #333; font-size: 15px;">
        Questions? Email
        <a href="mailto:${SUPPORT_EMAIL}" style="color: ${EMAIL_PRIMARY_COLOR}; text-decoration: underline;">${SUPPORT_EMAIL}</a>
        or join our
        <a href="${escapeHtml(DISCORD_SUPPORT_INVITE_URL)}" style="color: ${EMAIL_PRIMARY_COLOR}; text-decoration: underline;">Discord community</a>.
    </p>
    <p style="margin: 0; color: #111; font-size: 15px;">
        Best regards,<br>
        <strong>The OpenQuok Team</strong>
    </p>
</body>
</html>
`.trim();
    }
}
