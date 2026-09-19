<script lang="ts">
	import { page } from '$app/state';

	import {
		getRootPathSocialMediaPostingApi,
		getRootPathSocialMediaSchedulingApi
	} from '$lib/area-public/constants/getRootPathPublicApiMarketing';
	import {
		getPublicApiPostingHubPage,
		getPublicApiSchedulingHubPage
	} from '$lib/content/constants/apis/index';
	import type { PublicApiCapability } from '$lib/content/constants/apis/types';
	import * as Breadcrumb from '$lib/ui/breadcrumb';
	import { cn } from '$lib/ui/helpers/common';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	type Props = {
		capability: PublicApiCapability;
		platformLabel?: string | null;
		class?: string;
	};

	let { capability, platformLabel = null, class: className = '' }: Props = $props();

	const hubVm = $derived(
		capability === 'posting' ? getPublicApiPostingHubPage() : getPublicApiSchedulingHubPage()
	);

	const homeHref = $derived(hostedMarketingHref('/', page.url.origin));

	const hubHref = $derived(
		hostedMarketingHref(
			route(
				capability === 'posting'
					? getRootPathSocialMediaPostingApi()
					: getRootPathSocialMediaSchedulingApi()
			),
			page.url.origin
		)
	);

	const linkClass =
		'text-primary hover:text-primary/80 text-sm font-bold uppercase tracking-wider no-underline';
	const pageClass =
		'text-primary line-clamp-1 text-sm font-bold uppercase tracking-wider';
</script>

<Breadcrumb.Root class={cn('max-w-full', className)}>
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href={homeHref} class={linkClass}>Home</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator class="text-primary/60" />
		{#if platformLabel?.trim()}
			<Breadcrumb.Item>
				<Breadcrumb.Link href={hubHref} class={linkClass}>{hubVm.metaTitle}</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator class="text-primary/60" />
			<Breadcrumb.Item>
				<Breadcrumb.Page class={pageClass}>{platformLabel.trim()}</Breadcrumb.Page>
			</Breadcrumb.Item>
		{:else}
			<Breadcrumb.Item>
				<Breadcrumb.Page class={pageClass}>{hubVm.metaTitle}</Breadcrumb.Page>
			</Breadcrumb.Item>
		{/if}
	</Breadcrumb.List>
</Breadcrumb.Root>
