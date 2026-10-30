<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
</script>

<div class="grid min-h-[320px] grid-cols-1 divide-y divide-base-300 bg-base-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
	<div class="p-4">
		<p class="text-xs font-semibold tracking-wide text-base-content/50 uppercase">Directory</p>
		<p class="mt-2 text-sm font-medium">Autofill from My Products</p>
		<p class="mt-1 text-xs text-base-content/65">PeerPush · Uneed</p>
		<span class="badge badge-success badge-outline badge-sm mt-3">Autofilled fields</span>
	</div>
	<div class="p-4">
		<div class="flex items-center gap-2">
			<AbstractIcon name={icons.Reddit.name} width="16" height="16" class="size-4 text-orange-500" />
			<p class="text-xs font-semibold tracking-wide text-base-content/50 uppercase">Reddit handoff</p>
		</div>
		<p class="mt-2 text-sm font-medium">Due on reddit.com</p>
		<div class="mt-3 flex flex-wrap gap-1.5">
			<span class="btn btn-outline btn-xs pointer-events-none">Copy</span>
			<span class="btn btn-outline btn-xs pointer-events-none">Open submit</span>
			<span class="btn btn-primary btn-xs pointer-events-none">Mark posted</span>
		</div>
	</div>
</div>
