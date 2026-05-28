import {
	UNLIMITED_POSTS_PER_MONTH,
	UNLIMITED_TEAM_MEMBERS_PER_WORKSPACE,
} from "openquok-common";
import type { PlanLimits } from "openquok-common";
import { SubscriptionSection } from "openquok-common";

/** Maps a {@link SubscriptionSection} to the corresponding {@link PlanLimits} field value. */
export function planLimitForSection(
	limits: PlanLimits,
	section: SubscriptionSection
): number | boolean | null {
	switch (section) {
		case SubscriptionSection.CHANNEL_PER_WORKSPACE:
			return limits.channel_per_workspace;
		case SubscriptionSection.POSTS_PER_MONTH:
			return limits.posts_per_month;
		case SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE:
			return limits.team_members_per_workspace;
		case SubscriptionSection.WORKSPACES:
			return limits.workspaces;
		case SubscriptionSection.MEDIA_STORAGE_BYTES_PER_WORKSPACE:
			return limits.media_storage_bytes_per_workspace;
		case SubscriptionSection.SHARE_POST_PREVIEW:
			return limits.share_post_preview;
		case SubscriptionSection.COMMUNITY_FEATURES:
			return limits.community_features;
		case SubscriptionSection.PUBLIC_API:
			return limits.public_api;
		case SubscriptionSection.ADMIN:
			return null;
		default:
			return null;
	}
}

/** True when `cap` is treated as unlimited for quota sections that use sentinel caps. */
export function isUnlimitedPlanCap(cap: number, section: SubscriptionSection): boolean {
	if (section === SubscriptionSection.POSTS_PER_MONTH) {
		return cap >= UNLIMITED_POSTS_PER_MONTH;
	}
	if (section === SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE) {
		return cap >= UNLIMITED_TEAM_MEMBERS_PER_WORKSPACE;
	}
	return false;
}
