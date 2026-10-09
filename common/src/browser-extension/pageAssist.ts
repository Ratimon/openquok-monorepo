/**
 * Future registry for page-assist flows (reusable profile, form detection, human-in-the-loop submit).
 * Cookie-session channels (Skool and similar) stay in `cookieSessionProviders.ts`; DOM/autofill actions register here later.
 */

export interface PageAssistProvider {
	identifier: string;
	name: string;
}

/** Placeholder until directory-style / autofill providers ship. */
export const PAGE_ASSIST_PROVIDERS: readonly PageAssistProvider[] = [];
