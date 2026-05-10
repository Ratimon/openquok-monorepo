<script lang="ts">
	import type { Snippet } from 'svelte';

	import { icons } from '$data/icons';

	import { cn } from '$lib/ui/helpers/common';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		name: string;
		type: string;
		required?: boolean;
		deprecated?: boolean;
		default?: unknown;
		/** Labels before the field name (Mintlify `pre`). */
		pre?: string[];
		/** Labels after the field name (Mintlify `post`). */
		post?: string[];
		class?: string;
		children?: Snippet;
		description?: string;
	};

	let {
		name,
		type: typeStr,
		required = false,
		deprecated = false,
		default: defaultVal,
		pre = [],
		post = [],
		class: className,
		children,
		description: descriptionText
	}: Props = $props();

	let fieldId = $derived(`response-field-${name.replace(/[^a-zA-Z0-9_-]/g, '-')}`);

	function formatDefault(v: unknown): string {
		if (v === undefined) return '';
		if (v === null) return 'null';
		if (typeof v === 'object') return JSON.stringify(v);
		return String(v);
	}
</script>

<!-- Mintlify ResponseField-style: https://www.mintlify.com/docs/components/responses -->
<section
	id={fieldId}
	class={cn('group/rf not-prose scroll-mt-28 py-4 first:pt-0', className)}
	aria-labelledby={`${fieldId}-label`}
>
	<div class="flex flex-wrap items-center gap-x-2 gap-y-1.5">
		<a
			href={`#${fieldId}`}
			class="text-base-content/30 hover:text-base-content/55 -ms-0.5 shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover/rf:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
			aria-label="Link to this field"
		>
			<AbstractIcon name={icons.Link.name} class="size-3.5" width="14" height="14" />
		</a>
		{#each pre as label (label)}
			<span class="bg-base-200/90 text-base-content/75 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase"
				>{label}</span
			>
		{/each}
		<span id="{fieldId}-label" class="text-primary font-mono text-sm font-semibold tracking-tight">
			{name}
		</span>
		{#each post as label (label)}
			<span class="bg-base-200/90 text-base-content/75 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase"
				>{label}</span
			>
		{/each}
		<span
			class="bg-base-200/90 text-base-content/80 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium"
			>{typeStr}</span
		>
		{#if required}
			<span
				class="bg-error/15 text-error rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
				>required</span
			>
		{/if}
		{#if deprecated}
			<span class="badge badge-warning badge-sm border-0 text-[0.65rem] font-semibold uppercase"
				>deprecated</span
			>
		{/if}
	</div>

	{#if children}
		<div
			class="prose prose-sm mt-2.5 max-w-none text-base-content/85 prose-p:my-1 prose-p:text-base-content/85 prose-code:text-base-content prose-strong:text-base-content [&_a]:text-primary"
		>
			{@render children()}
		</div>
	{:else if descriptionText}
		<p class="text-base-content/75 mt-2.5 text-sm leading-relaxed">{descriptionText}</p>
	{/if}

	{#if defaultVal !== undefined}
		<p class="text-base-content/60 mt-2 font-mono text-xs">
			<span class="text-base-content/45">Default</span>
			<code class="bg-base-200/80 text-base-content rounded px-1.5 py-0.5">{formatDefault(defaultVal)}</code>
		</p>
	{/if}
</section>
