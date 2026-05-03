<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ImageWithFallback from '$lib/ui/media-files/ImageWithFallback.svelte';

	let { row }: ICellProps = $props();
</script>

<div class="flex min-w-0 items-center gap-2">
	<div class="relative h-9 w-9 shrink-0">
		<ImageWithFallback
			src={(row as { channelPicture?: string | null }).channelPicture ?? ''}
			alt=""
			fallbackIcon={icons.User1.name}
			class="border-base-300 h-9 w-9 rounded-full border object-cover"
		/>
		<span
			class="border-base-300 bg-base-100 absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full border shadow-sm ring-2 ring-base-100"
			aria-hidden="true"
		>
			<AbstractIcon
				name={socialProviderIcon(String((row as { platformKey?: string }).platformKey ?? ''))}
				class="text-base-content size-3"
				width="12"
				height="12"
			/>
		</span>
	</div>
	<span class="truncate text-sm font-medium text-base-content">
		{(row as { channelName?: string }).channelName ?? '—'}
	</span>
</div>
