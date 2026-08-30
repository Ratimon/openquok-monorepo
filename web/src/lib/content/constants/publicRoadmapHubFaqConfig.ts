import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';

import { getRootPathPublicRoadmap } from '$lib/area-public/constants/getRootPathPublicRoadmap';
import { getSocialProfileHref } from '$lib/config/constants/config';
import { faqLink } from '$lib/content/utils/publicFaqLinks';
import { route } from '$lib/utils/path';

const roadmapHref = route(getRootPathPublicRoadmap());
const discordHref = getSocialProfileHref('SOCIAL_LINKS_DISCORD');

export type PublicRoadmapHubFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

export const PUBLIC_ROADMAP_HUB_FAQ = {
	faqSubtitle: 'Roadmap FAQ',
		faqTitle: 'Product Roadmap, answered',
	faqDescription:
		'What the public roadmap shows, how to propose features on this page, and where to discuss ideas with the team.',
	faqItems: [
		{
			title: 'What does the OpenQuok roadmap show?',
			description:
				`The ${faqLink(roadmapHref, 'roadmap')} lists planned, in-progress, and shipped work across scheduling, agents, integrations, and platform tooling. Filter by category to focus on the area you care about. Status columns update as items move through delivery.`
		},
		{
			title: 'How do I propose a feature?',
			description:
				`Use the Propose a feature button on this page. Describe the problem, who it helps, and any links that add context. Signed-in users can submit faster; guests can leave an email so we can follow up. Every proposal is reviewed by the product team.`
		},
		{
			title: 'How does OpenQuok prioritize roadmap work?',
			description:
				`We weigh customer impact, support volume, security, and fit with the agent-first scheduler direction. Roadmap cards move when work starts or ships — not every proposal lands on a fixed date. Upvotes and detailed feedback help us rank related items together.`
		},
		{
			title: 'Where can I discuss roadmap ideas live?',
			description:
				`Join the ${faqLink(discordHref, 'Discord community')} to ask questions, share use cases, and hear early announcements. For formal tracking, still submit a proposal from this ${faqLink(roadmapHref, 'roadmap')} page so the team can link your idea to delivery work.`
		}
	]
} satisfies PublicRoadmapHubFaqSection;
