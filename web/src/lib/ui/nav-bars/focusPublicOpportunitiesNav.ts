import {
	OPEN_PUBLIC_OPPORTUNITIES_NAV_EVENT,
	PUBLIC_NAVBAR_OPPORTUNITIES_ANCHOR_ID,
	type PublicOpportunitiesNavTab
} from '$lib/config/constants/config';
import { scrollToAnchorId } from '$lib/utils/scrollToAnchorId';

/** Scroll to the Opportunities navbar control and open the matching dropdown tab. */
export function focusPublicOpportunitiesNav(tab: PublicOpportunitiesNavTab): void {
	if (typeof window === 'undefined') return;

	scrollToAnchorId(PUBLIC_NAVBAR_OPPORTUNITIES_ANCHOR_ID);
	window.dispatchEvent(
		new CustomEvent(OPEN_PUBLIC_OPPORTUNITIES_NAV_EVENT, {
			detail: { tab }
		})
	);
}
