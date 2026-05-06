<script lang="ts">
	import { parseHeadersFromHTMLString } from '$lib/blogs/utils';
	import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
	import { cn } from '$lib/ui/helpers/common';
	import * as Breadcrumb from '$lib/ui/breadcrumb';
	import ScrollLink from '$lib/ui/nav-bars/ScrollLink.svelte';
	import { url } from '$lib/utils/path';

	// /blog
	const rootPathPublicBlog = getRootPathPublicBlog();
	const publicBlogHrefDefault = url(`/${rootPathPublicBlog}`);

	type Props = {
		content: string;
		title?: string;
		class?: string;
		/** Match template: show a trail to the blog index (no current-page crumb). */
		showBreadcrumb?: boolean;
		blogHref?: string;
		blogLabel?: string;
	};

	let {
		content,
		title = 'Table of contents',
		class: className = '',
		showBreadcrumb = true,
		blogHref: blogHrefProp,
		blogLabel = 'Blog'
	}: Props = $props();

	let headers = $derived(parseHeadersFromHTMLString(content ?? ''));

	let blogHref = $derived(blogHrefProp ?? publicBlogHrefDefault);

	function indentClass(level: number): string {
		if (level <= 1) return 'pl-0';
		if (level === 2) return 'pl-2';
		if (level === 3) return 'pl-4';
		return 'pl-6';
	}
</script>

<div
	data-testid="table-of-contents"
	id="table-of-contents"
	class={cn('sticky flex w-full flex-col md:top-[180px] md:w-48', className)}
>
	{#if showBreadcrumb}
		<Breadcrumb.Root class="mb-3 max-w-full">
			<Breadcrumb.List>
				<Breadcrumb.Item>
					<Breadcrumb.Link href={blogHref} class="text-sm">{blogLabel}</Breadcrumb.Link>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
	{/if}

	{#if headers.length > 0}
		<h2 class="text-sm font-semibold text-base-content">
			{title}</h2>
		<ul class="space-y-1 py-2">
			{#each headers as header, index (header.slug + index)}
				<li class={indentClass(header.level)}>
					<ScrollLink
						href="#{header.slug}"
						class={cn(
							'block text-sm leading-6 transition-colors duration-200 ease-in-out hover:text-primary',
							header.level < 2 ? 'mt-2 font-medium text-base-content' : 'text-base-content/70'
						)}
					>
						{header.title}
					</ScrollLink>
				</li>
			{/each}
		</ul>
	{/if}
</div>
