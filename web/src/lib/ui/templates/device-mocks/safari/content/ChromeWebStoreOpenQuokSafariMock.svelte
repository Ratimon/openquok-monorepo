<script lang="ts">
	import { icons } from '$data/icons';

	import { getBrowserExtensionChromeWebStoreListingUrl } from '$lib/integrations/browser-extension/extensionConfig';
	import { resolveExternalLinkPolicy } from '$lib/utils/externalLinkRel';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const storeHref = getBrowserExtensionChromeWebStoreListingUrl();
	const storeLink = $derived(resolveExternalLinkPolicy(storeHref));
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-white text-[#202124]"
>
	<header class="border-b border-[#dadce0] px-6 py-3">
		<div class="flex items-center gap-3">
			<AbstractIcon
				name={icons.OpenQuok.name}
				class="size-8 shrink-0"
				width="32"
				height="32"
				focusable="false"
			/>
			<div class="min-w-0">
				<p class="text-sm font-medium text-[#5f6368]">Chrome Web Store</p>
				<p class="truncate text-xl font-normal text-[#202124]">OpenQuok</p>
			</div>
		</div>
	</header>

	<main class="min-h-0 flex-1 space-y-5 overflow-hidden px-6 py-5">
		<div class="flex flex-wrap items-start gap-4">
			<div
				class="grid size-20 shrink-0 place-items-center rounded-2xl bg-[#f1f3f4] shadow-sm ring-1 ring-[#dadce0]"
			>
				<AbstractIcon
					name={icons.OpenQuok.name}
					class="size-12"
					width="48"
					height="48"
					focusable="false"
				/>
			</div>
			<div class="min-w-0 flex-1 space-y-2">
				<h1 class="text-3xl font-normal tracking-tight text-[#202124] sm:text-4xl">OpenQuok</h1>
				<p class="text-lg text-[#5f6368]">Social scheduling side panel, directory autofill, and connect helpers</p>
				<div class="flex flex-wrap items-center gap-3 pt-1">
					<a
						href={storeLink.href}
						target={storeLink.target}
						rel={storeLink.rel}
						class="pointer-events-auto inline-flex items-center justify-center rounded-full bg-[#1a73e8] px-6 py-2.5 text-lg font-medium text-white shadow-sm transition-colors hover:bg-[#1765cc]"
					>
						Add to Chrome
					</a>
					<span class="text-base text-[#5f6368]">Free · Extension</span>
				</div>
			</div>
		</div>

		<div class="rounded-xl border border-[#dadce0] bg-[#f8f9fa] px-4 py-3">
			<p class="text-base leading-relaxed text-[#3c4043]">
				Schedule or draft from the side panel, start posts from selected text, autofill directory launch
				forms, and hand off Reddit without leaving the tab you are on.
			</p>
		</div>

		<div class="space-y-2">
			<p class="text-sm font-medium uppercase tracking-wide text-[#5f6368]">Overview</p>
			<ul class="list-disc space-y-1 pl-5 text-base text-[#3c4043]">
				<li>Side-panel composer tied to your OpenQuok workspace</li>
				<li>Right-click drafts from page selections</li>
				<li>Extension-assisted connect for in-browser networks</li>
			</ul>
		</div>
	</main>
</div>
