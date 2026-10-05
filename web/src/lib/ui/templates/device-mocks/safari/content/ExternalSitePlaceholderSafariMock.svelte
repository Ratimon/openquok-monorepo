<script lang="ts">
	const sidebarItems = ['Page settings', 'About', 'Contact', 'Links'];
	const contentLines = [
		'Page name',
		'Short description for visitors',
		'Website URL',
		'Category or industry'
	];
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#f5f5f7] text-base text-[#1d1d1f] dark:bg-[#1c1c1e] dark:text-[#f5f5f7]"
>
	<header class="border-b border-black/10 px-5 py-4 dark:border-white/10">
		<div class="h-3 w-32 rounded bg-black/10 dark:bg-white/15"></div>
		<div class="mt-3 h-2.5 w-48 rounded bg-black/5 dark:bg-white/10"></div>
	</header>

	<div class="flex min-h-0 flex-1">
		<nav
			class="w-[38%] shrink-0 border-r border-black/10 px-4 py-5 dark:border-white/10"
			aria-hidden="true"
		>
			<p class="mb-3 text-xs font-semibold uppercase tracking-wide text-black/45 dark:text-white/45">
				Settings
			</p>
			<ul class="space-y-2.5">
				{#each sidebarItems as item, index (item)}
					<li
						class="rounded-md px-2 py-1.5 {index === 0
							? 'bg-white font-medium shadow-sm dark:bg-white/10'
							: 'text-black/55 dark:text-white/55'}"
					>
						{item}
					</li>
				{/each}
			</ul>
		</nav>

		<div class="min-w-0 flex-1 px-5 py-5">
			<div class="mb-4 h-3 w-40 rounded bg-black/10 dark:bg-white/15"></div>
			<div class="space-y-3">
				{#each contentLines as line (line)}
					<div class="rounded-lg border border-black/8 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
						<span class="text-sm text-black/50 dark:text-white/50">{line}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
