<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import type { PlugRuleTableRowViewModel } from '$lib/plugs/GetPlug.presenter.svelte';
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ImageWithFallback from '$lib/ui/media-files/ImageWithFallback.svelte';

	let { row }: ICellProps = $props();

	const vm = $derived(row as unknown as PlugRuleTableRowViewModel);
</script>

<div class="flex min-w-0 items-start gap-1.5 py-0.5">
	<div class="relative h-8 w-8 shrink-0 rounded-md ring-2 ring-base-100">
		<ImageWithFallback
			src={vm.channelPicture ?? ''}
			alt=""
			fallbackIcon={icons.User1.name}
			class="border-base-300 h-8 w-8 rounded-md border object-cover"
		/>
		<span
			class="ring-base-100 absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full bg-base-100 text-base-content shadow-sm ring-1 ring-base-300"
			aria-hidden="true"
		>
			<AbstractIcon
				name={socialProviderIcon(String(vm.platformKey ?? ''))}
				class="size-3"
				width="12"
				height="12"
			/>
		</span>
	</div>
	<div class="text-base-content min-w-0 flex-1">
		<div class="truncate text-sm font-medium">
			{vm.channelName || '—'}
		</div>
		<div class="text-base-content/60 truncate text-xs">
			{vm.platformLabel || '—'}
		</div>
	</div>
</div>
