<script lang="ts">
	import {
		getRootPathSecretAdminCatalogManager,
		getRootPathSecretAdminCatalogManagerBuildingBlocks,
		getRootPathSecretAdminCatalogManagerNewBuildingBlock,
		getRootPathSecretAdminCatalogManagerPlaybooks,
		getRootPathSecretAdminCatalogManagerNewPlaybook,
		getRootPathSecretAdminCatalogManagerCategories,
		getRootPathSecretAdminCatalogManagerTags,
		getRootPathSecretAdminCatalogManagerComments,
		getRootPathSecretAdminCatalogManagerActivities
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { absoluteUrl, route } from '$lib/utils/path';

	const buildingBlocksUrl = absoluteUrl(route(getRootPathSecretAdminCatalogManagerBuildingBlocks()));
	const newBuildingBlockUrl = absoluteUrl(route(getRootPathSecretAdminCatalogManagerNewBuildingBlock()));
	const playbooksUrl = absoluteUrl(route(getRootPathSecretAdminCatalogManagerPlaybooks()));
	const newPlaybookUrl = absoluteUrl(route(getRootPathSecretAdminCatalogManagerNewPlaybook()));
	const categoriesUrl = absoluteUrl(route(getRootPathSecretAdminCatalogManagerCategories()));
	const tagsUrl = absoluteUrl(route(getRootPathSecretAdminCatalogManagerTags()));
	const commentsUrl = absoluteUrl(route(getRootPathSecretAdminCatalogManagerComments()));
	const activitiesUrl = absoluteUrl(route(getRootPathSecretAdminCatalogManagerActivities()));
</script>

<div class="p-4 md:p-6">
	<h1 class="text-xl font-semibold text-base-content">
		Playbooks / building blocks manager
	</h1>
	<p class="text-sm text-base-content/70 mt-1">
		Manage playbooks, building blocks, categories, tags, comments, and activity logs.
	</p>

	<ul class="mt-4 list-disc list-inside space-y-1 text-sm">
		<li><a href={playbooksUrl} class="link link-primary">Playbooks</a></li>
		<li><a href={newPlaybookUrl} class="link link-primary">New playbook</a></li>
		<li><a href={buildingBlocksUrl} class="link link-primary">Building blocks</a></li>
		<li><a href={newBuildingBlockUrl} class="link link-primary">New building block</a></li>
		<li><a href={categoriesUrl} class="link link-primary">Categories</a></li>
		<li><a href={tagsUrl} class="link link-primary">Tags</a></li>
		<li><a href={commentsUrl} class="link link-primary">Comments</a></li>
		<li><a href={activitiesUrl} class="link link-primary">Activities</a></li>
	</ul>
</div>
