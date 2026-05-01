<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SidebarLinkItem } from '$lib/ui/sidebar-expandable/types';
	import type { DockItem, DockNotificationsPreview } from '$lib/ui/floating-dock/types';

	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';
	import { authenticationRepository, signoutPresenter } from '$lib/user-auth/index';
	import { SignoutStatus } from '$lib/user-auth/Signout.presenter.svelte';
	import { feedbackPresenter } from '$lib/feedbacks';
	import { FeedbackStatus } from '$lib/feedbacks/Feedback.presenter.svelte';
	import { getRootPathEditorArea } from '$lib/area-admin/constants/getRootPathEditorArea';
	import { getRootPathSecretAdminArea } from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { getRootPathAdminArea } from '$lib/area-admin/constants/getRootPathAdminArea';
	import { absoluteUrl } from '$lib/utils/path';
	import { ensureDefaultTheme } from '$lib/ui/daisyui/ThemeSwitcher.svelte';

	import SidebarProtected from '$lib/ui/templates/SidebarProtected.svelte';

	type Props = {
		children: Snippet;
		currentUser?: App.LayoutData['currentUser'] | null;
		companyName?: string | null;
		mainLinks: SidebarLinkItem[];
		/** Editor dock: notifications link when not using `notificationsDockPreview` (omit for a no-op bell). */
		editorDockNotificationHref?: string;
		/** Editor dock: unread count badge on the notifications icon */
		editorDockNotificationBadge?: number;
		/** Editor dock: e.g. blog topics (defaults to `#`). */
		editorDockNewTemplateHref?: string;
		/** Editor header dock: bell opens this preview panel instead of navigating. */
		notificationsDockPreview?: DockNotificationsPreview;
	};

	let {
		children,
		currentUser: currentUserProp = null,
		companyName = null,
		mainLinks,
		editorDockNotificationHref = '#',
		editorDockNotificationBadge = 0,
		editorDockNewTemplateHref = '#',
		notificationsDockPreview
	}: Props = $props();

	// Prefer layout data; fall back to auth repository so header buttons update immediately after sign-in (no refresh needed)
	let currentUser = $derived(currentUserProp ?? authenticationRepository.currentUser ?? null);
	let isSuperAdmin = $derived((currentUser as any)?.isSuperAdmin === true);
	let isEditor = $derived((currentUser?.roles ?? []).includes('editor'));
	let isAdmin = $derived((currentUser?.roles ?? []).includes('admin'));

	let canSeeEditorArea = $derived(isEditor || isSuperAdmin);
	let canSeeAdminArea = $derived(isAdmin || isSuperAdmin);

	let companyNameVm = $derived(companyName ?? 'Openquok');
	let currentUserName = $derived(
		(currentUser?.fullName ?? currentUser?.email ?? null)?.split(/\s+/)[0] ?? null
	);
	let editorAreaHref = $derived(absoluteUrl(getRootPathEditorArea()));
	let adminAreaHref = $derived(absoluteUrl(getRootPathAdminArea()));
	let secretAdminAreaHref = $derived(absoluteUrl(getRootPathSecretAdminArea()));

	let feedbackDescription = $state('');
	let feedbackOpen = $state(false);
	let feedbackIsSubmitting = $derived(feedbackPresenter.status === FeedbackStatus.SUBMITTING);
	let feedbackIsSuccess = $derived(feedbackPresenter.status === FeedbackStatus.SUCCESS);
	let feedbackSuccessMessage = $derived(feedbackPresenter.toastMessage);
	let feedbackShowToastMessage = $derived(feedbackPresenter.showToastMessage);
	let feedbackToastMessage = $derived(feedbackPresenter.toastMessage);

	onMount(() => {
		ensureDefaultTheme('forest');
	});

	$effect(() => {
		if (!feedbackOpen) feedbackPresenter.reset();
	});

	$effect(() => {
		if (feedbackShowToastMessage) {
			const isSuccess = feedbackPresenter.status === FeedbackStatus.SUCCESS;
			if (isSuccess) {
				toast.success(feedbackToastMessage);
				feedbackDescription = '';
				feedbackOpen = false;
			} else {
				toast.error(feedbackToastMessage);
			}
			feedbackPresenter.showToastMessage = false;
		}
	});

	async function handleFeedbackSubmit(description: string) {
		const url = typeof window !== 'undefined' ? window.location.href : (page.url?.href as string) ?? '';
		const email = currentUser?.email ?? '';
		await feedbackPresenter.createFeedback('feedback', url, description, email);
	}

	const dockItems: DockItem[] = $derived([
		notificationsDockPreview
			? {
					title: 'Notifications',
					iconName: icons.Bell.name,
					ariaLabel: 'Notifications',
					notificationsPopover: true,
					notificationsPreview: notificationsDockPreview,
					...(editorDockNotificationBadge > 0 ? { badge: editorDockNotificationBadge } : {})
				}
			: {
					title: 'Notifications',
					...(editorDockNotificationHref != null && editorDockNotificationHref !== ''
						? { href: editorDockNotificationHref }
						: { onclick: () => {} }),
					iconName: icons.Bell.name,
					ariaLabel: 'Notifications',
					...(editorDockNotificationBadge > 0 ? { badge: editorDockNotificationBadge } : {})
				},
		{
			title: 'New Template',
			href: editorDockNewTemplateHref,
			iconName: icons.LayoutTemplate.name,
			ariaLabel: 'New Template'
		},
		{
			title: 'Account',
			iconName: icons.Account.name,
			ariaLabel: 'Account',
			dropdownHeader: currentUserName ?? undefined,
			sublinks: [
				{ label: 'Settings', href: '/account/settings', iconName: icons.Settings.name },
				{ label: 'Billing', href: '/account/billing', iconName: icons.CreditCard.name },
				{
					label: 'Sign out',
					iconName: icons.LogOut.name,
					onclick: onSignout,
					customStyle: '!text-error hover:!bg-error/10 focus-visible:!text-error'
				}
			]
		}
	]);

	async function onSignout() {
		try {
			await signoutPresenter.signout();
			const status = signoutPresenter.status;
			const isSignedOut = status === SignoutStatus.SUCCESS;
			const showToastMessage = signoutPresenter.showToastMessage;
			if (isSignedOut && showToastMessage) {
				toast.success(signoutPresenter.toastMessage);
			}
			if (!isSignedOut && showToastMessage) {
				toast.error(signoutPresenter.toastMessage);
			}
		} catch (error) {
			console.error('Error signing out:', error);
			toast.error('An error occurred while signing out. Please try again later.');
		} finally {
			signoutPresenter.showToastMessage = false;
			await invalidateAll();
		}
	}
</script>

<SidebarProtected
	companyName={companyNameVm}
	{dockItems}
	{mainLinks}
	showEditorAreaButton={canSeeEditorArea}
	{editorAreaHref}
	showAdminAreaButton={canSeeAdminArea}
	{adminAreaHref}
	showSecretAdminAreaButton={isSuperAdmin}
	{secretAdminAreaHref}
	bind:feedbackDescription
	bind:feedbackOpen
	feedbackIsSubmitting={feedbackIsSubmitting}
	feedbackIsSuccess={feedbackIsSuccess}
	feedbackSuccessMessage={feedbackSuccessMessage}
	onFeedbackSubmit={handleFeedbackSubmit}
>
	{@render children?.()}
</SidebarProtected>
