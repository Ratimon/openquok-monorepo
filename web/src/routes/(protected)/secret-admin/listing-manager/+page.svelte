<script lang="ts">
	import {
		getRootPathSecretAdminListingManager,
		getRootPathSecretAdminListingManagerListings,
		getRootPathSecretAdminListingManagerNewExtension,
		getRootPathSecretAdminListingManagerStacks,
		getRootPathSecretAdminListingManagerNewStack,
		getRootPathSecretAdminListingManagerCategories,
		getRootPathSecretAdminListingManagerTags,
		getRootPathSecretAdminListingManagerComments,
		getRootPathSecretAdminListingManagerActivities
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { absoluteUrl, route } from '$lib/utils/path';

	const extensionsUrl = absoluteUrl(route(getRootPathSecretAdminListingManagerListings()));
	const newExtensionUrl = absoluteUrl(route(getRootPathSecretAdminListingManagerNewExtension()));
	const stacksUrl = absoluteUrl(route(getRootPathSecretAdminListingManagerStacks()));
	const newStackUrl = absoluteUrl(route(getRootPathSecretAdminListingManagerNewStack()));
	const categoriesUrl = absoluteUrl(route(getRootPathSecretAdminListingManagerCategories()));
	const tagsUrl = absoluteUrl(route(getRootPathSecretAdminListingManagerTags()));
	const commentsUrl = absoluteUrl(route(getRootPathSecretAdminListingManagerComments()));
	const activitiesUrl = absoluteUrl(route(getRootPathSecretAdminListingManagerActivities()));
</script>

<div class="p-4 md:p-6">
	<h1 class="text-xl font-semibold text-base-content">Listing manager</h1>
	<p class="text-sm text-base-content/70 mt-1">
		Manage extensions, stacks, categories, tags, comments, and activity logs.
	</p>

	<ul class="mt-4 list-disc list-inside space-y-1 text-sm">
		<li><a href={extensionsUrl} class="link link-primary">Extensions</a></li>
		<li><a href={newExtensionUrl} class="link link-primary">New extension</a></li>
		<li><a href={stacksUrl} class="link link-primary">Stacks</a></li>
		<li><a href={newStackUrl} class="link link-primary">New stack</a></li>
		<li><a href={categoriesUrl} class="link link-primary">Categories</a></li>
		<li><a href={tagsUrl} class="link link-primary">Tags</a></li>
		<li><a href={commentsUrl} class="link link-primary">Comments</a></li>
		<li><a href={activitiesUrl} class="link link-primary">Activities</a></li>
	</ul>
</div>
