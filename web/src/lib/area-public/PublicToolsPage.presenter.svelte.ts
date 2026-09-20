import {
	buildToolsHubHeroTitle,
	buildToolsHubMetaDescription,
	buildToolsHubMetaTitle
} from '$lib/content/utils/buildProgrammaticSeoTitles';

export class PublicToolsPagePresenter {

	getToolsIndexVm() {
		return {
			metaTitle: buildToolsHubMetaTitle(),
			heroTitle: buildToolsHubHeroTitle(),
			metaDescription: buildToolsHubMetaDescription(),
			keywords: [
				'free social media tools',
				'free social media scheduling tools',
				'AI humanizer for social posts',
				'social media skill builder',
				'best time to post calculator',
				'social media photo editor',
				'API payload wizard',
				'SKILL.md generator',
				'agent workflow tools'
			]
		};
	}
	
}
