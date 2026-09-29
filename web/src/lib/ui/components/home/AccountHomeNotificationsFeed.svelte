<script lang="ts">
	import type { DockNotificationsPreview } from '$lib/ui/floating-dock/types';

	import { untrack } from 'svelte';

	import NotificationDropdownPanel from '$lib/ui/components/notifications/NotificationDropdownPanel.svelte';

	type Props = {
		preview: DockNotificationsPreview;
		/** When true, loads the paginated preview (same as opening the header bell). */
		active?: boolean;
	};

	let { preview, active = false }: Props = $props();

	$effect(() => {
		if (!active) return;
		untrack(() => {
			void preview.onOpen();
		});
	});
</script>

<div
	class="flex min-h-[min(50vh,28rem)] flex-col overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm"
>
	<div class="border-b border-base-300 px-4 py-3">
		<h2 class="text-sm font-semibold text-base-content">Feed</h2>
		<p class="mt-0.5 text-xs text-base-content/60">
			Workspace notifications — same list as the bell in the header dock.
		</p>
	</div>
	<div class="flex min-h-0 flex-1 flex-col">
		<NotificationDropdownPanel
			previewItemsVm={preview.items}
			previewLoading={preview.loading}
			previewEmptyMessage={preview.emptyMessage}
			totalItems={preview.total}
			currentPage={preview.currentPage}
			itemsPerPage={preview.itemsPerPage}
			totalPages={preview.totalPages}
			setCurrentPage={preview.setCurrentPage}
			setItemsPerPage={preview.setItemsPerPage}
			paginateToFirstPage={preview.paginateToFirstPage}
			paginateToLastPage={preview.paginateToLastPage}
			footerHref={preview.footerHref}
			footerLabel={preview.footerLabel}
		/>
	</div>
</div>
