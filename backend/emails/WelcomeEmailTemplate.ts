import { AbstractEmailTemplate } from "./AbstractEmailTemplate";
import { EMAIL_PRIMARY_COLOR } from "./emailTheme";
import { escapeHtml } from "./htmlEscape";

const SUPPORT_EMAIL = "admin@openquok.com";
const ONBOARDING_YOUTUBE_VIDEO_ID = "iKNimZ9FBu8";

type GettingStartedStep = {
    title: string;
    description: string;
    path: string;
};

type ResourceLink = {
    label: string;
    href: string;
};

const GETTING_STARTED_STEPS: GettingStartedStep[] = [
    {
        title: "Warm up your account",
        description:
            "Follow our guide on warming up a TikTok account for US audiences before you publish at scale.",
        path: "/blog/how-to-warm-up-tiktok-account-us-audience",
    },
    {
        title: "Home",
        description: "Open your dashboard for recent activity, quick actions, and workspace status.",
        path: "/account",
    },
    {
        title: "Calendar",
        description: "Plan, review, and schedule posts on a visual content calendar.",
        path: "/account/calendar",
    },
    {
        title: "Templates",
        description: "Save reusable post templates to draft faster and stay consistent.",
        path: "/account/templates",
    },
    {
        title: "Playbooks",
        description: "Install workflow playbooks to run multi-step content strategies.",
        path: "/account/playbooks",
    },
    {
        title: "Auto Plugs",
        description: "Set up automated follow-up comments and engagement plugs.",
        path: "/account/plugs",
    },
    {
        title: "Analytics",
        description: "Track performance and engagement across your connected channels.",
        path: "/account/analytics",
    },
    {
        title: "Media",
        description: "Upload and manage images and videos for your scheduled posts.",
        path: "/account/media",
    },
];

const RESOURCE_LINKS: ResourceLink[] = [
    {
        label: "Watch the getting started demo",
        href: `https://www.youtube.com/watch?v=${ONBOARDING_YOUTUBE_VIDEO_ID}`,
    },
    {
        label: "Browse developer documentation",
        href: "/docs",
    },
    {
        label: "Explore supported channels",
        href: "/channels",
    },
    {
        label: "View the product roadmap",
        href: "/roadmap",
    },
    {
        label: "Read our vision on content integrity",
        href: "/blog/openquok-social-content-needs-integrity-not-only-abtopilot",
    },
    {
        label: "Browse the playbooks directory",
        href: "/playbooks",
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

function buildResourceLinkHtml(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="color: ${EMAIL_PRIMARY_COLOR}; text-decoration: underline; font-size: 15px;">${escapeHtml(label)} &gt;</a>`;
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

        const resources = RESOURCE_LINKS.map(
            (link) => `• ${link.label}\n  ${absoluteUrl(this.frontendBaseUrl, link.href)}`
        ).join("\n\n");

        return `
Hello ${greeting},

Congratulations — your email is verified and your account is ready. You now can plan, draft, and schedule social content with confidence.

Here's how to get started:

${steps}

Helpful resources

${resources}

Should you have any questions or require assistance, our support is always available. Feel free to reach out via ${SUPPORT_EMAIL}.

Thank you for being a valued member of the OpenQuok community. We look forward to continuing to serve you in the best possible way.

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

        const resourceRows: string[] = [];
        for (let i = 0; i < RESOURCE_LINKS.length; i += 2) {
            const left = RESOURCE_LINKS[i];
            const right = RESOURCE_LINKS[i + 1];
            resourceRows.push(`
        <tr>
            <td style="width: 50%; padding: 8px 12px 8px 0; vertical-align: top;">
                ${buildResourceLinkHtml(absoluteUrl(this.frontendBaseUrl, left.href), left.label)}
            </td>
            <td style="width: 50%; padding: 8px 0 8px 12px; vertical-align: top;">
                ${right ? buildResourceLinkHtml(absoluteUrl(this.frontendBaseUrl, right.href), right.label) : "&nbsp;"}
            </td>
        </tr>`);
        }

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
        Congratulations — your email is verified and your OpenQuok account is ready. You are now part of a community of creators and teams who plan, draft, and schedule social content with confidence.
    </p>
    <p style="margin: 0 0 16px; font-size: 17px; font-weight: 700; color: #111;">Here's how to get started:</p>
    <ul style="margin: 0 0 32px 0; padding-left: 20px; font-size: 15px;">
        ${stepsHtml}
    </ul>
    <p style="margin: 32px 0 20px; text-align: center;">
        <a href="${escapeHtml(accountUrl)}" style="display: inline-block; background-color: ${EMAIL_PRIMARY_COLOR}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Open your dashboard</a>
    </p>
    <h2 style="font-size: 1.125rem; font-weight: 700; color: #111; margin: 40px 0 16px 0;">Helpful resources</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 32px 0;">
        ${resourceRows.join("")}
    </table>
    <p style="margin: 0 0 16px; color: #333; font-size: 15px;">
        Should you have any questions or require assistance, our support is always available. Feel free to reach out via
        <a href="mailto:${SUPPORT_EMAIL}" style="color: ${EMAIL_PRIMARY_COLOR}; text-decoration: underline;">${SUPPORT_EMAIL}</a>.
    </p>
    <p style="margin: 0 0 28px; color: #333; font-size: 15px;">
        Thank you for being a valued member of the OpenQuok community. We look forward to continuing to serve you in the best possible way.
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
