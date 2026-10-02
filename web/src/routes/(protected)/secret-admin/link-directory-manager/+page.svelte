<script lang="ts">
	import {
		getRootPathSecretAdminLinkDirectoryManagerSites,
		getRootPathSecretAdminLinkDirectoryManagerNewSite,
		getRootPathSecretAdminLinkDirectoryManagerCategories,
		getRootPathSecretAdminLinkDirectoryManagerTags,
		getRootPathSecretAdminLinkDirectoryManagerSubmissions
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { absoluteUrl, route } from '$lib/utils/path';

	import LinkDirectoryMetricsAdminNotice from '$lib/ui/components/link-directory-manager/LinkDirectoryMetricsAdminNotice.svelte';

	const sitesUrl = absoluteUrl(route(getRootPathSecretAdminLinkDirectoryManagerSites()));
	const newSiteUrl = absoluteUrl(route(getRootPathSecretAdminLinkDirectoryManagerNewSite()));
	const categoriesUrl = absoluteUrl(route(getRootPathSecretAdminLinkDirectoryManagerCategories()));
	const tagsUrl = absoluteUrl(route(getRootPathSecretAdminLinkDirectoryManagerTags()));
	const submissionsUrl = absoluteUrl(route(getRootPathSecretAdminLinkDirectoryManagerSubmissions()));
</script>

<div class="p-4 md:p-6">
	<h1 class="text-xl font-semibold text-base-content">Link directory manager</h1>
	<p class="text-sm text-base-content/70 mt-1">
		Curate build-backlinks sites, opportunities, taxonomy, and public submissions.
	</p>

	<div class="mt-6 max-w-3xl">
		<LinkDirectoryMetricsAdminNotice compact />
	</div>

	<ul class="mt-4 list-disc list-inside space-y-1 text-sm">
		<li><a href={sitesUrl} class="link link-primary">Sites</a></li>
		<li><a href={newSiteUrl} class="link link-primary">New site</a></li>
		<li><a href={categoriesUrl} class="link link-primary">Categories</a></li>
		<li><a href={tagsUrl} class="link link-primary">Tags</a></li>
		<li><a href={submissionsUrl} class="link link-primary">Submissions queue</a></li>
	</ul>
</div>
