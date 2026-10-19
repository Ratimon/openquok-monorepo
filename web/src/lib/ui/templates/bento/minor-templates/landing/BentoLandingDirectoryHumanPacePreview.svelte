<script lang="ts">
	const sessions = [
		{ day: 'Mon', label: 'PeerPush', state: 'done' as const },
		{ day: 'Wed', label: 'Uneed', state: 'done' as const },
		{ day: 'Fri', label: 'Next directory', state: 'planned' as const }
	];
</script>

<div class="select-none bg-base-100 p-4 text-base-content sm:p-5">
	<p class="text-xs font-medium tracking-wide text-base-content/50 uppercase">Launch calendar</p>
	<p class="mt-1 text-sm font-semibold">A few listings per week — not thirty in one day</p>

	<ul class="mt-5 space-y-3">
		{#each sessions as session, index (session.day)}
			<li class="flex items-center gap-3">
				<div
					class="grid size-10 shrink-0 place-items-center rounded-lg border text-xs font-bold {session.state ===
					'done'
						? 'border-success/40 bg-success/10 text-success'
						: 'border-dashed border-base-content/25 text-base-content/50'}"
				>
					{session.day}
				</div>
				<div class="min-w-0 flex-1 rounded-lg border border-base-300/90 bg-base-200/30 px-3 py-2">
					<p class="text-sm font-medium">{session.label}</p>
					<p class="text-xs text-base-content/60">
						{session.state === 'done' ? 'Submitted this session' : 'Queued for your next session'}
					</p>
				</div>
				{#if index < sessions.length - 1}
					<span class="sr-only">then</span>
				{/if}
			</li>
		{/each}
	</ul>

	<p class="mt-4 text-center text-xs text-base-content/55">
		You choose when the next directory opens — OpenQuok does not blast a vendor queue.
	</p>
</div>
