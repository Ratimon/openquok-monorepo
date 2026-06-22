export type PublicFaqItem = {
	title: string;
	description: string;
};


/** Default Q&A copy when `public_faq.ITEMS` is missing from stored config. */
export const PUBLIC_FAQ_ITEMS: readonly PublicFaqItem[] = [
	{
		title: 'Why switch from Buffer or Hootsuite?',
		description:
			'Buffer and Hootsuite charge $75–$200/month for enterprise feature most teams never use. OpenQuok covers the same UI scheduling basics including connect channels, compose, calendar, multi-channel publish. We also cover agent-first features like workspaces, integrations, and API/CLI access. Same workflow when you post by hand; built for when agents do the work. Less cost, less clutter, and real support from Meta and OpenQuok team.'
	},
	{
		title: 'Can I try OpenQuok for free?',
		description:
			'Yes. OpenQuok offers a 7-day free trial so you can schedule social media posts across your connected channels before you choose a plan. Create an account and start today — no credit card required to explore the scheduler.'
	},
	{
		title: 'How do I schedule social media posts with OpenQuok?',
		description:
			'Connect your channels, compose or import a draft, pick a date and time on the calendar (or kanban), and publish. You can schedule social media posts by hand, from reusable templates, or pipe drafts in from AI agents — then review everything before it goes live.'
	},
	{
		title: 'Can I self-host OpenQuok?',
		description:
			'Yes. OpenQuok is open source, so you can run it on your own infrastructure (eg. AWS, GCP, Hezner, or even vercel) and manage limits locally without needing a subscription.'
	},
	{
		title: 'Can I get a refund?',
		description:
			'With in 1 month, you can get a refund if you have not used the product during a billing period. If you have used the product during a billing period, contact support and we will work with you on a fair resolution. Self-hosted deployments follow your own billing policies.'
	},
	{
		title: 'Can I change plans later?',
		description:
			'Yes. Upgrade or downgrade from account billing settings. Proration and timing follow your Stripe subscription when cloud billing is enabled.'
	},
	{
		title: 'What is the agent workspace?',
		description:
			'An agent workspace is where you connect channels, schedule posts, and collaborate. Workspaces exist to keep agent and automation context focused. Too many channels or tasks in one place can cause context rot or hallucinations. Use separate workspaces for different brands or clients when things get crowded.'
	},
	{
		title: 'What counts as a channel?',
		description:
			'A channel is a connected social account (for example Facebook, Instagram, LinkedIn, TikTok, YouTube, Reddit, Threads, or Pinterest). You schedule posts to the channels you connect.'
	},
	{
		title: 'Can I connect 2 channels to the same platform?',
		description:
			'Yes. Example: SOLO plan can connect 15 total accounts, all of them can be tiktok accounts.'
	},
	{
		title: 'How does team member work?',
		description:
			'Team members are people you invite to a workspace. They can collaborate on content and connect their own channels where your plan allows. Seat limits are shown as invites plus you as owner. For example, “2 + 1 (you) per workspace” means four invited members and one seat for you on each workspace you own.'
	},
	{
		title: 'Will my post get less reach or banned if I use multi-channel publishing with OpenQuok?',
		description:
			'No ! We use the official API for each platform. Your posts should perform the same as if you published them directly on each platform. We had the same concern that algorithms might favor in-app posting, but in our own tests we did not see lower reach when scheduling through OpenQuok.'
	},
	{
		title: 'How does repeated posts work',
		description:
			'Repeated posts let you automatically republish evergreen content on a schedule (daily, weekly, or a custom cadence). It’s a great way to keep promoting ongoing offers, quotes, or other timeless content without manually rescheduling.'
	},
	{
		title: 'What are reusable templates and how does it work?',
		description:
			'Templates are pre-defined groups of channels with custom message templates. If you frequently post to the same combination of accounts (e.g., your personal X + company LinkedIn + Facebook page), you can save it as a Set for one-click posting.'
	},
	{
		title: 'What are reusable signatures and how does it work?',
		description:
			'Signatures are snippets of text you can automatically append to posts (hashtags, links, promos). If you often use the same call-to-action or signature across multiple posts, save it once and reuse it everywhere.'
	},
	{
		title: 'What analytics does OpenQuok offer?',
		description:
			'Get detailed analytics across connected platforms—impressions, likes, comments, shares, bookmarks, and engagement rate—so you can track results over time and see what content resonates most.'
	},
	{
		title: 'Can I schedule comments or threads',
		description:
			'Yes. You can schedule follow-up comments to help drive engagement. On platforms like X and Threads, you can also schedule full threads, while on LinkedIn and Facebook scheduled comments are posted as replies to your main post.'
	},
	{
		title: 'What is the delay feature between posts?',
		description:
			'Use the delay feature to add time gaps between posts and scheduled comments for a more natural publishing cadence—space them out by minutes or hours instead of posting everything at once.'
	},
	{
		title: 'I have connnected too many channels, what should I do?',
		description:
			'The Group management feature let you organize connected channels by client, brand, or any structure you like—making it simple to manage multiple clients or keep personal and business accounts separate. This can be selected to create post later or used by smart filters.'
	}
];
