<script lang="ts">
	import type { Component } from 'svelte';
	import type { DocMeta } from '$lib/docs/types';

	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { setContext } from 'svelte';

	import { DOCS_PLAYGROUND, type DocsPlaygroundContext } from '$lib/docs/docs-playground-context';

	import { toc } from '$lib/docs/utils/toc-state.svelte';
	import { docsConfig } from '$lib/docs/constants';
	import { calculateReadingTime } from '$lib/docs/utils/reading-time';
	import { stringToSlug } from '$lib/ui/helpers/common';
	import { icons } from '$data/icons';

	import DocsMobileToc from '$lib/ui/components/docs/DocsMobileToc.svelte';
	import DocsBackToTop from '$lib/ui/components/docs/nav/DocsBackToTop.svelte';
	import DocsCopyButton from '$lib/ui/components/docs/DocsCopyButton.svelte';
	import DocsCopyUrl from '$lib/ui/components/docs/nav/DocsCopyUrl.svelte';
	import DocsPageFeedback from '$lib/ui/components/docs/nav/DocsPageFeedback.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import OpenApiDocSplit from '$lib/ui/components/docs/OpenApiDocSplit.svelte';
	import OpenApiPlaygroundModal from '$lib/ui/components/docs/OpenApiPlaygroundModal.svelte';

	let {
		meta,
		loadContent,
		slug = '',
		rawContent = '',
		locale
	}: {
		meta: DocMeta;
		loadContent: () => Promise<Component>;
		slug?: string;
		rawContent?: string;
		locale?: string;
	} = $props();

	let readingTime = $derived(rawContent ? calculateReadingTime(rawContent) : '');
	let hasOpenapi = $derived(Boolean(meta.openapi?.trim()));
	let playgroundOpen = $derived(page.url.searchParams.get('playground') === 'open');
	let playgroundModalOpen = $state(false);

	let contentEl: HTMLDivElement | undefined = $state();

	function stripPlaygroundQuery() {
		if (!browser) return;
		const u = new URL(page.url.href);
		if (!u.searchParams.has('playground')) return;
		u.searchParams.delete('playground');
		void goto(`${u.pathname}${u.search}${u.hash}`, { replaceState: true, noScroll: true });
	}

	function openPlaygroundModal() {
		playgroundModalOpen = true;
		const u = new URL(page.url.href);
		u.searchParams.set('playground', 'open');
		void goto(`${u.pathname}${u.search}${u.hash}`, { replaceState: false, noScroll: true });
	}

	setContext<DocsPlaygroundContext>(DOCS_PLAYGROUND, {
		open: openPlaygroundModal
	});

	let editUrl = $derived.by(() => {
		const github = docsConfig.site.social?.github;
		if (!github) return '';
		const filePath = slug ? `web/src/content/docs/${slug}.md` : 'web/src/content/docs/index.md';
		return `${github}/edit/main/${filePath}`;
	});

	function enhanceContent(container: HTMLElement) {
		const headings = container.querySelectorAll<HTMLElement>('h2, h3, h4, h5, h6');
		const usedIds = new Set<string>();

		/** Same title (or duplicate markdown `id`) twice must not share one DOM id — breaks TOC keys and `getElementById`. */
		function takeUniqueId(baseRaw: string): string {
			const base = (baseRaw || 'heading').replace(/(^-|-$)/g, '') || 'heading';
			let id = base;
			let n = 2;
			while (usedIds.has(id)) {
				id = `${base}-${n}`;
				n += 1;
			}
			usedIds.add(id);
			return id;
		}

		for (const heading of headings) {
			// Alert / Callout titles use <h5> (AlertTitle); do not add TOC anchor "#" to those.
			if (heading.closest('[role="alert"]')) continue;

			const text = heading.textContent?.trim() ?? '';
			const fromText = stringToSlug(text) || 'heading';
			const base = heading.id?.trim() ? heading.id.trim() : fromText;
			heading.id = takeUniqueId(base);

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
					'fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-base-content/80 p-8';
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

	function scrollToHashFromUrl() {
		if (!browser) return;
		const raw = page.url.hash;
		if (!raw || raw.length <= 1) return;
		const id = decodeURIComponent(raw.slice(1));
		requestAnimationFrame(() => {
			document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
		});
	}

	$effect(() => {
		void contentEl;
		void page.url.hash;

		const timer = setTimeout(() => {
			if (contentEl) {
				enhanceContent(contentEl);
				scrollToHashFromUrl();
			}
		}, 0);

		return () => {
			clearTimeout(timer);
			toc.clear();
		};
	});

	$effect(() => {
		if (playgroundOpen && hasOpenapi) {
			playgroundModalOpen = true;
		}
	});
</script>

<article
	id="doc-content"
	class="doc-content mx-auto min-w-0 w-full {hasOpenapi ? 'max-w-[min(100%,85rem)]' : 'max-w-4xl'}"
	data-pagefind-body
>
	<header class="mb-8">
		<div class="mb-2 flex flex-col gap-4 sm:mb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
			<h1 class="text-base-content min-w-0 flex-1 text-3xl font-bold tracking-tight">
				{meta.title}
			</h1>
			<div class="shrink-0 self-start sm:pt-0.5">
				<DocsCopyButton {rawContent} {slug} {locale} />
			</div>
		</div>
		{#if meta.description}
			<p class="text-base-content/70 mt-2 text-lg">
				{meta.description}
			</p>
		{/if}
		{#if readingTime}
			<div class="text-base-content/60 mt-3 flex items-center gap-1.5 text-sm">
				<AbstractIcon name={icons.CalendarClock.name} class="size-3.5" width="14" height="14" />
				<span>{readingTime}</span>
			</div>
		{/if}
	</header>

	<DocsMobileToc />

	{#await loadContent()}
		<p class="text-base-content/60 px-1 py-10 text-sm">
			Loading article…</p>
	{:then Content}
		{#if hasOpenapi}
			<OpenApiDocSplit operation={(meta.openapi ?? '').trim()} bind:contentEl>
				<Content />
			</OpenApiDocSplit>
		{:else}
			<div
				class="prose min-w-0 max-w-none break-words text-base-content prose-headings:text-base-content prose-headings:scroll-mt-28 prose-p:text-base-content/90 prose-strong:text-base-content prose-a:text-primary prose-blockquote:border-base-content/20 prose-blockquote:text-base-content/80 prose-code:text-base-content prose-li:marker:text-base-content/60 prose-hr:border-base-300 [&_pre]:min-w-0 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre.shiki]:whitespace-pre-wrap [&_pre.shiki]:[overflow-wrap:anywhere]"
				bind:this={contentEl}
			>
				<Content />
			</div>
		{/if}
	{:catch}
		<p class="text-error px-1 py-6 text-sm">
			Could not load this article.</p>
	{/await}

	{#if hasOpenapi}
		<OpenApiPlaygroundModal
			bind:open={playgroundModalOpen}
			operation={(meta.openapi ?? '').trim()}
			onClose={stripPlaygroundQuery}
		/>
	{/if}

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
				<DocsPageFeedback pageTitle={meta.title} />
				<DocsCopyUrl />
				<DocsBackToTop />
			</div>
		</div>
	</footer>
</article>
