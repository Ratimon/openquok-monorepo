import type { MerchantReturnPolicy } from 'schema-dts';

import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';

/** Docs path for OpenQuok Cloud refund / support policy (no leading slash). */
export const OPENQUOK_REFUND_POLICY_DOCS_PATH = `${getRootPathPublicDocs()}/billing/refunds-and-support`;

/** Absolute URL for the refund policy page used in JSON-LD `merchantReturnLink`. */
export function resolveOpenQuokRefundPolicyUrl(origin: string): string {
	const normalizedOrigin = origin.replace(/\/$/, '');
	return `${normalizedOrigin}/${OPENQUOK_REFUND_POLICY_DOCS_PATH}`;
}

/**
 * Standard OpenQuok return policy for Product / Offer JSON-LD.
 * Uses `merchantReturnLink` (Google option B) so policy copy stays on the docs page.
 */
export function createOpenQuokMerchantReturnPolicy(params: { origin: string }): MerchantReturnPolicy {
	return {
		'@type': 'MerchantReturnPolicy',
		merchantReturnLink: resolveOpenQuokRefundPolicyUrl(params.origin)
	} satisfies MerchantReturnPolicy;
}
