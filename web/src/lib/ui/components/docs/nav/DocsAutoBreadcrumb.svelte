<script lang="ts">
	import { page } from '$app/state';
	import * as Breadcrumb from '$lib/ui/breadcrumb/index.js';
	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';

	function getSegments() {
		const pathname = page.url.pathname;
		const parts = pathname.split('/').filter(Boolean);
		return parts.map((part, i) => ({
			label: part
				.replace(/-/g, ' ')
				.replace(/\b\w/g, (c) => c.toUpperCase()),
			href: '/' + parts.slice(0, i + 1).join('/'),
			isLast: i === parts.length - 1
		}));
	}

	let segments = $derived(getSegments());
	let lastSegment = $derived(segments[segments.length - 1]);
	let hiddenSegments = $derived(segments.slice(0, -1));
</script>

<Breadcrumb.Root>
	<Breadcrumb.List class="hidden sm:flex">
		{#each segments as segment, i}
			{#if i > 0}
				<Breadcrumb.Separator />
			{/if}
			<Breadcrumb.Item>
				{#if segment.isLast}
					<Breadcrumb.Page class="line-clamp-1">
						{segment.label}
					</Breadcrumb.Page>
				{:else}
					<Breadcrumb.Link href={segment.href} class="line-clamp-1">
						{segment.label}
					</Breadcrumb.Link>
				{/if}
			</Breadcrumb.Item>
		{/each}
	</Breadcrumb.List>

	<Breadcrumb.List class="flex sm:hidden">
		{#if hiddenSegments.length > 0}
			<Breadcrumb.Item>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class="text-base-content flex items-center gap-1 rounded-md p-1 outline-none"
					>
						<Breadcrumb.Ellipsis class="size-4" />
						<span class="sr-only">Toggle menu</span>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="start">
						{#each hiddenSegments as segment}
							<DropdownMenu.Item>
								<a href={segment.href}>{segment.label}</a>
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
		{/if}
		{#if lastSegment}
			<Breadcrumb.Item>
				<Breadcrumb.Page class="line-clamp-1">
					{lastSegment.label}
				</Breadcrumb.Page>
			</Breadcrumb.Item>
		{/if}
	</Breadcrumb.List>
</Breadcrumb.Root>
