<script lang="ts">
	import {
		getRootPathSecretAdminConfigManagerBlogInformation,
		getRootPathSecretAdminConfigManagerCompanyInformation,
		getRootPathSecretAdminConfigManagerLandingPage,
		getRootPathSecretAdminConfigManagerMarketingInformation
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { absoluteUrl, route } from '$lib/utils/path';

	// /secret-admin/config-manager/company-information
	const rootPathCompanyInformation = getRootPathSecretAdminConfigManagerCompanyInformation();
	const companyInformationPath = route(rootPathCompanyInformation);
	const companyInformationUrl = absoluteUrl(companyInformationPath);

	// /secret-admin/config-manager/marketing-information
	const rootPathMarketingInformation = getRootPathSecretAdminConfigManagerMarketingInformation();
	const marketingInformationPath = route(rootPathMarketingInformation);
	const marketingInformationUrl = absoluteUrl(marketingInformationPath);

	// /secret-admin/config-manager/landing-page
	const rootPathLandingPage = getRootPathSecretAdminConfigManagerLandingPage();
	const landingPagePath = route(rootPathLandingPage);
	const landingPageUrl = absoluteUrl(landingPagePath);

	// /secret-admin/config-manager/blog-information
	const rootPathBlogInformation = getRootPathSecretAdminConfigManagerBlogInformation();
	const blogInformationPath = route(rootPathBlogInformation);
	const blogInformationUrl = absoluteUrl(blogInformationPath);
</script>

<div class="p-4 md:p-6">
	<h1 class="text-xl font-semibold text-base-content">
		Config manager</h1>
	<p class="text-sm text-base-content/70 mt-1">
		Update module configuration values for company, marketing, landing page, and blog modules.
	</p>

	<ul class="mt-4 list-disc list-inside space-y-1 text-sm">
		<li>
			<a href={companyInformationUrl} class="link link-primary">Company Information</a>
		</li>
		<li>
			<a href={marketingInformationUrl} class="link link-primary">Marketing Information</a>
		</li>
		<li>
			<a href={landingPageUrl} class="link link-primary">Landing Page</a>
		</li>
		<li>
			<a href={blogInformationUrl} class="link link-primary">Blog Information</a>
		</li>
	</ul>
</div>
