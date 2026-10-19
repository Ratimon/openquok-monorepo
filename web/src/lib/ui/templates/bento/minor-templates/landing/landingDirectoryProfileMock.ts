import { icons } from '$data/icons';

export const LANDING_DIRECTORY_MOCK_PROFILE = {
	name: 'OpenQuok',
	tagline: 'Social scheduling built for agents',
	description:
		'Draft and schedule posts from chat. You approve what goes live across every connected channel.',
	websiteDisplay: 'openquok.com'
};

export type LandingDirectoryMockDestination = {
	id: string;
	label: string;
	iconName: string;
	statusLabel: string;
	/** When the main profile is incomplete, some directories may still be ready (lighter field rules). */
	readyDespiteIncompleteProfile?: boolean;
};

export type LandingDirectoryMockProfileFieldStatus = {
	label: string;
	state: 'complete' | 'missing';
	value?: string;
};

export const LANDING_DIRECTORY_MOCK_INCOMPLETE_PROFILE = {
	name: 'New launch',
	tagline: null as string | null,
	description: null as string | null,
	websiteDisplay: null as string | null,
	logoMissing: true
};

export const LANDING_DIRECTORY_MOCK_INCOMPLETE_FIELDS: LandingDirectoryMockProfileFieldStatus[] = [
	{ label: 'Product name', state: 'complete', value: LANDING_DIRECTORY_MOCK_INCOMPLETE_PROFILE.name },
	{ label: 'Tagline', state: 'missing' },
	{ label: 'Description', state: 'missing' },
	{ label: 'Logo', state: 'missing' },
	{ label: 'Website', state: 'missing' }
];

export const LANDING_DIRECTORY_MOCK_INCOMPLETE_DESTINATIONS: LandingDirectoryMockDestination[] = [
	{
		id: 'peerpush',
		label: 'PeerPush',
		iconName: icons.PeerPush.name,
		statusLabel: 'Complete profile first'
	},
	{
		id: 'uneed',
		label: 'Uneed',
		iconName: icons.Uneed.name,
		statusLabel: 'Ready to autofill',
		readyDespiteIncompleteProfile: true
	}
];

export type LandingDirectoryMockTrackingRow = {
	id: string;
	label: string;
	iconName: string;
	statusLabel: string;
	submitted: boolean;
	listingUrl?: string;
};

export const LANDING_DIRECTORY_MOCK_TRACKING_ROWS: LandingDirectoryMockTrackingRow[] = [
	{
		id: 'peerpush',
		label: 'PeerPush',
		iconName: icons.PeerPush.name,
		statusLabel: 'Submitted',
		submitted: true,
		listingUrl: 'peerpush.com/products/openquok'
	},
	{
		id: 'uneed',
		label: 'Uneed',
		iconName: icons.Uneed.name,
		statusLabel: 'Ready to launch',
		submitted: false
	}
];

export const LANDING_DIRECTORY_MOCK_DESTINATIONS: LandingDirectoryMockDestination[] = [
	{
		id: 'peerpush',
		label: 'PeerPush',
		iconName: icons.PeerPush.name,
		statusLabel: 'Ready to autofill'
	},
	{
		id: 'uneed',
		label: 'Uneed',
		iconName: icons.Uneed.name,
		statusLabel: 'Ready to autofill'
	}
];
