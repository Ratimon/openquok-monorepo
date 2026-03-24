<script lang="ts">
	import {
		getRootPathSecretAdminConfigManagerBlogInformation,
		getRootPathSecretAdminConfigManagerCompanyInformation
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { absoluteUrl } from '$lib/utils/path';

	const companyInformationUrl = absoluteUrl(getRootPathSecretAdminConfigManagerCompanyInformation());
	const blogInformationUrl = absoluteUrl(getRootPathSecretAdminConfigManagerBlogInformation());
</script>

<div class="p-4 md:p-6">
	<h1 class="text-xl font-semibold text-base-content">
		Config manager</h1>
	<p class="text-sm text-base-content/70 mt-1">
		Update module configuration values. Only the Company Information and Blog SEO modules are available here.
	</p>

	<ul class="mt-4 list-disc list-inside space-y-1 text-sm">
		<li>
			<a href={companyInformationUrl} class="link link-primary">Company Information</a>
		</li>
		<li>
			<a href={blogInformationUrl} class="link link-primary">Blog Information</a>
		</li>
	</ul>
</div>

