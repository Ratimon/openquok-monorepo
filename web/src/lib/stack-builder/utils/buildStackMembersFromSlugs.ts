import type { StackMemberFormSchemaType } from '$lib/listings/listing.types';

type ExtensionCatalogEntry = {
	id: string;
	slug: string;
	extensionType: string | null;
};

function memberRoleForExtensionType(extensionType: string | null): 'skills' | 'mcp' {
	if (extensionType === 'mcp') return 'mcp';
	return 'skills';
}

/** Map selected extension slugs to stack member rows for the stack listing editor. */
export function buildStackMembersFromSlugs(
	extensionSlugs: string[],
	catalog: ExtensionCatalogEntry[]
): StackMemberFormSchemaType[] {
	const bySlug = new Map(catalog.map((entry) => [entry.slug, entry]));
	const members: StackMemberFormSchemaType[] = [];

	for (const slug of extensionSlugs) {
		const entry = bySlug.get(slug);
		if (!entry) continue;
		members.push({
			member_listing_id: entry.id,
			member_role: memberRoleForExtensionType(entry.extensionType),
			sort_order: members.length
		});
	}

	return members;
}
