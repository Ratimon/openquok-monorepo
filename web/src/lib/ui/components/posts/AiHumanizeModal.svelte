<script lang="ts">
	import type { HumanizePresenter } from '$lib/ai-humanize/Humanize.presenter.svelte';
	import type { HumanizeMode } from '$lib/ai-humanize/constants/config';

	import { untrack } from 'svelte';

	import {
		COMPOSER_HUMANIZE_LENGTH_SHORT_MAX_CHARS,
		HUMANIZE_API_DOCS_URL
	} from '$lib/ai-humanize/constants/config';
	import {
		detectHumanizeUiLocale,
		humanizeModeOptionsFor,
		humanizeUiCopyFor
	} from '$lib/ai-humanize/utils/uiLocale';
	import { formatWriterProviderConstraintTooltip } from '$lib/ai-writer/utils';
	import { socialProviderIcon } from '$data/social-providers';
	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';
	import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import ComposerMediaTooltip from '$lib/ui/components/posts/ComposerMediaTooltip.svelte';
	import { Shimmer } from '$lib/ui/components/ai-elements/shimmer';
	import * as Dialog from '$lib/ui/dialog';
	import DeleteModal from '$lib/ui/modals/DeleteModal.svelte';
	import * as Tooltip from '$lib/ui/tooltip';

	type Props = {
		humanizePresenter: HumanizePresenter;
		open?: boolean;
		existingBody?: string;
		softCharLimit?: number;
		composerMode?: 'global' | 'custom';
		focusedProviderIdentifier?: string | null;
		constraintProviderIdentifiers?: readonly string[];
		onReplaceBody?: (text: string) => void;
	};

	let {
		humanizePresenter,
		open = $bindable(false),
		existingBody = '',
		softCharLimit = COMPOSER_HUMANIZE_LENGTH_SHORT_MAX_CHARS,
		composerMode = 'global',
		focusedProviderIdentifier = null,
		constraintProviderIdentifiers = [],
		onReplaceBody = undefined
	}: Props = $props();

	let replaceConfirmOpen = $state(false);

	const phase = $derived(humanizePresenter.phase);
	const runStatus = $derived(humanizePresenter.runStatus);
	const rewriteText = $derived(humanizePresenter.rewriteText);
	const errorMessage = $derived(humanizePresenter.errorMessage);
	const downloadPercent = $derived(humanizePresenter.downloadPercent);
	const isBusy = $derived(humanizePresenter.isBusy);
	const canReplace = $derived(humanizePresenter.canReplace);
	const showDownloadBanner = $derived(humanizePresenter.showDownloadBanner);
	const rewriteLength = $derived(humanizePresenter.rewriteLength);
	const isOverLimit = $derived(humanizePresenter.isOverLimit);
	const maxCharacters = $derived(humanizePresenter.maxCharacters);
	const resolvedConstraintProviders = $derived(humanizePresenter.constraintProvidersVm);
	const mode = $derived(humanizePresenter.mode);
	const tellCountBefore = $derived(humanizePresenter.tellCountBefore);
	const tellCountAfter = $derived(humanizePresenter.tellCountAfter);
	const inventedSpecifics = $derived(humanizePresenter.inventedSpecifics);
	const rewriteSource = $derived(humanizePresenter.rewriteSource);
	const sourceAudit = $derived(humanizePresenter.sourceAudit);
	const rewriteAudit = $derived(humanizePresenter.rewriteAudit);

	const sourcePlainText = $derived(stripHtmlToPlainText(existingBody));
	const hasSource = $derived(sourcePlainText.length > 0);
	const showRewriteUi = $derived(phase === 'ready' || phase === 'unsupported');
	const showEmptyState = $derived(showRewriteUi && !hasSource);
	const localFallback = $derived(phase === 'unsupported' || rewriteSource === 'local');

	// Presentation-only locale: Thai browsers get Thai modal labels; the
	// rewrite behavior itself is decided per draft by detectHumanizeLocale.
	const uiLocale = $derived(detectHumanizeUiLocale());
	const modeOptions = $derived(humanizeModeOptionsFor(uiLocale));
	const uiCopy = $derived(humanizeUiCopyFor(uiLocale));
	const selectedModeOption = $derived(
		modeOptions.find((option) => option.id === mode) ?? modeOptions[0]
	);

	$effect(() => {
		if (!open) return;

		// Depend only on `open`. onOpen → refreshCreateCore reads/writes presenter $state;
		// tracking those would re-run this effect → cleanup resetUi → infinite loop.
		untrack(() => {
			const ids =
				constraintProviderIdentifiers.length > 0
					? [...constraintProviderIdentifiers]
					: focusedProviderIdentifier?.trim()
						? [focusedProviderIdentifier.trim()]
						: [];
			humanizePresenter.setDraftConstraints({
				maxCharacters: softCharLimit,
				providerIdentifiers: ids,
				providerIdentifier: ids[0] ?? focusedProviderIdentifier,
				composerMode
			});
			void humanizePresenter.onOpen();
		});

		return () => {
			humanizePresenter.teardown();
			humanizePresenter.resetUi();
		};
	});

	$effect(() => {
		const msg = humanizePresenter.pendingToastError;
		if (!msg) return;
		toast.error(msg);
		humanizePresenter.clearPendingToastError();
	});

	function close() {
		open = false;
	}

	async function acceptOptIn() {
		await humanizePresenter.acceptOptIn();
	}

	function stopGeneration() {
		humanizePresenter.stopGeneration();
	}

	function removeConstraint(identifier: string) {
		humanizePresenter.removeConstraintProvider(identifier);
	}

	function onModeChange(next: HumanizeMode) {
		if (isBusy || next === mode) return;
		humanizePresenter.setMode(next);
	}

	async function onRewrite() {
		if (!hasSource || isBusy) return;
		await humanizePresenter.runHumanize(sourcePlainText);
	}

	async function copyRewrite() {
		const text = rewriteText.trim();
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			toast.success('Rewrite copied to clipboard');
		} catch {
			toast.error('Could not copy rewrite.');
		}
	}

	function requestReplaceBody() {
		const text = rewriteText.trim();
		if (!text) return;
		replaceConfirmOpen = true;
	}

	function confirmReplaceBody() {
		const text = rewriteText.trim();
		replaceConfirmOpen = false;
		if (!text) return;
		onReplaceBody?.(text);
		open = false;
	}
