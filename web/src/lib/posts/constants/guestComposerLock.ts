/** Workspace-only composer actions that open the guest Sign in / Sign up gate. */
export const GUEST_COMPOSER_LOCK_ACTIONS = [
	'media-library',
	'signature',
	'design-editor',
	'linkedin-company',
	'draft',
	'schedule',
	'tags',
	'repeat'
] as const;

export type GuestComposerLockAction = (typeof GUEST_COMPOSER_LOCK_ACTIONS)[number];

export const GUEST_COMPOSER_LOCK_COPY: Record<
	GuestComposerLockAction,
	{ title: string; description: string }
> = {
	'media-library': {
		title: 'Sign in to use your media library',
		description:
			'Workspace media lives in your account. Sign in or sign up to attach saved images and videos.'
	},
	signature: {
		title: 'Sign in to insert a signature',
		description: 'Saved signatures belong to your workspace. Sign in or sign up to insert one.'
	},
	'design-editor': {
		title: 'Sign in to open the design editor',
		description:
			'The design editor saves visuals to your workspace media library. Sign in or sign up to continue.'
	},
	'linkedin-company': {
		title: 'Sign in to mention a LinkedIn company',
		description:
			'Company mentions use a connected LinkedIn channel. Sign in or sign up to continue.'
	},
	draft: {
		title: 'Sign in to save a draft',
		description: 'Drafts are stored in your workspace. Sign in or sign up to save this post.'
	},
	schedule: {
		title: 'Sign in to schedule this post',
		description:
			'Scheduling publishes to your connected channels. Sign in or sign up to continue. Rewritten text and local previews stay on this page until you leave.'
	},
	tags: {
		title: 'Sign in to tag this post',
		description: 'Tags are saved in your workspace. Sign in or sign up to organize posts.'
	},
	repeat: {
		title: 'Sign in to set a repeat schedule',
		description: 'Repeat posting is a workspace feature. Sign in or sign up to continue.'
	}
};
