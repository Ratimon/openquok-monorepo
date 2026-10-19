<script lang="ts">
	const fields = ['Product name', 'Tagline', 'Pricing', 'Maker name', 'Website'];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#fafafa] text-base text-neutral-900 dark:bg-[#171717] dark:text-neutral-100"
>
	<header class="border-b border-neutral-200 px-5 py-3 dark:border-neutral-700">
		<p class="text-sm font-semibold">Launch on Uneed</p>
		<p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">uneed.best</p>
	</header>
	<div class="flex-1 space-y-3 px-5 py-4">
		{#each fields as field (field)}
			<div
				class="rounded-lg border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800/80"
			>
				<p class="text-[10px] font-medium uppercase tracking-wide text-neutral-400">{field}</p>
				<div class="mt-1.5 h-2 w-2/3 rounded bg-neutral-100 dark:bg-neutral-700"></div>
			</div>
		{/each}
		<p
			class="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs leading-relaxed text-sky-950 dark:text-sky-100"
		>
			Backlink and listing rules depend on the Uneed flow you pick — read them on uneed.best first.
		</p>
	</div>
</div>
