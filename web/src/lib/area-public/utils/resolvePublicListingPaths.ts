import {
	getRootPathPublicCreatorBuildingBlock,
	getRootPathPublicCreatorPlaybook
} from '$lib/area-public/constants/getRootPathPublicCreators';

type ListingOwnerLike = {
	username: string | null;
	fullName?: string | null;
} | null | undefined;

export function resolvePublicBuildingBlockPath(
	owner: ListingOwnerLike,
	listingSlug: string
): string | null {
	const userSlug = owner?.username?.trim();
	if (!userSlug) return null;
	return getRootPathPublicCreatorBuildingBlock(userSlug, listingSlug);
}

export function resolvePublicPlaybookPath(
	owner: ListingOwnerLike,
	listingSlug: string
): string | null {
	const userSlug = owner?.username?.trim();
	if (!userSlug) return null;
	return getRootPathPublicCreatorPlaybook(userSlug, listingSlug);
}

export function listingOwnerDisplayName(owner: ListingOwnerLike): string | null {
	if (!owner) return null;
	return owner.fullName?.trim() || owner.username?.trim() || null;
}
