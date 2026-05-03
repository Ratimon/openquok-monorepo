<script lang="ts">
	import { page } from '$app/state';

	import {
		absoluteDocsUrl,
		docsMarkdownPath,
		docsPagePath
	} from '$lib/docs/utils/doc-share-urls';
	import { cn } from '$lib/ui/helpers/common';
	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import { toast } from '$lib/ui/sonner';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { icons } from '$data/icons';

	let {
		rawContent = '',
		slug = '',
		locale
	}: {
		rawContent?: string;
		slug?: string;
		locale?: string;
	} = $props();

	let origin = $derived(page.url.origin);

	let pagePath = $derived(docsPagePath(slug, locale));
	let markdownPath = $derived(docsMarkdownPath(slug, locale));

	let pageAbsolute = $derived(absoluteDocsUrl(pagePath, origin));
	let markdownAbsolute = $derived(absoluteDocsUrl(markdownPath, origin));

	/** Same-origin URL to fetch raw Markdown when `rawContent` from load is empty (e.g. glob key mismatch). */
	let markdownFetchUrl = $derived(new URL(markdownPath, page.url.origin).href);

	let chatgptUrl = $derived(
		`https://chatgpt.com/?hints=search&q=${encodeURIComponent(
			`Read from ${pageAbsolute} so I can ask questions about it.`
		)}`
	);

	let claudeUrl = $derived(
		`https://claude.ai/new?q=${encodeURIComponent(
			`Read from ${markdownAbsolute} so I can ask questions about it.`
		)}`
	);

	async function resolveMarkdownForCopy(): Promise<string> {
		const trimmed = rawContent.trim();
		if (trimmed) return rawContent;
		try {
			const res = await fetch(markdownFetchUrl);
			if (res.ok) return await res.text();
		} catch {
			// fall through
		}
		return '';
	}

	async function copyMarkdown() {
		const text = await resolveMarkdownForCopy();
		if (!text.trim()) {
			toast.error('No markdown content to copy.');
			return;
		}
		try {
			await navigator.clipboard.writeText(text);
			toast.success('Copied page as Markdown.');
		} catch {
			toast.error('Could not copy to clipboard.');
		}
	}

	/**
	 * Opens in a new tab with explicit `rel` (window.open has no `rel`; its 3rd arg is window features).
	 * External URLs: match ExternalLink.svelte defaults (trusted=false, follow=false).
	 */
	function openInNewTab(href: string, rel: string) {
		if (typeof document === 'undefined') return;
		const a = document.createElement('a');
		a.href = href;
		a.target = '_blank';
		a.rel = rel;
		document.body.appendChild(a);
		a.click();
		a.remove();
	}

	function openMarkdownTab() {
		openInNewTab(markdownAbsolute, 'noopener noreferrer');
	}

	function openExternal(url: string) {
		openInNewTab(url, 'noopener noreferrer nofollow');
	}
</script>

<DropdownMenu.Root>
	<div
		class="border-base-300 bg-base-100/80 text-base-content/90 hover:border-base-content/20 inline-flex shrink-0 items-stretch overflow-hidden rounded-lg border text-sm shadow-sm"
	>
		<button
			type="button"
			class="hover:bg-base-200/80 inline-flex items-center gap-2 px-3 py-2 transition-colors"
			aria-label="Copy page as Markdown"
			onclick={() => void copyMarkdown()}
		>
			<AbstractIcon name={icons.Copy.name} class="size-4 shrink-0" width="16" height="16" />
			<span class="hidden sm:inline">Copy page</span>
		</button>
		<div class="bg-base-300 w-px shrink-0 self-stretch opacity-60" aria-hidden="true"></div>
		<DropdownMenu.Trigger
			class={cn(
				'hover:bg-base-200/80 inline-flex items-center justify-center px-2 transition-colors',
				'outline-none focus-visible:ring-2 focus-visible:ring-primary'
			)}
			aria-label="More copy and share options"
		>
			<AbstractIcon name={icons.ChevronDown.name} class="size-4" width="16" height="16" />
		</DropdownMenu.Trigger>
	</div>

	<DropdownMenu.Content class="min-w-[min(100vw-2rem,20rem)] p-1" align="end" sideOffset={6}>
		<DropdownMenu.Item class="cursor-pointer p-0" onclick={() => void copyMarkdown()}>
			<div class="flex w-full items-start gap-3 px-2 py-2.5">
				<span
					class="border-base-300 bg-base-200/50 flex size-9 shrink-0 items-center justify-center rounded-md border"
				>
					<AbstractIcon name={icons.Copy.name} class="size-4" width="16" height="16" />
				</span>
				<div class="min-w-0 flex-1">
					<div class="text-base-content font-medium leading-tight">
						Copy page</div>
					<div class="text-base-content/55 mt-0.5 text-xs leading-snug">
						Copy page as Markdown for LLMs
					</div>
				</div>
			</div>
		</DropdownMenu.Item>

		<DropdownMenu.Item class="cursor-pointer p-0" onclick={openMarkdownTab}>
			<div class="flex w-full items-start gap-3 px-2 py-2.5">
				<span
					class="border-base-300 bg-base-200/50 flex size-9 shrink-0 items-center justify-center rounded-md border"
				>
					<AbstractIcon name={icons.FileText.name} class="size-4" width="16" height="16" />
				</span>
				<div class="min-w-0 flex-1">
					<div class="text-base-content flex items-center gap-1 font-medium leading-tight">
						View as Markdown
						<AbstractIcon name={icons.Link.name} class="text-base-content/50 size-3.5" width="14" height="14" />
					</div>
					<div class="text-base-content/55 mt-0.5 text-xs leading-snug">
						View this page as plain text
					</div>
				</div>
			</div>
		</DropdownMenu.Item>

		<DropdownMenu.Item class="cursor-pointer p-0" onclick={() => openExternal(chatgptUrl)}>
			<div class="flex w-full items-start gap-3 px-2 py-2.5">
				<span
					class="flex size-9 shrink-0 items-center justify-center rounded-md border border-[#10a37f]/40 bg-[#10a37f]/15"
				>
					<AbstractIcon name={icons.ChatGPT.name} class="size-5" width="20" height="20" />
				</span>
				<div class="min-w-0 flex-1">
					<div class="text-base-content flex items-center gap-1 font-medium leading-tight">
						Open in ChatGPT
						<AbstractIcon name={icons.Link.name} class="text-base-content/50 size-3.5" width="14" height="14" />
					</div>
					<div class="text-base-content/55 mt-0.5 text-xs leading-snug">
						Ask questions about this page
					</div>
				</div>
			</div>
		</DropdownMenu.Item>

		<DropdownMenu.Item class="cursor-pointer p-0" onclick={() => openExternal(claudeUrl)}>
			<div class="flex w-full items-start gap-3 px-2 py-2.5">
				<span class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#D77655]/40">
					<AbstractIcon name={icons.Claude.name} class="size-7" width="28" height="28" />
				</span>
				<div class="min-w-0 flex-1">
					<div class="text-base-content flex items-center gap-1 font-medium leading-tight">
						Open in Claude
						<AbstractIcon name={icons.Link.name} class="text-base-content/50 size-3.5" width="14" height="14" />
					</div>
					<div class="text-base-content/55 mt-0.5 text-xs leading-snug">
						Ask questions about this page
					</div>
				</div>
			</div>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
