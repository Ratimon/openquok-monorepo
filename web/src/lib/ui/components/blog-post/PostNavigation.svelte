<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type NavLink = { name: string; href: string };

	type Props = {
		previousLink?: NavLink | null;
		nextLink?: NavLink | null;
		previousLabel?: string;
		nextLabel?: string;
		class?: string;
	};

	let {
		previousLink,
		nextLink,
		previousLabel = 'Previous',
		nextLabel = 'Next',
		class: className = ''
	}: Props = $props();
</script>

<div
	aria-labelledby="blog-post-nav-heading"
	data-testid="blog-post-navigation"
	class={cn('mt-4 grid w-full grid-cols-2 gap-2 align-top', className)}
>
	<span id="blog-post-nav-heading" class="sr-only">Post navigation</span>
	{#if previousLink?.href && previousLink?.name}
		<a href={previousLink.href} class="col-span-2 md:col-span-1">
			<div
				class="flex h-full items-start justify-between rounded-md border border-base-300 bg-base-200 p-4 text-right shadow-sm transition hover:cursor-pointer hover:shadow-md"
			>
				<AbstractIcon name={icons.ArrowLeft.name} width="24" height="24" />
				<div class="grid min-w-0 text-right">
					<p class="text-sm italic text-base-content/70">
						{previousLabel}</p>
					<p class="truncate font-medium">
						{previousLink.name}</p>
				</div>
			</div>
		</a>
	{:else}
		<div class="hidden md:col-span-1 md:block" aria-hidden="true"></div>
	{/if}

	{#if nextLink?.href && nextLink?.name}
		<a href={nextLink.href} class="col-span-2 md:col-span-1">
			<div
				class="flex h-full items-start justify-between rounded-md border border-base-300 bg-base-200 p-4 text-left shadow-sm transition hover:cursor-pointer hover:shadow-md"
			>
				<div class="grid min-w-0">
					<p class="text-sm italic text-base-content/70">
						{nextLabel}</p>
					<p class="truncate font-medium">
						{nextLink.name}</p>
				</div>
				<AbstractIcon name={icons.ArrowRight.name} width="24" height="24" />
			</div>
		</a>
	{:else}
		<div class="hidden md:col-span-1 md:block" aria-hidden="true"></div>
	{/if}
</div>
