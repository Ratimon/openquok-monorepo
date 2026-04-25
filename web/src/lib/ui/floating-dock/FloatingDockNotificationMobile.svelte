<script lang="ts">
	import type { DockItem } from '$lib/ui/floating-dock/types';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import NotificationDropdownPanel from '$lib/ui/components/notifications/NotificationDropdownPanel.svelte';
	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';

	type Props = {
		item: DockItem;
	};

	let { item }: Props = $props();

	const preview = $derived(item.notificationsPreview);
	let open = $state(false);

	function handleOpenChange(next: boolean) {
		if (next && preview) {
			void preview.onOpen();
		}
	}
</script>

{#if preview}
	<DropdownMenu.Root bind:open onOpenChange={handleOpenChange}>
		<DropdownMenu.Trigger
			title={item.title}
			aria-label={item.ariaLabel ?? item.title}
			class="relative flex h-10 w-10 items-center justify-center rounded-full bg-base-200 text-base-content/70 outline-none"
		>
			<AbstractIcon
				name={item.iconName}
				width="16"
				height="16"
				class="size-full"
				focusable="false"
			/>
			{#if item.badge != null && item.badge > 0}
				<span
					class="pointer-events-none absolute -right-1 -top-1 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-none text-primary-content"
					aria-hidden="true"
				>
					{item.badge > 99 ? '99+' : String(item.badge)}
				</span>
			{/if}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content
			class="flex max-h-[min(70vh,24rem)] w-[min(100vw-2rem,22rem)] flex-col gap-0 overflow-hidden p-0"
			align="center"
			side="top"
			sideOffset={8}
		>
			<NotificationDropdownPanel
				previewItemsVm={preview.items}
				previewLoading={preview.loading}
				previewEmptyMessage={preview.emptyMessage}
				footerHref={preview.footerHref}
				footerLabel={preview.footerLabel}
			/>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
