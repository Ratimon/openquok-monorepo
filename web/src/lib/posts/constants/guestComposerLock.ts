/** Workspace-only composer actions that open the guest Sign in / Sign up gate. */
export const GUEST_COMPOSER_LOCK_ACTIONS = [
	'media-library',
	'signature',
	'photo-editor',
	'linkedin-company',
	'draft',
	'schedule',
	'tags',
	'repeat',
	'connect-channels'
] as const;

export type GuestComposerLockAction = (typeof GUEST_COMPOSER_LOCK_ACTIONS)[number];

export type GuestComposerLockCopy = {
	title: string;
	description: string;
	loggedInTitle: string;
	loggedInDescription: string;
};

export const GUEST_COMPOSER_LOCK_COPY: Record<GuestComposerLockAction, GuestComposerLockCopy> = {
	'media-library': {
		title: 'Sign in to use your media library',
		description:
			'Workspace media lives in your account. Sign in or sign up to attach saved images and videos.',
		loggedInTitle: 'Open workspace to use your media library',
		loggedInDescription:
			'Workspace media lives in your account. Open your workspace to attach saved images and videos.'
	},
	signature: {
		title: 'Sign in to insert a signature',
		description: 'Saved signatures belong to your workspace. Sign in or sign up to insert one.',
		loggedInTitle: 'Open workspace to insert a signature',
		loggedInDescription:
			'Saved signatures belong to your workspace. Open your workspace to insert one.'
	},
	'photo-editor': {
		title: 'Sign in to open the Photo Editor',
		description:
			'The Photo Editor saves visuals to your workspace media library. Sign in or sign up to continue.',
		loggedInTitle: 'Open workspace to use the Photo Editor',
		loggedInDescription:
			'The Photo Editor saves visuals to your workspace media library. Open your workspace to continue.'
	},
	'linkedin-company': {
		title: 'Sign in to mention a LinkedIn company',
		description:
			'Company mentions use a connected LinkedIn channel. Sign in or sign up to continue.',
		loggedInTitle: 'Open workspace to mention a LinkedIn company',
		loggedInDescription:
			'Company mentions use a connected LinkedIn channel. Open your workspace to continue.'
	},
	draft: {
		title: 'Sign in to save a draft',
		description: 'Drafts are stored in your workspace. Sign in or sign up to save this post.',
		loggedInTitle: 'Open workspace to save a draft',
		loggedInDescription: 'Drafts are stored in your workspace. Open your workspace to save this post.'
	},
	schedule: {
		title: 'Sign in to schedule this post',
		description:
			'Scheduling publishes to your connected channels. Sign in or sign up to continue. This preview stays on the page until you leave.',
		loggedInTitle: 'Open workspace to schedule this post',
		loggedInDescription:
			'Scheduling publishes to your connected channels. Open your workspace to continue. This preview stays on the page until you leave.'
	},
	tags: {
		title: 'Sign in to tag this post',
		description: 'Tags are saved in your workspace. Sign in or sign up to organize posts.',
		loggedInTitle: 'Open workspace to tag this post',
		loggedInDescription: 'Tags are saved in your workspace. Open your workspace to organize posts.'
	},
	repeat: {
		title: 'Sign in to set a repeat schedule',
		description: 'Repeat posting is a workspace feature. Sign in or sign up to continue.',
		loggedInTitle: 'Open workspace to set a repeat schedule',
		loggedInDescription: 'Repeat posting is a workspace feature. Open your workspace to continue.'
	},
	'connect-channels': {
		title: 'Connect your social accounts',
		description:
			'These chips are samples. Sign in or sign up, then connect LinkedIn, X, and other channels in your workspace to schedule for real. You can keep using this page without an account.',
		loggedInTitle: 'Connect your social accounts',
		loggedInDescription: 'Open your workspace to add real channels, then schedule.'
	}
};

export function resolveGuestComposerLockCopy(
	action: GuestComposerLockAction,
	isLoggedIn: boolean
): { title: string; description: string } {
	const copy = GUEST_COMPOSER_LOCK_COPY[action];
	if (isLoggedIn) {
		return { title: copy.loggedInTitle, description: copy.loggedInDescription };
	}
	return { title: copy.title, description: copy.description };
}
