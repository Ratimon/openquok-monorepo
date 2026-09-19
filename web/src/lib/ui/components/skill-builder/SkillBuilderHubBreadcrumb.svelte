<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';

	import * as Breadcrumb from '$lib/ui/breadcrumb';
	import {
		PUBLIC_LANDING_BREADCRUMB_LINK_CLASS,
		PUBLIC_LANDING_BREADCRUMB_PAGE_CLASS,
		PUBLIC_LANDING_BREADCRUMB_SEPARATOR_CLASS
	} from '$lib/ui/templates/landing-page/publicLandingBreadcrumbStyles';

	type Props = {
		toolsHubHref: string;
		skillBuilderHref: string;
		channelLabel?: string | null;
		class?: string;
	};

	let {
		toolsHubHref,
		skillBuilderHref,
		channelLabel = null,
		class: className = ''
	}: Props = $props();
</script>

<Breadcrumb.Root class={cn('max-w-full', className)}>
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href={toolsHubHref} class={PUBLIC_LANDING_BREADCRUMB_LINK_CLASS}>
				Free Tools
			</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator class={PUBLIC_LANDING_BREADCRUMB_SEPARATOR_CLASS} />
		{#if channelLabel?.trim()}
			<Breadcrumb.Item>
				<Breadcrumb.Link href={skillBuilderHref} class={PUBLIC_LANDING_BREADCRUMB_LINK_CLASS}>
					Skill Builder
				</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator class={PUBLIC_LANDING_BREADCRUMB_SEPARATOR_CLASS} />
			<Breadcrumb.Item>
				<Breadcrumb.Page class={PUBLIC_LANDING_BREADCRUMB_PAGE_CLASS}>{channelLabel.trim()}</Breadcrumb.Page>
			</Breadcrumb.Item>
		{:else}
			<Breadcrumb.Item>
				<Breadcrumb.Page class={PUBLIC_LANDING_BREADCRUMB_PAGE_CLASS}>Skill Builder</Breadcrumb.Page>
			</Breadcrumb.Item>
		{/if}
	</Breadcrumb.List>
</Breadcrumb.Root>
