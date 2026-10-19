<script lang="ts">
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { LANDING_DIRECTORY_MOCK_TRACKING_ROWS } from '$lib/ui/templates/bento/minor-templates/landing/landingDirectoryProfileMock';
</script>

<div class="select-none bg-base-100 text-base-content">
	<div class="border-b border-base-300 px-4 py-3">
		<p class="text-xs font-medium tracking-wide text-base-content/50 uppercase">My Products</p>
		<p class="mt-1 text-sm font-semibold">Launch progress</p>
	</div>

	<ul class="space-y-2 p-4 sm:p-5">
		{#each LANDING_DIRECTORY_MOCK_TRACKING_ROWS as row (row.id)}
			<li class="rounded-xl border border-base-300/90 bg-base-200/25 px-3 py-3">
				<div class="flex items-start justify-between gap-3">
					<span class="flex min-w-0 items-center gap-2.5 text-sm font-medium">
						<AbstractIcon
							name={row.iconName}
							class="size-7 shrink-0"
							width="28"
							height="28"
							aria-hidden="true"
						/>
						{row.label}
					</span>
					<span
						class="badge shrink-0 text-[0.65rem] font-semibold {row.submitted
							? 'badge-success badge-outline'
							: 'badge-ghost'}"
					>
						{row.statusLabel}
					</span>
				</div>
				{#if row.listingUrl}
					<p class="mt-2 truncate text-xs text-primary">{row.listingUrl}</p>
				{:else}
					<p class="mt-2 text-xs text-base-content/55">Paste the live listing URL after submit</p>
				{/if}
			</li>
		{/each}
	</ul>
</div>
