<script lang="ts">
	import AutoBreadcrumb from '$lib/ui/components/docs/nav/DocsAutoBreadcrumb.svelte';
	import DocsLocaleSwitcher from '$lib/ui/components/docs/DocsLocaleSwitcher.svelte';
	import SocialLinks, { type SocialLink } from '$lib/ui/components/docs/nav/DocsSocialLinks.svelte';
	import ThemeSwitcher from '$lib/ui/daisyui/ThemeSwitcher.svelte';
	import * as Sidebar from '$lib/ui/sidebar-main/index.js';

	let { socialLinks = [] }: { socialLinks?: SocialLink[] } = $props();
</script>

<header
	class="bg-base-100 border-base-300 sticky top-0 z-50 flex h-14 shrink-0 flex-row items-center justify-between border-b px-3"
>
	<div class="flex items-center gap-2">
		<Sidebar.Trigger />
		<AutoBreadcrumb />
	</div>
	<div class="flex items-center gap-1">
		<div class="hidden items-center md:flex">
			<SocialLinks links={socialLinks} />
		</div>
		<DocsLocaleSwitcher variant="header" />
		<ThemeSwitcher />
	</div>
</header>
