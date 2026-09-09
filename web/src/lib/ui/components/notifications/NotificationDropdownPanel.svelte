<script lang="ts">
	import type { NotificationItemViewModel } from '$lib/notifications/GetNotification.presenter.svelte';

	import NotificationDropdownPagination from '$lib/ui/components/notifications/NotificationDropdownPagination.svelte';

	const URL_IN_TEXT = /(https?:\/\/[^\s<]+)/i;

	function splitFirstUrl(raw: string): { text: string; url: string | null } {
		const s = String(raw ?? '');
		const m = URL_IN_TEXT.exec(s);
		if (!m?.[0]) return { text: s, url: null };
		const url = m[0];
		const text = s.replace(url, '').replace(/\s{2,}/g, ' ').trim();
		return { text, url };
	}

	function prettyUrl(raw: string): string {
		try {
			const u = new URL(raw);
			const p = u.pathname.length > 42 ? `${u.pathname.slice(0, 39)}…` : u.pathname;
			return `${u.host}${p}${u.search ? `?…` : ''}`;
		} catch {
			return raw.length > 60 ? `${raw.slice(0, 57)}…` : raw;
		}
	}

	type Props = {
		previewItemsVm: NotificationItemViewModel[];
		previewLoading: boolean;
		previewEmptyMessage: string | null;
		totalItems: number;
		currentPage: number;
		itemsPerPage: number;
		totalPages: number;
		setCurrentPage: (page: number) => void;
		setItemsPerPage: (size: number) => void;
		paginateToFirstPage: () => void;
		paginateToLastPage: () => void;
		footerHref?: string;
		footerLabel?: string;
	};

	let {
		previewItemsVm,
		previewLoading,
		previewEmptyMessage,
		totalItems,
		currentPage,
		itemsPerPage,
		totalPages,
		setCurrentPage,
		setItemsPerPage,
		paginateToFirstPage,
		paginateToLastPage,
		footerHref,
		footerLabel = 'View all notifications'
	}: Props = $props();
</script>

<div class="flex min-h-0 flex-1 flex-col overflow-hidden">
	<div class="min-h-0 flex-1 overflow-y-auto px-3 py-2">
		{#if previewLoading}
			<p class="px-1 py-3 text-sm text-base-content/60">Loading…</p>
		{:else if previewEmptyMessage}
			<p class="px-1 py-3 text-sm text-base-content/70">{previewEmptyMessage}</p>
		{:else if previewItemsVm.length === 0}
			<p class="px-1 py-3 text-sm text-base-content/60">No notifications yet.</p>
		{:else}
			<ul class="flex flex-col gap-1.5">
				{#each previewItemsVm as row (row.id)}
					{@const parsed = splitFirstUrl(row.content)}
					<li
						class="rounded-md border border-base-300/80 bg-base-100 px-3 py-2.5 text-left text-sm text-base-content"
					>
						<time class="block text-[10px] text-base-content/50" datetime={row.createdAt}>
							{row.createdAtLabel}
						</time>
						<p class="mt-1 line-clamp-4 whitespace-pre-wrap text-xs leading-snug">
							{parsed.text || row.content}
						</p>
						{#if row.link || parsed.url}
							<a
								href={row.link ?? parsed.url ?? undefined}
								class="mt-1 block truncate text-xs font-medium text-primary underline-offset-2 hover:underline"
								title={row.link ?? parsed.url ?? undefined}
							>
								{prettyUrl(row.link ?? parsed.url ?? '')}
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<NotificationDropdownPagination
		{totalItems}
		{currentPage}
		{itemsPerPage}
		{totalPages}
		{setCurrentPage}
		{setItemsPerPage}
		{paginateToFirstPage}
		{paginateToLastPage}
	/>

	{#if footerHref}
		<div class="border-t border-base-300 bg-base-200/80 px-2 py-2">
			<a
				href={footerHref}
				class="block rounded-md px-2 py-2 text-center text-sm font-medium text-primary hover:bg-base-300/50"
			>
				{footerLabel}
			</a>
		</div>
	{/if}
</div>
