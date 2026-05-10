<script lang="ts">
	import { icons } from '$data/icons';
	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	

	let {
		method,
		serverDisplay,
		pathPattern,
		onTryIt,
		class: className = ''
	}: {
		method: string;
		/** Host + base path only, no scheme (e.g. `api.example.com/public/v1`). */
		serverDisplay: string;
		/** OpenAPI path template (e.g. `/find-slot/{id}`). */
		pathPattern: string;
		onTryIt: () => void | Promise<void>;
		class?: string;
	} = $props();

	let segments = $derived.by(() => {
		const p = pathPattern.trim();
		const inner = p.startsWith('/') ? p.slice(1) : p;
		return inner.length ? inner.split('/') : [];
	});

	function methodBadgeClass(m: string): string {
		switch (m.toUpperCase()) {
			case 'GET':
				return 'badge-success';
			case 'POST':
				return 'badge-info';
			case 'PUT':
			case 'PATCH':
				return 'badge-warning';
			case 'DELETE':
				return 'badge-error';
			default:
				return 'badge-ghost border-base-300/80';
		}
	}
</script>

<div
	class={cn(
		'border-base-300/80 bg-base-100 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2.5 shadow-sm ring-1 ring-base-300/25',
		className
	)}
>
	<div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
		<span class={cn('badge badge-sm font-bold uppercase', methodBadgeClass(method))}>{method}</span>
		<div
			class="text-base-content/90 flex min-w-0 flex-1 flex-wrap items-center gap-x-0.5 font-mono text-[13px] leading-snug tracking-tight"
			aria-label="Endpoint path"
		>
			<span class="text-base-content/85 shrink-0">{serverDisplay}</span>
			<span class="inline-flex shrink-0" aria-hidden="true">
				<AbstractIcon
					name={icons.ChevronsUpDown.name}
					class="text-base-content/35 size-3.5"
					width="14"
					height="14"
				/>
			</span>
			{#each segments as seg, i (i + seg)}
				<span class="text-base-content/45 shrink-0">/</span>
				{#if /^\{[^}]+\}$/.test(seg)}
					<span
						class="border-success/40 bg-success/12 text-success inline-flex max-w-full shrink items-center rounded-md border px-1.5 py-px text-[12px] font-semibold"
					>
						{seg}
					</span>
				{:else}
					<span class="min-w-0 shrink">{seg}</span>
				{/if}
			{/each}
		</div>
	</div>
	<button type="button" class="btn btn-success btn-sm shrink-0 gap-1 font-semibold" onclick={() => void onTryIt()}>
		Try it
		<svg class="size-3.5 shrink-0 opacity-95" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M8 5v14l11-7z" />
		</svg>
	</button>
</div>
