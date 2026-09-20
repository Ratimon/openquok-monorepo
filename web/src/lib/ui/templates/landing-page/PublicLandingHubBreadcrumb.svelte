<script lang="ts">
	import * as Breadcrumb from '$lib/ui/breadcrumb';
	import { cn } from '$lib/ui/helpers/common';

	import {
		PUBLIC_LANDING_BREADCRUMB_LINK_CLASS,
		PUBLIC_LANDING_BREADCRUMB_PAGE_CLASS,
		PUBLIC_LANDING_BREADCRUMB_SEPARATOR_CLASS
	} from '$lib/ui/templates/landing-page/publicLandingBreadcrumbStyles';

	export type PublicLandingHubBreadcrumbItem = {
		label: string;
		href?: string | null;
	};

	type Props = {
		items: PublicLandingHubBreadcrumbItem[];
		class?: string;
		linkClass?: string;
		pageClass?: string;
		separatorClass?: string;
	};

	let {
		items,
		class: className = '',
		linkClass = PUBLIC_LANDING_BREADCRUMB_LINK_CLASS,
		pageClass = PUBLIC_LANDING_BREADCRUMB_PAGE_CLASS,
		separatorClass = PUBLIC_LANDING_BREADCRUMB_SEPARATOR_CLASS
	}: Props = $props();
</script>

<Breadcrumb.Root class={cn('max-w-full', className)}>
	<Breadcrumb.List>
		{#each items as item, index (index)}
			{#if index > 0}
				<Breadcrumb.Separator class={separatorClass} />
			{/if}
			<Breadcrumb.Item>
				{#if item.href?.trim()}
					<Breadcrumb.Link href={item.href} class={linkClass}>
						{item.label}
					</Breadcrumb.Link>
				{:else}
					<Breadcrumb.Page class={pageClass}>{item.label}</Breadcrumb.Page>
				{/if}
			</Breadcrumb.Item>
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
