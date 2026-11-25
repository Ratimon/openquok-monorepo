<script lang="ts">
	const fields = [
		'Name',
		'Tagline',
		'Description',
		'Website URL',
		'Logo',
		'Screenshots',
		'Categories',
		'Pricing type'
	];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-slate-950 text-base text-slate-100"
>
	<header class="border-b border-slate-800 px-5 py-3">
		<p class="text-sm font-semibold">Submit a new listing</p>
		<p class="mt-1 text-xs text-slate-400">nicklaunches.com</p>
	</header>
	<div class="flex-1 space-y-3 px-5 py-4">
		{#each fields as field (field)}
			<div class="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
				<p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">{field}</p>
				<div class="mt-1.5 h-2 w-3/4 rounded bg-slate-700"></div>
			</div>
		{/each}
		<p
			class="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs leading-relaxed text-violet-100"
		>
			Free path needs weekly upvotes and a live Featured badge. Plan selection on /submit/plan/ stays
			manual.
		</p>
	</div>
</div>