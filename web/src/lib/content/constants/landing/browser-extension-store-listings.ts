import type { IconName } from '$data/icons';

import { icons } from '$data/icons';
/** Published Chrome Web Store listing (stable slug + extension ID). */
export const OPENQUOK_BROWSER_EXTENSION_CHROME_WEB_STORE_URL =
	'https://chromewebstore.google.com/detail/openquok-social-media-sch/diloknijkhhggpfhenpoccnjbcjdoedn';

/** Mozilla Add-ons listing for the OpenQuok extension. */
export const OPENQUOK_BROWSER_EXTENSION_FIREFOX_ADDONS_URL =
	'https://addons.mozilla.org/en-US/firefox/addon/openquok-scheduler-directory/';

/** Microsoft Edge Add-ons listing for the OpenQuok extension (Chromium package). */
export const OPENQUOK_BROWSER_EXTENSION_EDGE_ADDONS_URL =
	'https://microsoftedge.microsoft.com/addons/detail/openquok-social-media-sc/jgcefbibloanooalkjkgafakgkpbcdmn';

export type PublicBrowserExtensionStoreListing = {
	id: 'chrome' | 'firefox' | 'edge';
	browserName: string;
	title: string;
	description: string;
	storeUrl: string;
	installLabel: string;
	iconName: IconName;
	available: boolean;
	statusLabel: string;
};

export const PUBLIC_BROWSER_EXTENSION_STORE_LISTINGS: readonly PublicBrowserExtensionStoreListing[] =
	[
		{
			id: 'chrome',
			browserName: 'Chrome',
			title: 'Google Chrome',
			description: 'Install OpenQuok from the Chrome Web Store for the side panel and in-tab workflows.',
			storeUrl: OPENQUOK_BROWSER_EXTENSION_CHROME_WEB_STORE_URL,
			installLabel: 'Install for Chrome',
			iconName: icons.GoogleChrome.name,
			available: true,
			statusLabel: 'Available'
		},
		{
			id: 'edge',
			browserName: 'Edge',
			title: 'Microsoft Edge',
			description: 'Add OpenQuok from Edge Add-ons. It uses the same Chromium build as Chrome.',
			storeUrl: OPENQUOK_BROWSER_EXTENSION_EDGE_ADDONS_URL,
			installLabel: 'Install for Edge',
			iconName: icons.MicrosoftEdge.name,
			available: true,
			statusLabel: 'Available'
		},
		{
			id: 'firefox',
			browserName: 'Firefox',
			title: 'Mozilla Firefox',
			description: 'Get the Firefox add-on to schedule posts and launch directories from your browser.',
			storeUrl: OPENQUOK_BROWSER_EXTENSION_FIREFOX_ADDONS_URL,
			installLabel: 'Install for Firefox',
			iconName: icons.MozillaFirefox.name,
			available: true,
			statusLabel: 'Available'
		}
	];