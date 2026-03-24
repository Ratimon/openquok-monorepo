<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SettingsNavItem, SettingsSidebarContext } from '$lib/ui/sidebar-main/types';

	import { page } from '$app/state';
	import { setContext } from 'svelte';
	import { BLOG_MANAGER_SIDEBAR_KEY } from '$lib/ui/templates/sidebar-secondary-context';
	import { url } from '$lib/utils/path';
	import {
		getRootPathSecretAdminBlogManager,
		getRootPathSecretAdminBlogManagerPosts,
		getRootPathSecretAdminBlogManagerNewPost,
		getRootPathSecretAdminBlogManagerTopics,
		getRootPathSecretAdminBlogManagerActivities,
		getRootPathSecretAdminBlogManagerComments
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';

	import SidebarSecondary from '$lib/ui/templates/SidebarSecondary.svelte';

	type BlogManagerSectionId = 'dashboard' | 'posts' | 'new_post' | 'comments' | 'activities' | 'topics';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const navItems: SettingsNavItem<BlogManagerSectionId>[] = [
		{ id: 'dashboard', label: 'Blog dashboard' },
		{ id: 'posts', label: 'Posts' },
		{ id: 'new_post', label: 'New post' },
		{ id: 'topics', label: 'Topics' },
		{ id: 'comments', label: 'Comments' },
		{ id: 'activities', label: 'Activities' }
	];

	function getCurrentSectionFromPathname(pathname: string): BlogManagerSectionId {
		if (pathname.includes('/comments')) return 'comments';
		if (pathname.includes('/activities')) return 'activities';
		if (pathname.includes('/posts/new')) return 'new_post';
		if (pathname.includes('/posts')) return 'posts';
		if (pathname.includes('/topics')) return 'topics';
		return 'dashboard';
	}

	const ctx: SettingsSidebarContext<BlogManagerSectionId> = {
		navItems,
		getCurrentSection: () => getCurrentSectionFromPathname(page.url.pathname),
		getSectionTitle: () => {
			const current = getCurrentSectionFromPathname(page.url.pathname);
			return navItems.find((i) => i.id === current)?.label ?? 'Posts';
		},
		getBasePath: () => url(getRootPathSecretAdminBlogManager()),
		getItemHref: (id) => {
			if (id === 'dashboard') return url(getRootPathSecretAdminBlogManager());
			if (id === 'posts') return url(getRootPathSecretAdminBlogManagerPosts());
			if (id === 'new_post') return url(getRootPathSecretAdminBlogManagerNewPost());
			if (id === 'topics') return url(getRootPathSecretAdminBlogManagerTopics());
			if (id === 'comments') return url(getRootPathSecretAdminBlogManagerComments());
			return url(getRootPathSecretAdminBlogManagerActivities());
		},
		getHeaderTitle: () => 'Blog manager'
	};

	setContext(BLOG_MANAGER_SIDEBAR_KEY, ctx);
</script>

<SidebarSecondary contextKey={BLOG_MANAGER_SIDEBAR_KEY} centerContent={false}>
	{@render children?.()}
</SidebarSecondary>

