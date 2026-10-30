<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
</script>

<div class="select-none bg-base-100 text-base-content">
	<div
		class="flex items-center gap-2 border-b border-base-300 bg-base-200/60 px-3 py-2"
		aria-hidden="true"
	>
		<AbstractIcon name={icons.Reddit.name} class="size-4 text-orange-500" width="16" height="16" />
		<p class="truncate text-xs text-base-content/70">OpenQuok extension · Social</p>
	</div>

	<div class="p-4 sm:p-5">
		<div class="rounded-xl border border-base-300 bg-base-200/40 p-4 shadow-sm">
			<p class="text-sm font-semibold">Reddit — action needed</p>
			<p class="mt-2 text-xs leading-relaxed text-base-content/65">
				Due on reddit.com: copy caption, open submit (or autofill), download attached media if
				needed, post manually, then mark complete.
			</p>

			<ul class="mt-4 flex list-none flex-col gap-3 p-0">
				<li class="rounded-lg border border-base-300 bg-base-100 p-3">
					<div class="flex flex-col gap-1">
						<strong class="text-sm leading-snug">What we shipped this week</strong>
						<span class="text-xs text-base-content/60">r/buildinpublic</span>
						<span class="text-xs text-base-content/55 line-clamp-2">
							We fixed the handoff flow and added markdown drafts on the calendar — you still click
							Post on Reddit yourself.
						</span>
						<span class="text-[11px] text-base-content/50">Oct 28, 9:00 AM · Reddit</span>
					</div>
					<div class="mt-3 flex flex-wrap gap-1.5">
						<span class="btn btn-outline btn-xs pointer-events-none">Copy</span>
						<span class="btn btn-outline btn-xs pointer-events-none">Open submit</span>
						<span class="btn btn-outline btn-xs pointer-events-none">Autofill</span>
						<span class="btn btn-outline btn-xs pointer-events-none">Download media</span>
						<span class="btn btn-primary btn-xs pointer-events-none">Mark posted</span>
					</div>
				</li>
			</ul>
		</div>
	</div>
</div>
