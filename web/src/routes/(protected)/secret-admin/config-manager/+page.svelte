<script lang="ts">
	import {
		getRootPathSecretAdminConfigManagerBlogInformation,
		getRootPathSecretAdminConfigManagerCompanyInformation,
		getRootPathSecretAdminConfigManagerLandingPage,
		getRootPathSecretAdminConfigManagerMarketingInformation,
		getRootPathSecretAdminConfigManagerPublicFaq
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { url } from '$lib/utils/path';

	// /secret-admin/config-manager/company-information
	const rootPathCompanyInformation = getRootPathSecretAdminConfigManagerCompanyInformation();
	const companyInformationUrl = url(rootPathCompanyInformation);

	// /secret-admin/config-manager/marketing-information
	const rootPathMarketingInformation = getRootPathSecretAdminConfigManagerMarketingInformation();
	const marketingInformationUrl = url(rootPathMarketingInformation);

	// /secret-admin/config-manager/landing-page
	const rootPathLandingPage = getRootPathSecretAdminConfigManagerLandingPage();
	const landingPageUrl = url(rootPathLandingPage);

	// /secret-admin/config-manager/public-faq
	const rootPathPublicFaq = getRootPathSecretAdminConfigManagerPublicFaq();
	const publicFaqUrl = url(rootPathPublicFaq);

	// /secret-admin/config-manager/blog-information
	const rootPathBlogInformation = getRootPathSecretAdminConfigManagerBlogInformation();
	const blogInformationUrl = url(rootPathBlogInformation);

	const sections = [
		{
			href: companyInformationUrl,
			label: 'Company Information',
			description: 'Trading name, legal name (OPENQUOK), support contact, and company details.'
		},
		{
			href: marketingInformationUrl,
			label: 'Marketing Information',
			description: 'Default meta title, description, keywords, and social profile links.'
		},
		{
			href: landingPageUrl,
			label: 'Landing Page',
			description: 'Hero, sections, comparison, CTA, and other landing page copy.'
		},
		{
			href: publicFaqUrl,
			label: 'Public FAQ',
			description: 'FAQ section copy shown on marketing pages.'
		},
		{
			href: blogInformationUrl,
			label: 'Blog Information',
			description: 'Blog hub SEO title, description, and related metadata.'
		}
	] as const;
</script>

<div class="space-y-4">
	<p class="text-sm text-base-content/80">
		Update runtime configuration for company, marketing, landing page, public FAQ, and blog modules.
	</p>

	<ul class="grid gap-3 sm:grid-cols-1">
		{#each sections as section (section.href)}
			<li>
				<a
					href={section.href}
					class="block rounded-lg border border-base-300 bg-base-200/60 px-4 py-3 transition-colors hover:border-primary hover:bg-base-200"
				>
					<span class="font-semibold text-primary">{section.label}</span>
					<p class="mt-1 text-sm text-base-content/70">{section.description}</p>
				</a>
			</li>
		{/each}
	</ul>
</div>
