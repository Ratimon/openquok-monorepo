<script lang="ts">
	const fields = ['Company name', 'Company domain', 'Describe your company', 'Logo'];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-slate-950 text-base text-slate-100"
>
	<header class="border-b border-slate-800 px-5 py-3">
		<p class="text-sm font-semibold">Company settings</p>
		<p class="mt-1 text-xs text-slate-400">businessapp.b2b.trustpilot.com</p>
	</header>
	<div class="flex-1 space-y-3 px-5 py-4">
		{#each fields as field (field)}
			<div class="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
				<p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">{field}</p>
				<div class="mt-1.5 h-2 w-3/4 rounded bg-slate-700"></div>
			</div>
		{/each}
		<p
			class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs leading-relaxed text-emerald-100"
		>
			OpenQuok autofills company settings. Contact info, business email verification, and Save and
			publish stay on Trustpilot Business.
		</p>
	</div>
</div>