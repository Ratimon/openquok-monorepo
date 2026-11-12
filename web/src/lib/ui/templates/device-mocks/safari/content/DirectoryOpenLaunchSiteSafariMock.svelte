<script lang="ts">
	const fields = [
		'Project name',
		'Website URL',
		'Short description',
		'Categories',
		'Tech stack',
		'Platforms'
	];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#fafafa] text-base text-neutral-900 dark:bg-[#0a0a0a] dark:text-neutral-100"
>
	<header class="border-b border-neutral-200 px-5 py-3 dark:border-neutral-700">
		<p class="text-sm font-semibold">Submit your project</p>
		<p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">open-launch.com</p>
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
			class="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs leading-relaxed text-violet-950 dark:text-violet-100"
		>
			Listing policy: confirm dofollow and launch slot rules on Open Launch before you submit.
		</p>
	</div>
</div>
