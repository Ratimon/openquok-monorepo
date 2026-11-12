export const BUILD_BACKLINKS_DIRECTORY_AUTOFILL_FOOTER_PROMPT =
	'Build one product profile. The extension autofills the form. You submit on the directory site.';

export function buildBacklinksDirectoryAutofillFooter(siteTitle: string): {
	footerPrompt: string;
	footerLinkLabel: string;
} {
	const site = siteTitle.trim() || 'this directory';
	return {
		footerPrompt: BUILD_BACKLINKS_DIRECTORY_AUTOFILL_FOOTER_PROMPT,
		footerLinkLabel: `Autofill on ${site}`
	};
}
