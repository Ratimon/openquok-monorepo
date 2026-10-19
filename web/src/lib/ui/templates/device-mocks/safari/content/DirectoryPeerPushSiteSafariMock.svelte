<script lang="ts">
	const fields = ['Product name', 'Tagline', 'Website', 'Categories', 'Logo'];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#f8fafc] text-base text-slate-900 dark:bg-[#0f172a] dark:text-slate-100"
>
	<header class="border-b border-slate-200/80 px-5 py-3 dark:border-slate-700">
		<p class="text-sm font-semibold">Submit your product</p>
		<p class="mt-1 text-xs text-slate-500 dark:text-slate-400">peerpush.com</p>
	</header>
	<div class="flex-1 space-y-3 px-5 py-4">
		{#each fields as field (field)}
			<div class="rounded-lg border border-slate-200/90 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800/80">
				<p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">{field}</p>
				<div class="mt-1.5 h-2 w-3/4 rounded bg-slate-100 dark:bg-slate-700"></div>
			</div>
		{/each}
		<p
			class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs leading-relaxed text-emerald-900 dark:text-emerald-100"
		>
			Listing policy: confirm dofollow and eligibility on PeerPush before you submit.
		</p>
	</div>
</div>
