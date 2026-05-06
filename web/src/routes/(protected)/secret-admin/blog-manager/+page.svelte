<script lang="ts">
	import {
		getRootPathSecretAdminBlogManager,
		getRootPathSecretAdminBlogManagerPosts,
		getRootPathSecretAdminBlogManagerComments,
		getRootPathSecretAdminBlogManagerActivities,
		getRootPathSecretAdminBlogManagerNewPost
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { absoluteUrl, route } from '$lib/utils/path';

	// /secret-admin/blog-manager
	const rootPathSecretAdminBlogManager = getRootPathSecretAdminBlogManager();
	const secretAdminBlogManagerPath = route(rootPathSecretAdminBlogManager);
	const dashboardUrl = absoluteUrl(secretAdminBlogManagerPath);

	// /secret-admin/blog-manager/posts
	const rootPathSecretAdminBlogManagerPosts = getRootPathSecretAdminBlogManagerPosts();
	const secretAdminBlogManagerPostsPath = route(rootPathSecretAdminBlogManagerPosts);
	const postsUrl = absoluteUrl(secretAdminBlogManagerPostsPath);

	// /secret-admin/blog-manager/posts/new
	const rootPathSecretAdminBlogManagerNewPost = getRootPathSecretAdminBlogManagerNewPost();
	const secretAdminBlogManagerNewPostPath = route(rootPathSecretAdminBlogManagerNewPost);
	const newPostUrl = absoluteUrl(secretAdminBlogManagerNewPostPath);

	// /secret-admin/blog-manager/comments
	const rootPathSecretAdminBlogManagerComments = getRootPathSecretAdminBlogManagerComments();
	const secretAdminBlogManagerCommentsPath = route(rootPathSecretAdminBlogManagerComments);
	const commentsUrl = absoluteUrl(secretAdminBlogManagerCommentsPath);

	// /secret-admin/blog-manager/activities
	const rootPathSecretAdminBlogManagerActivities = getRootPathSecretAdminBlogManagerActivities();
	const secretAdminBlogManagerActivitiesPath = route(rootPathSecretAdminBlogManagerActivities);
	const activitiesUrl = absoluteUrl(secretAdminBlogManagerActivitiesPath);
</script>

<div class="p-4 md:p-6">
	<h1 class="text-xl font-semibold text-base-content">
		Blog manager</h1>
	<p class="text-sm text-base-content/70 mt-1">
		Manage posts, comments, and activity logs.</p>

	<ul class="mt-4 list-disc list-inside space-y-1 text-sm">
		<li><a href={dashboardUrl} class="link link-primary">Blog dashboard</a></li>
		<li><a href={postsUrl} class="link link-primary">Posts</a></li>
		<li><a href={newPostUrl} class="link link-primary">New post</a></li>
		<li><a href={commentsUrl} class="link link-primary">Comments</a></li>
		<li><a href={activitiesUrl} class="link link-primary">Activities</a></li>
	</ul>
</div>