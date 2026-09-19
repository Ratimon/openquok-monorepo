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
	};

	let { items, class: className = '' }: Props = $props();
</script>

<Breadcrumb.Root class={cn('max-w-full', className)}>
	<Breadcrumb.List>
		{#each items as item, index (index)}
			{#if index > 0}
				<Breadcrumb.Separator class={PUBLIC_LANDING_BREADCRUMB_SEPARATOR_CLASS} />
			{/if}
			<Breadcrumb.Item>
				{#if item.href?.trim()}
					<Breadcrumb.Link href={item.href} class={PUBLIC_LANDING_BREADCRUMB_LINK_CLASS}>
						{item.label}
					</Breadcrumb.Link>
				{:else}
					<Breadcrumb.Page class={PUBLIC_LANDING_BREADCRUMB_PAGE_CLASS}>{item.label}</Breadcrumb.Page>
				{/if}
			</Breadcrumb.Item>
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
