import {
	OPEN_PUBLIC_PLAYBOOKS_NAV_EVENT,
	PUBLIC_NAVBAR_PLAYBOOKS_ANCHOR_ID,
	type PublicPlaybooksNavTab
} from '$lib/config/constants/config';
import { scrollToAnchorId } from '$lib/utils/scrollToAnchorId';

/** Scroll to the Playbooks navbar control and open the matching dropdown tab. */
export function focusPublicPlaybooksNav(tab: PublicPlaybooksNavTab): void {
	if (typeof window === 'undefined') return;

	scrollToAnchorId(PUBLIC_NAVBAR_PLAYBOOKS_ANCHOR_ID);
	window.dispatchEvent(
		new CustomEvent(OPEN_PUBLIC_PLAYBOOKS_NAV_EVENT, {
			detail: { tab }
		})
	);
}
