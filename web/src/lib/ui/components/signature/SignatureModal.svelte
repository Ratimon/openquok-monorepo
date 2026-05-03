<script lang="ts">
	import type { FetchSignaturesForComposerFn } from '$lib/signatures';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import { goto } from '$app/navigation';
	import { getRootPathAccount } from '$lib/area-protected';
	import { absoluteUrl, route } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	type Props = {
		open?: boolean;
		organizationId?: string | null;
		loadSignaturesVmForComposer?: FetchSignaturesForComposerFn;
		onInsertSignature?: (text: string) => void;
	};

	let {
		open = $bindable(false),
		organizationId = null,
		loadSignaturesVmForComposer = undefined,
		onInsertSignature = undefined
	}: Props = $props();

	let signatureBusy = $state(false);
	let signatures = $state<Array<{ id: string; title: string; content: string; isDefault: boolean }>>([]);

	let prevOpen = $state(false);

	$effect(() => {
		if (open && !prevOpen) {
			void loadSignaturesIfNeeded();
		}
		prevOpen = open;
	});

	async function loadSignaturesIfNeeded() {
		if (!organizationId?.trim()) return;
		const loader = loadSignaturesVmForComposer;
		if (!loader) {
			toast.error('Signatures could not be loaded.');
			return;
		}
		if (signatureBusy) return;
		signatureBusy = true;
		try {
			const res = await loader(organizationId.trim());
			if (res.ok) {
				signatures = res.items;
			} else {
				toast.error(res.error);
			}
		} finally {
			signatureBusy = false;
		}
	}

	function insertSignature(text: string) {
		const trimmed = (text ?? '').trim();
		if (!trimmed) return;
		onInsertSignature?.(trimmed);
		open = false;
	}

	function openSignaturesSettings() {
		open = false;
		void goto(absoluteUrl(`${route(getRootPathAccount())}/settings?section=signature`));
	}

	function close() {
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="flex max-h-[min(85vh,520px)] w-[min(100vw-1rem,400px)] max-w-[min(100vw-1rem,400px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(100vw-1rem,400px)]"
		showCloseButton={true}
	>
		<Dialog.Header class="border-base-300 shrink-0 border-b px-4 py-3 sm:px-6">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0 flex-1">
					<Dialog.Title class="flex items-center gap-2 text-base font-semibold text-base-content">
						<AbstractIcon name={icons.Hash.name} class="size-5" width="20" height="20" />
						Signatures
					</Dialog.Title>
					<Dialog.Description class="mt-1 text-xs leading-snug text-base-content/70">
						Pre-write a snippet eg. hashtags, sign-offs, or other text you use often.
					</Dialog.Description>
				</div>
				{#if signatureBusy}
					<span class="loading loading-spinner loading-sm shrink-0 text-primary"></span>
				{/if}
			</div>
		</Dialog.Header>

		<div class="max-h-[min(55vh,320px)] min-h-0 overflow-y-auto px-4 py-3 sm:px-6">
			{#if !organizationId?.trim()}
				<div class="rounded-md border border-base-300 bg-base-100 p-3 text-sm text-base-content/70">
					Select a workspace to load signatures.
				</div>
			{:else if signatures.length === 0 && !signatureBusy}
				<div class="flex flex-col gap-2 rounded-md border border-base-300 bg-base-100 p-3 text-sm text-base-content/70">
					<p>
						No signatures for this workspace yet.</p>
					<Button type="button" variant="primary" size="sm" class="w-full" onclick={openSignaturesSettings}>
						Open Signatures settings
					</Button>
				</div>
			{:else}
				<div class="flex flex-col gap-2">
					{#each signatures as s (s.id)}
						<button
							type="button"
							class="w-full rounded-md border border-base-300 bg-base-100 px-3 py-2 text-start hover:bg-base-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
							onclick={() => insertSignature(s.content)}
						>
							<div class="flex items-center justify-between gap-2">
								<div class="truncate text-sm font-medium text-base-content">
									{s.title}</div>
								{#if s.isDefault}
									<span class="badge badge-sm badge-primary">Default</span>
								{/if}
							</div>
							<div class="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-base-content/60">
								{s.content}
							</div>
						</button>
					{/each}
					<Button
						type="button"
						variant="outline"
						size="sm"
						class="w-full shrink-0"
						onclick={openSignaturesSettings}
					>
						Manage signatures
					</Button>
				</div>
			{/if}
		</div>

		<div class="border-base-300 flex shrink-0 justify-end border-t px-4 py-3 sm:px-6">
			<Button type="button" variant="ghost" onclick={close}>
				Close</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
