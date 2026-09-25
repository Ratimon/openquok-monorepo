<script lang="ts">
	import type { HttpClientSample } from '$lib/docs/utils/openapi/httpClientSamples';

	import { browser } from '$app/environment';

	import { highlightCode } from '$lib/docs/utils/openapi/shikiHighlight';
	import { cn } from '$lib/ui/helpers/common';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';

	type Lang = 'bash' | 'json' | 'typescript' | 'javascript' | 'shell';

	let {
		title = 'Request',
		code = '',
		language = 'bash' satisfies Lang as Lang,
		samples = undefined,
		/** Docs-site style: language dropdown when multiple client samples are available. */
		dropdown = false,
		class: className = ''
	}: {
		title?: string;
		code?: string;
		language?: Lang;
		samples?: HttpClientSample[];
		dropdown?: boolean;
		class?: string;
	} = $props();

	let html = $state('');
	let copied = $state(false);
	let selectedSampleId = $state('curl');

	let resolvedSamples = $derived.by((): HttpClientSample[] => {
		if (samples && samples.length > 0) return samples;
		const trimmed = code.trim();
		if (!trimmed) return [];
		const shikiLanguage = language === 'shell' ? 'bash' : language;
		const label = shikiLanguage === 'bash' ? 'cURL' : shikiLanguage;
		return [{ id: 'default', label, code: trimmed, shikiLanguage }];
	});

	let effectiveSelectedId = $derived.by(() => {
		const list = resolvedSamples;
		if (list.length === 0) return selectedSampleId;
		if (list.some((s) => s.id === selectedSampleId)) return selectedSampleId;
		return list[0]!.id;
	});

	let activeSample = $derived(
		resolvedSamples.find((s) => s.id === effectiveSelectedId) ?? resolvedSamples[0]
	);

	let showSampleDropdown = $derived(dropdown && resolvedSamples.length > 1);

	$effect(() => {
		const sample = activeSample;
		if (!browser || !sample?.code.trim()) {
			html = '';
			return;
		}
		let cancelled = false;
		void highlightCode(sample.code.trim(), sample.shikiLanguage).then((h) => {
			if (!cancelled) html = h;
		});
		return () => {
			cancelled = true;
		};
	});

	async function copy() {
		const text = activeSample?.code.trim() ?? code.trim();
		if (!text) return;
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div
	class={cn(
		'border-base-300/80 bg-base-100 overflow-hidden rounded-xl border shadow-sm ring-1 ring-base-300/30',
		className
	)}
>
	<div
		class="border-base-300/80 bg-base-200/35 flex items-center justify-between gap-3 border-b px-3 py-2"
	>
		<span class="text-base-content text-sm font-semibold tracking-tight">{title}</span>
		<div class="flex flex-wrap items-center justify-end gap-2">
			{#if showSampleDropdown}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class={cn(
							'border-base-300/80 bg-base-100 text-base-content/75 inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium',
							'outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100'
						)}
						aria-label="Choose request example language"
					>
						<AbstractIcon
							name={icons.Terminal.name}
							class="size-3.5 opacity-70"
							width="14"
							height="14"
						/>
						{activeSample?.label ?? 'cURL'}
						<AbstractIcon
							name={icons.ChevronDown.name}
							class="size-3 opacity-60"
							width="12"
							height="12"
						/>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="min-w-[9rem] p-1" align="end" sideOffset={6}>
						{#each resolvedSamples as sample (sample.id)}
							<DropdownMenu.Item
								class="cursor-pointer text-xs"
								onclick={() => {
									selectedSampleId = sample.id;
								}}
							>
								{sample.label}
								{#if effectiveSelectedId === sample.id}
									<AbstractIcon
										name={icons.Check.name}
										class="ms-auto size-3.5"
										width="14"
										height="14"
									/>
								{/if}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else if dropdown && activeSample}
				<span
					class="border-base-300/80 bg-base-100 text-base-content/75 inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium"
				>
					<AbstractIcon
						name={icons.Terminal.name}
						class="size-3.5 opacity-70"
						width="14"
						height="14"
					/>
					{activeSample.label}
				</span>
			{/if}
			<button
				type="button"
				class="border-base-300/70 bg-base-100 text-base-content/75 hover:bg-base-200/80 inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors"
				onclick={copy}
			>
				<AbstractIcon name={icons.Copy.name} class="size-3.5" width="14" height="14" />
				{copied ? 'Copied' : 'Copy'}
			</button>
		</div>
	</div>
	<div
		class="[&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0 [&_.shiki]:bg-base-200/25 bg-base-100 overflow-x-auto text-[13px] leading-relaxed"
	>
		{#if html}
			<!-- eslint-disable svelte/no-at-html-tags -->
			{@html html}
		{:else}
			<pre class="text-base-content/90 m-0 bg-transparent p-4 font-mono whitespace-pre-wrap"><code
					>{activeSample?.code ?? code}</code
				></pre>
		{/if}
	</div>
</div>
