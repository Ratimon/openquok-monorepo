<script lang="ts">
	import {
		getRootPathSecretAdminConfigManagerBlogInformation,
		getRootPathSecretAdminConfigManagerPublicFaq
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { absoluteUrl, route } from '$lib/utils/path';

	// /secret-admin/config-manager/public-faq
	const rootPathPublicFaq = getRootPathSecretAdminConfigManagerPublicFaq();
	const publicFaqPath = route(rootPathPublicFaq);
	const publicFaqUrl = absoluteUrl(publicFaqPath);

	// /secret-admin/config-manager/blog-information
	const rootPathBlogInformation = getRootPathSecretAdminConfigManagerBlogInformation();
	const blogInformationPath = route(rootPathBlogInformation);
	const blogInformationUrl = absoluteUrl(blogInformationPath);
</script>

<div class="p-4 md:p-6">
	<h1 class="text-xl font-semibold text-base-content">
		Config manager</h1>
	<p class="text-sm text-base-content/70 mt-1">
		Update runtime configuration for public FAQ and blog SEO. Landing, company, and marketing copy are managed in <code>web/src/lib/config/constants/config.ts</code>.
	</p>

	<ul class="mt-4 list-disc list-inside space-y-1 text-sm">
		<li>
			<a href={publicFaqUrl} class="link link-primary">Public FAQ</a>
		</li>
		<li>
			<a href={blogInformationUrl} class="link link-primary">Blog Information</a>
		</li>
	</ul>
</div>
