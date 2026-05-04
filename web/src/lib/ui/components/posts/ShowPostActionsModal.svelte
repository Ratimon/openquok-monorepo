<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import type { PostGroupDetailsViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';

	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';
	import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Dialog from '$lib/ui/dialog';

	export type Props = {
		open: boolean;
		postGroup: string | null;
		/** Prefer this post row for Preview / Statistics when the group has multiple channels. */
		focusPostId?: string | null;
		/** When set with a multi-channel group, header shows this channel only and body uses `bodiesByIntegrationId`. */
		focusIntegrationId?: string | null;
		busy: boolean;
		channels: readonly CreateSocialPostChannelViewModel[];
		loadPostGroup: (
			postGroup: string
		) => Promise<
			{ ok: true; group: PostGroupDetailsViewModel } | { ok: false; error: string }
		>;
		onClose: () => void;
		onEdit: (postGroup: string) => void;
		onDuplicate: (postGroup: string) => void;
		onCopy: () => Promise<void> | void;
		onDelete: () => Promise<void> | void;
		onPreview?: () => void;
		onStatistics?: (postId: string) => void;
	};

	let {
		open,
		postGroup,
		focusPostId = null,
		focusIntegrationId = null,
		busy,
		channels,
		loadPostGroup,
		onClose,
		onEdit,
		onDuplicate,
		onCopy,
		onDelete,
		onPreview,
		onStatistics
	}: Props = $props();

	type HeaderChannelVm = {
		integrationId: string;
		channelPicture?: string;
		channelName?: string;
		channelIdentifier?: string;
	};

	let headerLoading = $state(false);
	let headerError = $state<string | null>(null);
	let summary = $state<{
		publishDateIso?: string;
		status?: string;
		content?: string;
		/** One entry per scheduled row / integration in the group (multi-channel). */
		channels: HeaderChannelVm[];
	} | null>(null);
	/** First row id in the group — used for per-post analytics APIs. */
	let firstPostId = $state<string | null>(null);
	let loadToken = 0;

	function formatLocalDateTime(iso: string | undefined): { date: string; time: string } {
		if (!iso) return { date: '', time: '' };
		const ms = Date.parse(iso);
		if (!Number.isFinite(ms)) return { date: '', time: '' };
		const d = new Date(ms);
		return {
			date: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
			time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		};
	}

	function resetHeaderState(): void {
		headerLoading = false;
		headerError = null;
		summary = null;
		firstPostId = null;
	}

	$effect(() => {
		if (!open) {
			resetHeaderState();
			return;
		}
		const pg = postGroup;
		if (!pg) {
			resetHeaderState();
			return;
		}

		const token = ++loadToken;
		headerLoading = true;
		headerError = null;
		summary = null;
		firstPostId = null;

		void (async () => {
			try {
				const resultVm = await loadPostGroup(pg);
				if (token !== loadToken) return;
				if (!resultVm.ok) {
					headerError = resultVm.error;
					firstPostId = null;
					return;
				}
				const g = resultVm.group;
				const ids = Array.isArray(g.integrationIds) ? [...new Set(g.integrationIds.filter(Boolean))] : [];
				const strip: HeaderChannelVm[] = ids.map((integrationId) => {
					const ch = channels.find((x: CreateSocialPostChannelViewModel) => x.id === integrationId);
					return {
						integrationId,
						channelPicture: ch?.picture ?? undefined,
						channelName: ch?.name ?? undefined,
						channelIdentifier: ch?.identifier ?? undefined
					};
				});
				const postIdsRaw = Array.isArray(g.postIds) ? g.postIds.filter(Boolean) : [];
				const integrationIdsRaw = Array.isArray(g.integrationIds) ? g.integrationIds.filter(Boolean) : [];
				const focusPid = String(focusPostId ?? '').trim();
				let focusInt = String(focusIntegrationId ?? '').trim();
				if (!focusInt && focusPid && postIdsRaw.length === integrationIdsRaw.length) {
					const ix = postIdsRaw.indexOf(focusPid);
					if (ix >= 0) focusInt = String(integrationIdsRaw[ix] ?? '').trim();
				}
				firstPostId =
					focusPid && postIdsRaw.includes(focusPid)
						? focusPid
						: (postIdsRaw[0] ?? (focusPid || null));

				let headerChannels = strip;
				if (focusInt) {
					const one = strip.filter((c) => c.integrationId === focusInt);
					if (one.length) headerChannels = one;
				}

				const bodies = g.bodiesByIntegrationId ?? {};
				const bodyText =
					focusInt && Object.prototype.hasOwnProperty.call(bodies, focusInt)
						? String(bodies[focusInt] ?? '')
						: String(g.body ?? '');
				summary = {
					publishDateIso: g.publishDateIso ?? undefined,
					status: g.status ? String(g.status).toUpperCase() : undefined,
					content: stripHtmlToPlainText(bodyText).trim(),
					channels: headerChannels.length ? headerChannels : []
				};
			} finally {
				if (token === loadToken) headerLoading = false;
			}
		})();
	});

</script>

<Dialog.Root bind:open onOpenChange={(o) => (!o ? onClose() : null)}>
	<Dialog.Content class="max-w-sm p-0" showCloseButton={true}>
		<div class="border-b border-base-300 px-4 py-3">
			<div class="text-base font-semibold text-base-content">
				Post actions</div>

			{#if headerLoading}
				<div class="mt-2 flex items-center gap-2 text-xs text-base-content/60">
					<AbstractIcon name={icons.LoaderCircle.name} class="h-3.5 w-3.5 animate-spin" width="14" height="14" />
					Loading post…
				</div>
			{:else if headerError}
				<div class="mt-2 text-xs text-error">
					{headerError}</div>
			{:else if summary}
				{@const dt = formatLocalDateTime(summary.publishDateIso)}
				{@const chs = summary.channels ?? []}
				{@const maxAvatars = 4}
				{@const visibleChs = chs.slice(0, maxAvatars)}
				{@const overflow = Math.max(0, chs.length - visibleChs.length)}
				<div class="mt-2 flex items-start gap-3">
					<div class="flex shrink-0 items-center">
						<div class="flex shrink-0 -space-x-2">
							{#each visibleChs.length ? visibleChs : [{ integrationId: '_', channelPicture: undefined, channelName: undefined, channelIdentifier: undefined }] as ch, i (ch.integrationId)}
								{@const iconName = socialProviderIcon(ch.channelIdentifier)}
								<div
									class="relative h-9 w-9 shrink-0 rounded-md ring-2 ring-base-100"
									style={`z-index:${10 - i}`}
								>
									{#if ch.channelPicture}
										<img src={ch.channelPicture} alt="" class="h-9 w-9 rounded-md object-cover" />
									{:else}
										<div
											class="flex h-9 w-9 items-center justify-center rounded-md bg-base-200 text-[10px] font-semibold text-base-content/60"
										>
											{(ch.channelName || 'CH').slice(0, 2).toUpperCase()}
										</div>
									{/if}
									{#if ch.channelIdentifier}
										<span
											class="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-base-100 text-base-content shadow-sm ring-1 ring-base-300"
											aria-hidden="true"
										>
											<AbstractIcon name={iconName} class="size-3.5" width="14" height="14" />
										</span>
									{/if}
								</div>
							{/each}
						</div>
						{#if overflow > 0}
							<div
								class="z-[20] -ml-1 flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md bg-base-200 px-1.5 text-[11px] font-semibold text-base-content/80 ring-2 ring-base-100"
								title={`${overflow} more channel${overflow === 1 ? '' : 's'}`}
							>
								+{overflow}
							</div>
						{/if}
					</div>

					<div class="min-w-0 flex-1">
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0">
								<div class="text-xs font-semibold text-base-content/70">
									{#if chs.length <= 1}
										<div class="truncate">{chs[0]?.channelName || 'Channel'}</div>
									{:else}
										<div class="line-clamp-2 leading-snug">
											{chs
												.map((c) => c.channelName || c.channelIdentifier || 'Channel')
												.join(' · ')}
										</div>
									{/if}
								</div>
								<div class="mt-0.5 text-xs text-base-content/55">
									{#if dt.date || dt.time}
										{dt.date}{dt.time ? ` · ${dt.time}` : ''}
									{:else}
										Draft
									{/if}
								</div>
							</div>
							{#if summary.status}
								<div class="shrink-0 rounded bg-base-200 px-2 py-0.5 text-[11px] font-semibold text-base-content/70">
									{summary.status}
								</div>
							{/if}
						</div>
						<div class="mt-2 line-clamp-2 text-sm font-medium leading-snug text-base-content/90">
							{summary.content || 'No content'}
						</div>
					</div>
				</div>
			{/if}
		</div>

		<div class="p-2">
			<button
				type="button"
				class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none disabled:opacity-50"
				disabled={busy || !postGroup}
				onclick={() => {
					const pg = postGroup;
					if (!pg) return;
					onClose();
					onEdit(pg);
				}}
			>
				<AbstractIcon name={icons.Pencil.name} class="size-4 shrink-0" width="16" height="16" />
				Edit
			</button>

			<button
				type="button"
				class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none disabled:opacity-50"
				disabled={busy || !postGroup}
				title="Duplicate Post"
				aria-label="Duplicate Post"
				onclick={() => {
					const pg = postGroup;
					if (!pg) return;
					onClose();
					onDuplicate(pg);
				}}
			>
				<AbstractIcon name={icons.Copy.name} class="size-4 shrink-0" width="16" height="16" />
				Duplicate
			</button>
            
			<button
				type="button"
				class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none disabled:opacity-50"
				disabled={busy || !postGroup}
				title="Export & Debug as JSON"
				aria-label="Export & Debug as JSON"
				onclick={() => void onCopy()}
			>
				<AbstractIcon name={icons.Braces.name} class="size-4 shrink-0" width="16" height="16" />
				Export & debug as JSON
			</button>

			<button
				type="button"
				class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none disabled:opacity-50"
				disabled={busy}
				onclick={() => onPreview?.()}
			>
				<AbstractIcon name={icons.Eye.name} class="size-4 shrink-0" width="16" height="16" />
				Preview
			</button>

			<button
				type="button"
				class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none disabled:opacity-50"
				disabled={busy || !firstPostId}
				onclick={() => {
					const id = firstPostId;
					if (!id) return;
					onClose();
					onStatistics?.(id);
				}}
			>
				<AbstractIcon name={icons.ChartBar.name} class="size-4 shrink-0" width="16" height="16" />
				Statistics
			</button>

			<div class="bg-base-300 my-2 h-px w-full"></div>

			<button
				type="button"
				class="hover:bg-error/10 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start text-error outline-none disabled:opacity-50"
				disabled={busy || !postGroup}
				onclick={() => void onDelete()}
			>
				<AbstractIcon name={icons.Trash.name} class="size-4 shrink-0" width="16" height="16" />
				Delete
			</button>
		</div>
	</Dialog.Content>
</Dialog.Root>

