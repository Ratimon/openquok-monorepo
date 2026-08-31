import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';

import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export type PublicToolsHubFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

export const PUBLIC_TOOLS_HUB_FAQ = {
	faqSubtitle: 'Tools FAQ',
	faqTitle: 'Free OpenQuok tools,answered',
	faqDescription:
		'What each tool does, when you need an account, how channel-specific pages work, and how to move from a free draft to a scheduled post.',
	faqItems: [
		{
			title: 'What free tools does OpenQuok offer?',
			description:
				`OpenQuok ships browser tools for agent skills, visuals, copy, and timing tests. Use ${faqLink(publicFaqHref.skillBuilderTool, 'Skill Builder')} to export SKILL.md, ${faqLink(publicFaqHref.photoEditorTool, 'Photo Editor')} for channel-sized images, ${faqLink(publicFaqHref.humanizerTool, 'Humanizer')} as a free AI humanizer with no sign up, and ${faqLink(publicFaqHref.bestTimeToPostTool, 'Best Time to Post')} to plan benchmark timing experiments. Integrations API docs live under ${faqLink(publicFaqHref.publicApi, 'Public API')}.`
		},
		{
			title: 'Do I need an account to use the tools?',
			description:
				`No for most draft work. Humanizer, Photo Editor, and Skill Builder run in the browser without sign-in. Copy, download, and local edits stay free. ${faqLink(publicFaqHref.signUp, 'Sign up for free')} when you want cloud saves, connected channels, or scheduled posts from your workspace.`
		},
		{
			title: 'Can I open a tool for one social network?',
			description:
				`Yes. Skill Builder, Photo Editor, Humanizer, and Best Time to Post each list channel pages from the ${faqLink(publicFaqHref.tools, 'Tools')} hub — for example LinkedIn Humanizer or TikTok Best Time to Post. Pick a channel card to preselect formats, sample copy, and benchmark windows for that network.`
		},
		{
			title: 'How do I schedule a post after I use a tool?',
			description:
				`Finish your draft in the tool, then ${faqLink(publicFaqHref.signUp, 'create a free account')} and connect channels with the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')}. Schedule from the workspace calendar or kanban. Agents can also enqueue posts through the ${faqLink(publicFaqHref.cliGettingStarted, 'CLI getting started')} guide.`
		}
	]
} satisfies PublicToolsHubFaqSection;
