<script lang="ts">
	import {
		getRootPathSecretAdminConfigManagerBlogInformation,
		getRootPathSecretAdminConfigManagerCompanyInformation
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { absoluteUrl, route } from '$lib/utils/path';

	// /secret-admin/config-manager/company-information
	const rootPathCompanyInformation = getRootPathSecretAdminConfigManagerCompanyInformation();
	const companyInformationPath = route(rootPathCompanyInformation);
	const companyInformationUrl = absoluteUrl(companyInformationPath);

	// /secret-admin/config-manager/blog-information
	const rootPathBlogInformation = getRootPathSecretAdminConfigManagerBlogInformation();
	const blogInformationPath = route(rootPathBlogInformation);
	const blogInformationUrl = absoluteUrl(blogInformationPath);
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

