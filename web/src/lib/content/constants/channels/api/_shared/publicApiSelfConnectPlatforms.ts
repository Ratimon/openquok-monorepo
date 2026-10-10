import type { PublicApiPlatformSlug } from '$lib/content/constants/channels/api/_shared/types';
import type { PublicFaqItem } from '$lib/content/constants/faq';
import { faqHrefDocs, faqLink, faqLinkSelfHostChannelSetup, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

/** Dashboard connect (not public OAuth URL) — user’s own credentials or extension session. */
export const PUBLIC_API_SELF_CONNECT_SLUGS: ReadonlySet<PublicApiPlatformSlug> = new Set([
	'bluesky',
	'devto',
	'skool'
]);

export function isPublicApiSelfConnectSlug(slug: PublicApiPlatformSlug): boolean {
	return PUBLIC_API_SELF_CONNECT_SLUGS.has(slug);
}

export function buildPublicApiSelfConnectDescription(
	slug: PublicApiPlatformSlug,
	platformLabel: string,
	docsPath: string
): string {
	const signUp = faqLink(publicFaqHref.signUp, 'Sign up for free');
	const selfHost = faqLinkSelfHostChannelSetup(docsPath, platformLabel);

	switch (slug) {
		case 'bluesky':
			return `${signUp}, open a workspace, and choose Connect channel → ${platformLabel}. Enter your handle or email, PDS service URL (https://bsky.social for most accounts), and an app password from Bluesky settings — not your main password. For self-hosted deployments, see the ${selfHost}.`;
		case 'devto':
			return `${signUp}, open a workspace, and choose Connect channel → ${platformLabel}. Paste a personal API key from DEV → Extensions for your account — not a key you issue to customers. For self-hosted deployments, see the ${selfHost}.`;
		case 'skool':
			return `${signUp}, install the ${faqLink(faqHrefDocs('installation/chrome-extension'), 'OpenQuok browser extension')}, sign in on skool.com in the same Chrome profile, then Add Channel → ${platformLabel} and approve the extension flow. For self-hosted deployments, see the ${selfHost}.`;
		default:
			return '';
	}
}

export function buildPublicApiPersonalAccountFaqItem(
	slug: PublicApiPlatformSlug,
	platformLabel: string
): PublicFaqItem {
	const oauthForApps = faqLink(publicFaqHref.oauthApps, 'OAuth2 for apps');
	const connectGuide = faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide');

	let credentialLine: string;
	switch (slug) {
		case 'bluesky':
			credentialLine =
				'Connect your Bluesky account with your app password. Do not collect other people’s app passwords in your product or publish to their accounts from your opo_ token.';
			break;
		case 'devto':
			credentialLine =
				'Connect your Dev.to account with your API key. Do not embed a shared key in a multi-tenant app so you post articles as yourself on behalf of unrelated users.';
			break;
		case 'skool':
			credentialLine =
				'Connect your Skool session through your browser extension approval. Do not run a “post to Skool for my customers” service without each customer connecting their own Skool channel in their own workspace.';
			break;
		default:
			credentialLine = `Connect your own ${platformLabel} channel in the dashboard before you call the API.`;
	}

	return {
		title: `Is the ${platformLabel} API for my own account?`,
		description:
			`${credentialLine} OpenQuok is built for your automation — agents, scripts, and drafts you approve — not for reselling scheduling to end users on credentials they never connected. If your product’s users must connect their social accounts, use ${oauthForApps} so each user authorizes their channel; see the ${connectGuide}.`
	};
}
