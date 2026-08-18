<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';

	import * as Breadcrumb from '$lib/ui/breadcrumb';

	type Props = {
		toolsHubHref: string;
		humanizerHref: string;
		channelLabel?: string | null;
		class?: string;
	};

	let {
		toolsHubHref,
		humanizerHref,
		channelLabel = null,
		class: className = ''
	}: Props = $props();
</script>

<Breadcrumb.Root class={cn('max-w-full', className)}>
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link
				href={toolsHubHref}
				class="text-primary hover:text-primary/80 text-sm no-underline font-bold tracking-wider text-primary uppercase"
			>
				Free Tools
			</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator class="text-primary/60" />
		{#if channelLabel?.trim()}
			<Breadcrumb.Item>
				<Breadcrumb.Link
					href={humanizerHref}
					class="text-primary hover:text-primary/80 text-sm no-underline"
				>
					Humanizer
				</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator class="text-primary/60" />
			<Breadcrumb.Item>
				<Breadcrumb.Page class="text-primary line-clamp-1 text-sm">{channelLabel.trim()}</Breadcrumb.Page>
			</Breadcrumb.Item>
		{:else}
			<Breadcrumb.Item>
				<Breadcrumb.Page class="text-primary line-clamp-1 text-sm">Humanizer</Breadcrumb.Page>
			</Breadcrumb.Item>
		{/if}
	</Breadcrumb.List>
</Breadcrumb.Root>
