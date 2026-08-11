<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';

	import * as Breadcrumb from '$lib/ui/breadcrumb';

	type Props = {
		toolsHubHref: string;
		bestTimeToPostHref: string;
		channelLabel?: string | null;
		class?: string;
	};

	let {
		toolsHubHref,
		bestTimeToPostHref,
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
					href={bestTimeToPostHref}
					class="text-primary hover:text-primary/80 text-sm no-underline"
				>
					Best Time to Post
				</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator class="text-primary/60" />
			<Breadcrumb.Item>
				<Breadcrumb.Page class="text-primary line-clamp-1 text-sm">{channelLabel.trim()}</Breadcrumb.Page>
			</Breadcrumb.Item>
		{:else}
			<Breadcrumb.Item>
				<Breadcrumb.Page class="text-primary line-clamp-1 text-sm">Best Time to Post</Breadcrumb.Page>
			</Breadcrumb.Item>
		{/if}
	</Breadcrumb.List>
</Breadcrumb.Root>