</script>

{#snippet constraintStrip(compact: boolean)}
	<Tooltip.Provider delayDuration={200}>
		<div
			class="flex flex-col gap-1.5 {compact ? 'px-1 py-1.5' : 'px-2 py-2'}"
			role="status"
		>
			<p class="text-center text-[11px] font-semibold tracking-wide text-base-content/55 uppercase">
				Context
			</p>
			<div
				class="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs text-base-content/70"
			>
				{#if resolvedConstraintProviders.length === 0}
					<span class="text-base-content/55"
						>No channel constraints · up to {maxCharacters} characters</span
					>
				{:else}
					{#each resolvedConstraintProviders as provider, index (provider.identifier)}
						{@const constraintTooltip = formatWriterProviderConstraintTooltip(
							provider.identifier
						)}
						{#if index > 0}
							<span class="shrink-0 font-medium text-base-content/55">and</span>
						{/if}
						<span
							class="inline-flex items-center gap-0.5 rounded-md border border-base-300/80 bg-base-200/50 py-0.5 pr-0.5 pl-1.5 text-base-content/85"
						>
							<ComposerMediaTooltip label={constraintTooltip} side="top">
								{#snippet trigger({ props })}
									<span
										{...props}
										class="inline-flex size-5 items-center justify-center"
										aria-label={constraintTooltip}
									>
										<AbstractIcon
											name={socialProviderIcon(provider.identifier)}
											class="size-3.5 shrink-0"
											width="14"
											height="14"
											aria-hidden="true"
										/>
									</span>
								{/snippet}
							</ComposerMediaTooltip>
							<button
								type="button"
								class="text-base-content/50 hover:bg-base-300/60 hover:text-base-content inline-flex size-5 items-center justify-center rounded transition-colors"
								aria-label={`Remove ${provider.label} from context`}
								onclick={() => removeConstraint(provider.identifier)}
							>
								<AbstractIcon
									name={icons.X2.name}
									class="size-3"
									width="12"
									height="12"
									aria-hidden="true"
								/>
							</button>
						</span>
					{/each}
					<span class="shrink-0 tabular-nums text-base-content/55"
						>· up to {maxCharacters} characters</span
					>
				{/if}
			</div>
		</div>
	</Tooltip.Provider>
{/snippet}

<Dialog.Root bind:open>
	<Dialog.Content
		class="flex max-h-[min(90vh,640px)] w-[min(100vw-1rem,560px)] max-w-[min(100vw-1rem,560px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(100vw-1rem,560px)]"
		showCloseButton={true}
	>
		<Dialog.Header class="border-base-300 shrink-0 border-b px-4 py-3 sm:px-6">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0 flex-1">
					<Dialog.Title class="flex items-center gap-2 text-base font-semibold text-base-content">
						<AbstractIcon name={icons.UserRoundPen.name} class="size-5" width="20" height="20" />
						Sound more human
					</Dialog.Title>
					<Dialog.Description class="mt-1 text-xs leading-snug text-base-content/70">
						{#if phase === 'opt-in'}
							On-device rewrite with Chrome's Rewriter API — review before continuing.
						{:else if showEmptyState}
							Add post text in the composer, then open Sound more human again.
						{:else}
							{selectedModeOption.description}
						{/if}
					</Dialog.Description>
				</div>
				{#if phase === 'resolving' || runStatus === 'submitted' || runStatus === 'streaming'}
					<span class="loading loading-spinner loading-sm shrink-0 text-primary"></span>
				{/if}
			</div>
		</Dialog.Header>

		{#if phase === 'opt-in'}
			<div class="flex min-h-[220px] flex-col gap-3 px-4 py-4 sm:px-6">
				<div class="rounded-md border border-base-300 bg-base-100 p-3 text-sm text-base-content/80">
					<p class="font-medium text-base-content">
						Use Sound more human on this device?
					</p>
					<p class="mt-2 text-base-content/70">
						Sound more human uses Chrome's on-device Rewriter API. Your post text stays on this
						device.
					</p>
					<p class="mt-2 text-base-content/70">
						The first time you use it, Chrome may download an on-device model. That download and
						all rewriting run locally in your browser.
					</p>
				</div>
			</div>
			<div class="border-base-300 flex shrink-0 justify-end gap-2 border-t px-4 py-3 sm:px-6">
				<Button type="button" variant="ghost" onclick={close}>
					Not now
				</Button>
				<Button type="button" variant="primary" onclick={acceptOptIn}>
					Continue
				</Button>
			</div>
		{:else if phase === 'resolving'}
			<div class="flex min-h-[220px] items-center justify-center px-4 py-8 sm:px-6">
				<p class="text-sm text-base-content/70">
					Checking Rewriter support…
				</p>
			</div>
		{:else if showEmptyState}
			<div class="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-8 sm:px-6">
				<AbstractIcon
					name={icons.UserRoundPen.name}
					class="size-8 text-base-content/40"
					width="32"
					height="32"
				/>
				<p class="text-center text-sm font-medium text-base-content">
					Nothing to rewrite
				</p>
				<p class="max-w-sm text-center text-xs text-base-content/70">
					Write or paste post text in the composer first, then open Sound more human again.
				</p>
			</div>
			<div class="border-base-300 flex shrink-0 justify-end border-t px-4 py-3 sm:px-6">
				<Button type="button" variant="ghost" onclick={close}>
					Close
				</Button>
			</div>
		{:else}
			<div class="flex min-h-0 flex-1 flex-col">
				{#if showDownloadBanner}
					<div
						class="border-base-300 bg-base-200/60 flex shrink-0 items-center gap-2 border-b px-4 py-2 text-xs text-base-content/70 sm:px-6"
						role="status"
					>
						<span class="loading loading-spinner loading-xs text-primary"></span>
						<span>
							Downloading on-device model… {downloadPercent ?? 0}%
						</span>
					</div>
				{/if}

				{#if phase === 'unsupported'}
					<div
						class="border-base-300 bg-base-200/60 shrink-0 border-b px-4 py-2 text-xs text-base-content/70 sm:px-6"
						role="status"
					>
						<p>
							On-device Rewriter isn't available here. Local cleanup still runs on this device.
							See the
							<ExternalLink href={HUMANIZE_API_DOCS_URL} class="link link-primary font-medium">
								Chrome Rewriter API docs
							</ExternalLink>
							for setup steps.
						</p>
					</div>
				{/if}

				<div class="border-base-300 shrink-0 border-b px-3 py-2 sm:px-4">
					{@render constraintStrip(true)}
				</div>

				<div class="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6">
					<div class="flex flex-col gap-3">
						<div>
							<p class="mb-1.5 text-[11px] font-semibold tracking-wide text-base-content/55 uppercase">
								{uiCopy.modeSection}
							</p>
							<div class="flex rounded-lg border border-base-300 bg-base-200/40 p-0.5" role="group">
								{#each modeOptions as option (option.id)}
									<button
										type="button"
										class={[
											'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
											mode === option.id
												? 'bg-base-100 text-base-content shadow-sm'
												: 'text-base-content/70 hover:text-base-content'
										]}
										aria-pressed={mode === option.id}
										disabled={isBusy}
										onclick={() => onModeChange(option.id)}
									>
										{option.label}
									</button>
								{/each}
							</div>
							<p class="mt-1.5 text-xs text-base-content/65">
								{selectedModeOption.description}
							</p>
						</div>

						<div>
							<div class="mb-1.5 flex items-baseline justify-between gap-2">
								<p class="text-[11px] font-semibold tracking-wide text-primary uppercase">
									{uiCopy.draftSection}
								</p>
								{#if hasSource}
									<span class="text-[11px] tabular-nums text-primary/80">
										{sourcePlainText.length} {uiCopy.charactersSuffix}
										{#if sourceAudit}
											· {tellCountBefore} {uiCopy.tellsSuffix}
										{/if}
									</span>
								{/if}
							</div>
							<div
								class="max-h-36 overflow-y-auto rounded-md border border-primary/35 bg-primary/10 px-3 py-2 text-sm leading-relaxed font-medium whitespace-pre-wrap text-primary shadow-sm"
								role="region"
								aria-label="Post draft to rewrite"
							>
								{sourcePlainText}
							</div>
						</div>

						<div>
							<div class="mb-1.5 flex items-baseline justify-between gap-2">
								<p class="text-[11px] font-semibold tracking-wide text-base-content/55 uppercase">
									{uiCopy.rewriteSection}
								</p>
								{#if rewriteText}
									<span class="text-[11px] tabular-nums text-base-content/60">
										{#if rewriteAudit}
											{tellCountAfter} {uiCopy.tellsSuffix}
										{/if}
										{#if localFallback}
											{rewriteAudit ? ' · ' : ''}{uiCopy.localCleanupChip}
										{/if}
									</span>
								{/if}
							</div>
							<div
								class="min-h-[120px] rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm leading-relaxed text-base-content"
								role="region"
								aria-live="polite"
								aria-label="Generated rewrite"
							>
								{#if isBusy && !rewriteText}
									<Shimmer class="text-sm" content_length={24}>
										{#if downloadPercent != null && downloadPercent < 100}
											Downloading model…
										{:else}
											Rewriting…
										{/if}
									</Shimmer>
								{:else if errorMessage && runStatus === 'error' && !rewriteText}
									<p class="text-error text-sm">
										{errorMessage}
									</p>
								{:else if rewriteText}
									{#if errorMessage && runStatus === 'error'}
										<p class="text-error text-sm">
											{rewriteText}
										</p>
									{:else}
										<p class="whitespace-pre-wrap">
											{rewriteText}
										</p>
									{/if}
								{:else}
									<p class="text-sm text-base-content/60">
										Choose Human or Roughen, then rewrite.
									</p>
								{/if}
							</div>
						</div>

						{#if inventedSpecifics.length > 0}
							<div
								class="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-base-content/80"
								role="status"
							>
								<p class="font-medium text-base-content">
									Review invented details before you post
								</p>
								<ul class="mt-1.5 list-disc space-y-0.5 pl-4">
									{#each inventedSpecifics as item (item.kind + item.value)}
										<li>
											{item.note}
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				</div>

				<div
					class="border-base-300 flex shrink-0 flex-wrap items-center justify-end gap-2 border-t px-4 py-3 sm:px-6"
				>
					{#if rewriteText}
						<span
							class="mr-auto text-xs font-medium tabular-nums {isOverLimit
								? 'text-error'
								: 'text-base-content/60'}"
						>
							{rewriteLength}/{maxCharacters}
						</span>
					{/if}
					<Button type="button" variant="ghost" onclick={close}>
						Close
					</Button>
					{#if isBusy}
						<Button type="button" variant="outline" size="sm" onclick={stopGeneration}>
							Stop
						</Button>
					{:else}
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!hasSource}
							onclick={onRewrite}
						>
							Rewrite
						</Button>
					{/if}
					<Button type="button" variant="outline" size="sm" disabled={!canReplace} onclick={copyRewrite}>
						Copy
					</Button>
					<Button
						type="button"
						variant="primary"
						size="sm"
						disabled={!canReplace}
						onclick={requestReplaceBody}
					>
						Replace post
					</Button>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<DeleteModal
	bind:open={replaceConfirmOpen}
	title="Replace post with rewrite?"
	description="The rewrite will replace the existing composer body. Closing Sound more human clears this result — you won't get the rewrite back here."
	confirmLabel="Replace and close"
	cancelLabel="Keep editing"
	confirmVariant="primary"
	cancelFirst={true}
	onConfirm={confirmReplaceBody}
	onCancel={() => (replaceConfirmOpen = false)}
/>
