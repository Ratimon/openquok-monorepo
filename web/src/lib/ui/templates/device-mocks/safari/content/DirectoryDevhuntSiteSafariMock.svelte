<script lang="ts">
	const fields = [
		'Tool name',
		'Catchy slogan',
		'Tool website URL',
		'Quick description',
		'Logo',
		'Tool screenshots',
		'GitHub repo URL'
	];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-slate-900 text-base text-slate-100"
>
	<header class="border-b border-slate-700 px-5 py-3">
		<p class="text-sm font-semibold">Submit a new tool</p>
		<p class="mt-1 text-xs text-slate-400">devhunt.org</p>
	</header>
	<div class="flex-1 space-y-3 px-5 py-4">
		{#each fields as field (field)}
			<div class="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2">
				<p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">{field}</p>
				<div class="mt-1.5 h-2 w-3/4 rounded bg-slate-700"></div>
			</div>
		{/each}
		<p
			class="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100"
		>
			Free listing uses a nofollow link. Paid launch week and $49 checkout stay manual on DevHunt.
		</p>
	</div>
</div>