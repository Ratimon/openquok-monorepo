<script lang="ts">
	import type { Component } from 'svelte';
	import type { DocMeta } from '$lib/docs/types';
	import { toc } from '$lib/docs/utils/toc-state.svelte';
	import { docsConfig } from '$lib/docs/constants';
	import { icons } from '$data/icon';

	import DocsMobileToc from '$lib/ui/components/docs/DocsMobileToc.svelte';
	import DocsBackToTop from '$lib/ui/components/docs/nav/DocsBackToTop.svelte';
	import DocsCopyUrl from '$lib/ui/components/docs/nav/DocsCopyUrl.svelte';
	import DocsPageFeedback from '$lib/ui/components/docs/nav/DocsPageFeedback.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { calculateReadingTime } from '$lib/docs/utils/reading-time';

	let {
		meta,
		component: Content,
		slug = '',
		rawContent = ''
	}: {
		meta: DocMeta;
		component: Component;
		slug?: string;
		rawContent?: string;
	} = $props();

	let readingTime = $derived(rawContent ? calculateReadingTime(rawContent) : '');

	let contentEl: HTMLDivElement | undefined = $state();

	let editUrl = $derived.by(() => {
		const github = docsConfig.site.social?.github;
		if (!github) return '';
		const filePath = slug ? `web/src/content/docs/${slug}.md` : 'web/src/content/docs/index.md';
		return `${github}/edit/main/${filePath}`;
	});

	function enhanceContent(container: HTMLElement) {
		const headings = container.querySelectorAll<HTMLElement>('h2, h3, h4, h5, h6');
		for (const heading of headings) {
			if (!heading.id) {
				heading.id =
					heading.textContent
						?.trim()
						.toLowerCase()
						.replace(/[^a-z0-9]+/g, '-')
						.replace(/(^-|-$)/g, '') ?? '';
			}
			if (!heading.querySelector('.anchor-link')) {
				heading.classList.add('group', 'relative');
				const anchor = document.createElement('a');
				anchor.href = `#${heading.id}`;
				anchor.className =
					'anchor-link text-base-content/0 group-hover:text-base-content/60 absolute -left-5 top-0 no-underline transition-colors';
				anchor.textContent = '#';
				anchor.setAttribute('aria-hidden', 'true');
				heading.prepend(anchor);
			}
		}

		const codeBlocks = container.querySelectorAll<HTMLElement>('pre');
		for (const pre of codeBlocks) {
			if (pre.querySelector('.copy-btn')) continue;
			pre.classList.add('relative', 'group/code');

			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className =
				'copy-btn border-base-300 bg-base-100/80 text-base-content/70 hover:text-base-content absolute right-2 top-2 rounded-md border px-2 py-1 text-xs opacity-0 transition-opacity group-hover/code:opacity-100';
			btn.textContent = 'Copy';
			btn.addEventListener('click', () => {
				const code = pre.querySelector('code');
				if (code) {
					void navigator.clipboard.writeText(code.textContent ?? '');
					btn.textContent = 'Copied!';
					setTimeout(() => (btn.textContent = 'Copy'), 2000);
				}
			});
			pre.appendChild(btn);
		}

		const images = container.querySelectorAll<HTMLImageElement>('img');
		for (const img of images) {
			if (img.dataset.zoomEnabled) continue;
			img.dataset.zoomEnabled = 'true';
			img.classList.add('cursor-zoom-in', 'transition-transform');
			img.addEventListener('click', () => {
				const overlay = document.createElement('div');
				overlay.className =
					'fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/80 p-8';
				const clone = img.cloneNode() as HTMLImageElement;
				clone.className = 'max-h-full max-w-full rounded-lg object-contain';
				overlay.appendChild(clone);
				overlay.addEventListener('click', () => overlay.remove());
				function handler(e: KeyboardEvent) {
					if (e.key === 'Escape') {
						overlay.remove();
						document.removeEventListener('keydown', handler);
					}
				}
				document.addEventListener('keydown', handler);
				document.body.appendChild(overlay);
			});
		}

		toc.extractHeadings(container);
	}

	$effect(() => {
		void Content;

		const timer = setTimeout(() => {
			if (contentEl) enhanceContent(contentEl);
		}, 0);

		return () => {
			clearTimeout(timer);
			toc.clear();
		};
	});
</script>

<article id="doc-content" class="doc-content mx-auto w-full max-w-4xl" data-pagefind-body>
	<header class="mb-8">
		<h1 class="text-base-content text-3xl font-bold tracking-tight">{meta.title}</h1>
		{#if meta.description}
			<p class="text-base-content/70 mt-2 text-lg">{meta.description}</p>
		{/if}
		{#if readingTime}
			<div class="text-base-content/60 mt-3 flex items-center gap-1.5 text-sm">
				<AbstractIcon name={icons.CalendarClock.name} class="size-3.5" width="14" height="14" />
				<span>{readingTime}</span>
			</div>
		{/if}
	</header>

	<DocsMobileToc />

	<div class="prose prose-neutral max-w-none dark:prose-invert" bind:this={contentEl}>
		<Content />
	</div>

	<footer class="border-base-300 mt-12 border-t pt-6">
		{#if meta.lastUpdated}
			<div class="mb-4">
				<span class="text-base-content/60 inline-flex items-center gap-1.5 text-sm">
					<AbstractIcon name={icons.CalendarClock.name} class="size-3.5" width="14" height="14" />
					Last updated:
					{new Date(meta.lastUpdated).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</span>
			</div>
		{/if}
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-x-4">
				{#if editUrl}
					<a
						href={editUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="text-base-content/70 hover:text-base-content inline-flex items-center gap-1.5 text-sm"
					>
						<AbstractIcon name={icons.Pencil.name} class="size-3.5" width="14" height="14" />
						Edit this page on GitHub
					</a>
				{/if}
			</div>
			<div class="flex items-center gap-1">
				<DocsPageFeedback />
				<DocsCopyUrl />
				<DocsBackToTop />
			</div>
		</div>
	</footer>
</article>
