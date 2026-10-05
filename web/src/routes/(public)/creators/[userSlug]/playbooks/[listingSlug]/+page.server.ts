import type { MetaTagsProps } from 'svelte-meta-tags';

import type { CreativeWork, HowTo, HowToStep, Person, WebPage } from 'schema-dts';

import { error } from '@sveltejs/kit';

import { publicPlaybookBySlugPagePresenter } from '$lib/area-public';
import {
	getRootPathPublicCreator,
	getRootPathPublicCreatorPlaybook
} from '$lib/area-public/constants/getRootPathPublicCreators';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import {
	formatPublicCreatorListingHeroTitle,
	formatPublicCreatorListingMetaDescription,
	formatPublicCreatorListingMetaTitleBase,
	formatPublicCreatorListingSeoKeywords
} from '$lib/listings/utils/formatPublicCreatorListingSeoCopy';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createJsonLdGraph } from '$lib/seo/jsonLdSchema';
import { resolveBlueprintWorkflowStepTitle } from '$lib/skill-builder/utils/resolveBlueprintWorkflowStepTitle';

export const ssr = true;

function resolvePlaybookStepText(step: Record<string, unknown>): string | undefined {
	const content = typeof step.content === 'string' ? step.content.trim() : '';
	if (content) return content;

	const prompt = typeof step.prompt === 'string' ? step.prompt.trim() : '';
	if (prompt) return prompt;

	const examplePayload = step.example_payload;
	if (examplePayload) {
		return JSON.stringify(examplePayload, null, 2);
	}

	return undefined;
}

export async function load({ url, params, cookies, fetch, parent }) {
	const userSlug = params.userSlug;
	const listingSlug = params.listingSlug;
	if (typeof userSlug !== 'string' || !userSlug.trim()) {
		throw error(404, 'Playbook not found');
	}
	if (typeof listingSlug !== 'string' || !listingSlug.trim()) {
		throw error(404, 'Playbook not found');
	}

	const playbookVm = await publicPlaybookBySlugPagePresenter.loadPlaybookBySlugStateless({
		userSlug,
		slug: listingSlug,
		fetch
	});
	if (!playbookVm) {
		throw error(404, 'Playbook not found');
	}

	const comments = await publicPlaybookBySlugPagePresenter.loadListingCommentsStateless({
		listingId: playbookVm.id,
		fetch
	});

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;
	const metaTitleBase = formatPublicCreatorListingMetaTitleBase(playbookVm.title, 'playbook');
	const customTitle = `${metaTitleBase} | ${companyName}`;
	const customDescription = formatPublicCreatorListingMetaDescription(playbookVm, 'playbook');
	const heroTitle = formatPublicCreatorListingHeroTitle(playbookVm.title, 'playbook');
	const seoKeywords = formatPublicCreatorListingSeoKeywords(playbookVm, 'playbook');

	const ownerUsername = playbookVm.owner?.username?.trim() ?? userSlug;
	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customTags: seoKeywords,
		customSlug: getRootPathPublicCreatorPlaybook(ownerUsername, playbookVm.slug),
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const ownerName = playbookVm.owner?.fullName?.trim() || playbookVm.owner?.username?.trim() || 'Creator';
	const ownerImage = playbookVm.owner?.avatarUrl?.trim() || undefined;
	const ownerProfileUrl = new URL(`/${getRootPathPublicCreator(ownerUsername)}`, url.origin).href;
	const workflowSteps = playbookVm.stackBlueprint?.workflow_steps ?? [];
	const howToSteps = workflowSteps
		.map<HowToStep | null>((step, index) => {
			const text = resolvePlaybookStepText(step as Record<string, unknown>);
			if (!text) return null;

			return {
				'@type': 'HowToStep',
				position: index + 1,
				name: resolveBlueprintWorkflowStepTitle(step) || `Step ${index + 1}`,
				text
			};
		})
		.filter((step): step is HowToStep => step !== null);
	const howToTools = playbookVm.stackMembers
		.map((member) => member.member?.title?.trim())
		.filter((value): value is string => Boolean(value));
	const referenceSupplies = (playbookVm.stackBlueprint?.reference_assets ?? [])
		.map((asset) => asset.label?.trim())
		.filter((value): value is string => Boolean(value));
	const mainEntityType = howToSteps.length > 0 ? 'HowTo' : 'CreativeWork';
	const schemaData = createJsonLdGraph([
		{
			'@type': 'WebPage',
			'@id': `${canonical}#webpage`,
			name: metaTitleBase,
			description: customDescription,
			url: canonical,
			mainEntity: {
				'@id': `${canonical}#main-entity`
			},
			author: {
				'@id': `${canonical}#author`
			},
			isPartOf: {
				'@type': 'WebSite',
				name: companyName,
				url: url.origin
			}
		} satisfies WebPage,
		{
			'@type': 'Person',
			'@id': `${canonical}#author`,
			name: ownerName,
			url: ownerProfileUrl,
			image: ownerImage,
			alternateName: ownerUsername ? `@${ownerUsername}` : undefined
		} satisfies Person,
		{
			'@type': mainEntityType,
			'@id': `${canonical}#main-entity`,
			name: playbookVm.title,
			description: customDescription,
			url: canonical,
			image: playbookVm.logoImageUrl || undefined,
			author: {
				'@id': `${canonical}#author`
			},
			...(playbookVm.category?.name ? { about: playbookVm.category.name } : {}),
			...(playbookVm.tags.length > 0
				? { keywords: playbookVm.tags.map((tag) => tag.name).join(', ') }
				: {}),
			...(howToTools.length > 0 ? { tool: howToTools } : {}),
			...(referenceSupplies.length > 0 ? { supply: referenceSupplies } : {}),
			...(howToSteps.length > 0 ? { step: howToSteps } : {}),
			mainEntityOfPage: {
				'@id': `${canonical}#webpage`
			}
		} satisfies HowTo | CreativeWork
	]);

	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: metaTitleBase,
			description: customDescription,
			...(playbookVm.logoImageUrl ? { images: [{ url: playbookVm.logoImageUrl }] } : {})
		},
		twitter: {
			title: metaTitleBase,
			description: customDescription
		}
	});

	return {
		pageMetaTags,
		isLoggedIn: !!cookies.get('access_token'),
		heroTitle,
		playbookVm,
		commentsVm: comments,
		schemaData
	};
}
