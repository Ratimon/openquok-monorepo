import type { ListingProgrammerModel } from '$lib/listings/Listing.repository.svelte';
import type { ListingFormSchemaType } from '$lib/listings/listing.types';
import {
	getDefaultSchemaTypeForListingKind,
	getSchemaTypeForExtensionCategory
} from '$lib/listings/constants/listingSchemaTypes';

export function listingPmToFormPayload(
	listing: ListingProgrammerModel,
	overrides?: Partial<Pick<ListingFormSchemaType, 'is_user_published' | 'is_admin_published'>>
): ListingFormSchemaType {
	const listingKind = listing.listingKind === 'stack' ? 'stack' : 'extension';
	const categorySlug = listing.category?.slug;
	const schemaType =
		(listing.schemaType as ListingFormSchemaType['schema_type']) ??
		(listingKind === 'extension'
			? getSchemaTypeForExtensionCategory(categorySlug)
			: getDefaultSchemaTypeForListingKind('stack'));
	const faq =
		listing.faq?.map((item) => ({
			question: item.question ?? '',
			answer: item.answer ?? ''
		})) ?? [];

	return {
		id: listing.id,
		title: listing.title,
		excerpt: listing.excerpt ?? '',
		click_url: listing.clickUrl ?? '',
		click_url_skills: listing.clickUrlSkills ?? '',
		click_url_mcp: listing.clickUrlMcp ?? '',
		description: listing.description ?? '',
		description_skills: listing.descriptionSkills ?? '',
		description_mcp: listing.descriptionMcp ?? '',
		content: listing.content ?? '',
		content_skills: listing.contentSkills ?? '',
		content_mcp: listing.contentMcp ?? '',
		listing_kind: listingKind,
		extension_type: (listing.extensionType as 'skills' | 'mcp' | 'both' | null) ?? 'skills',
		install_command_skills: listing.installCommandSkills ?? '',
		install_command_mcp: listing.installCommandMcp ?? '',
		is_official: listing.isOfficial,
		source_repo_url: listing.sourceRepoUrl ?? '',
		skill_source_url: listing.skillSourceUrl ?? '',
		skill_name: listing.skillName ?? '',
		skill_metadata: listing.skillMetadata,
		source_synced_at: listing.sourceSyncedAt,
		source_content_hash: listing.sourceContentHash,
		license: listing.license ?? '',
		version: listing.version ?? '',
		skill_commands: listing.skillCommands ?? [],
		mcp_tools: listing.mcpTools ?? [],
		mcp_transport: listing.mcpTransport,
		mcp_server_config: listing.mcpServerConfig,
		stack_blueprint: listing.stackBlueprint,
		listing_category_id: listing.listingCategoryId ?? '',
		tag_ids: listing.tags.map((tag) => tag.id),
		is_user_published: overrides?.is_user_published ?? listing.isUserPublished,
		is_admin_published: overrides?.is_admin_published ?? false,
		schema_type: schemaType,
		faq,
		stack_members: (listing.stackMembers ?? []).map((member, index) => ({
			member_listing_id: member.memberListingId,
			member_role: member.memberRole as 'skills' | 'mcp',
			sort_order: member.sortOrder ?? index
		}))
	};
}
