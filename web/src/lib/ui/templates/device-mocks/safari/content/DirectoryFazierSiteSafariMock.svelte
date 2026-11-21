<script lang="ts">
	const fields = [
		'Product name',
		'Tagline',
		'Website',
		'Square logo',
		'Description',
		'Category'
	];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#fafafa] text-base text-neutral-900 dark:bg-[#0a0a0a] dark:text-neutral-100"
>
	<header class="border-b border-neutral-200 px-5 py-3 dark:border-neutral-700">
		<p class="text-sm font-semibold">Product launch</p>
		<p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">fazier.com/submit</p>
	</header>
	<div class="flex-1 space-y-3 px-5 py-4">
		{#each fields as field (field)}
			<div
				class="rounded-lg border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800/80"
			>
				<p class="text-[10px] font-medium uppercase tracking-wide text-neutral-400">{field}</p>
				<div class="mt-1.5 h-2 w-3/4 rounded bg-neutral-100 dark:bg-neutral-700"></div>
			</div>
		{/each}
		<p
			class="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-950 dark:text-amber-100"
		>
			Badge, comments, and paid checkout stay manual on Fazier — confirm your tier on fazier.com/launch.
		</p>
	</div>
</div>