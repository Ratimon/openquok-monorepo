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

	// /secret-admin/blog-manager
	const rootPathSecretAdminBlogManager = getRootPathSecretAdminBlogManager();
	const blogManagerBaseHref = url(rootPathSecretAdminBlogManager);

	// /secret-admin/blog-manager/posts
	const rootPathSecretAdminBlogManagerPosts = getRootPathSecretAdminBlogManagerPosts();
	const blogManagerPostsHref = url(rootPathSecretAdminBlogManagerPosts);

	// /secret-admin/blog-manager/posts/new
	const rootPathSecretAdminBlogManagerNewPost = getRootPathSecretAdminBlogManagerNewPost();
	const blogManagerNewPostHref = url(rootPathSecretAdminBlogManagerNewPost);

	// /secret-admin/blog-manager/topics
	const rootPathSecretAdminBlogManagerTopics = getRootPathSecretAdminBlogManagerTopics();
	const blogManagerTopicsHref = url(rootPathSecretAdminBlogManagerTopics);

	// /secret-admin/blog-manager/comments
	const rootPathSecretAdminBlogManagerComments = getRootPathSecretAdminBlogManagerComments();
	const blogManagerCommentsHref = url(rootPathSecretAdminBlogManagerComments);

	// /secret-admin/blog-manager/activities
	const rootPathSecretAdminBlogManagerActivities = getRootPathSecretAdminBlogManagerActivities();
	const blogManagerActivitiesHref = url(rootPathSecretAdminBlogManagerActivities);

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
		getBasePath: () => blogManagerBaseHref,
		getItemHref: (id) => {
			if (id === 'dashboard') return blogManagerBaseHref;
			if (id === 'posts') return blogManagerPostsHref;
			if (id === 'new_post') return blogManagerNewPostHref;
			if (id === 'topics') return blogManagerTopicsHref;
			if (id === 'comments') return blogManagerCommentsHref;
			return blogManagerActivitiesHref;
		},
		getHeaderTitle: () => 'Blog manager'
	};

	setContext(BLOG_MANAGER_SIDEBAR_KEY, ctx);
</script>

<SidebarSecondary contextKey={BLOG_MANAGER_SIDEBAR_KEY} centerContent={false}>
	{@render children?.()}
</SidebarSecondary>

