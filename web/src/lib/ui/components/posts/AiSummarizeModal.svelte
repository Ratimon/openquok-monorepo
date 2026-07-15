<script lang="ts">
	import type { SummarizerPresenter } from '$lib/ai-summarizer/Summarizer.presenter.svelte';
	import type {
		ComposerSummarizerLength,
		ComposerSummarizerType
	} from '$lib/ai-summarizer/utils';

	import { untrack } from 'svelte';

	import {
		COMPOSER_SUMMARIZER_LENGTH_SHORT_MAX_CHARS,
		SUMMARIZER_API_DOCS_URL
	} from '$lib/ai-summarizer/constants/config';
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

	const SUMMARIZER_TYPES: { value: ComposerSummarizerType; label: string }[] = [
		{ value: 'tldr', label: 'TL;DR' },
		{ value: 'key-points', label: 'Key points' },
		{ value: 'teaser', label: 'Teaser' },
		{ value: 'headline', label: 'Headline' }
	];

	const SUMMARIZER_LENGTHS: { value: ComposerSummarizerLength; label: string }[] = [
		{ value: 'short', label: 'Short' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'long', label: 'Long' }
	];

	/**
	 * Composer body is usually plain text; keep newlines in the Source preview while
	 * still stripping any accidental markup tags.
	 */
	function toSourcePreviewText(raw: string): string {
		return raw
			.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
			.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<\/(?:p|div|li|h[1-6])>/gi, '\n')
			.replace(/<[^>]+>/g, '')
			.replace(/[ \t]+\n/g, '\n')
			.replace(/\n{3,}/g, '\n\n')
			.trim();
	}

	type Props = {
		summarizerPresenter: SummarizerPresenter;
		open?: boolean;
		existingBody?: string;
		softCharLimit?: number;
		composerMode?: 'global' | 'custom';
		focusedProviderIdentifier?: string | null;
		constraintProviderIdentifiers?: readonly string[];
		onReplaceBody?: (text: string) => void;
	};

	let {
		summarizerPresenter,
		open = $bindable(false),
		existingBody = '',
		softCharLimit = COMPOSER_SUMMARIZER_LENGTH_SHORT_MAX_CHARS,
		composerMode = 'global',
		focusedProviderIdentifier = null,
		constraintProviderIdentifiers = [],
		onReplaceBody = undefined
	}: Props = $props();

	let replaceConfirmOpen = $state(false);

	const phase = $derived(summarizerPresenter.phase);
	const runStatus = $derived(summarizerPresenter.runStatus);
	const summaryText = $derived(summarizerPresenter.summaryText);
	const errorMessage = $derived(summarizerPresenter.errorMessage);
	const downloadPercent = $derived(summarizerPresenter.downloadPercent);
	const isBusy = $derived(summarizerPresenter.isBusy);
	const canReplace = $derived(summarizerPresenter.canReplace);
	const showDownloadBanner = $derived(summarizerPresenter.showDownloadBanner);
	const summaryLength = $derived(summarizerPresenter.summaryLength);
	const isOverLimit = $derived(summarizerPresenter.isOverLimit);
	const maxCharacters = $derived(summarizerPresenter.maxCharacters);
	const resolvedConstraintProviders = $derived(summarizerPresenter.constraintProvidersVm);
	const summaryType = $derived(summarizerPresenter.type);
	const summaryLengthOption = $derived(summarizerPresenter.length);

	const sourcePreviewText = $derived(toSourcePreviewText(existingBody));
	const sourcePlainText = $derived(stripHtmlToPlainText(existingBody));
	const hasSource = $derived(sourcePlainText.length > 0);
	const showEmptyState = $derived(phase === 'ready' && !hasSource);

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
			summarizerPresenter.setDraftConstraints({
				maxCharacters: softCharLimit,
				providerIdentifiers: ids,
				providerIdentifier: ids[0] ?? focusedProviderIdentifier,
				composerMode
			});
			void summarizerPresenter.onOpen();
		});

		return () => {
			summarizerPresenter.teardown();
			summarizerPresenter.resetUi();
		};
	});

	$effect(() => {
		const msg = summarizerPresenter.pendingToastError;
		if (!msg) return;
		toast.error(msg);
		summarizerPresenter.clearPendingToastError();
	});

	function close() {
		open = false;
	}

	async function acceptOptIn() {
		await summarizerPresenter.acceptOptIn();
	}

	function stopGeneration() {
		summarizerPresenter.stopGeneration();
	}

	function removeConstraint(identifier: string) {
		summarizerPresenter.removeConstraintProvider(identifier);
	}

	function onTypeChange(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value as ComposerSummarizerType;
		summarizerPresenter.setType(value);
	}

	function onLengthChange(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value as ComposerSummarizerLength;
		summarizerPresenter.setLength(value);
	}

	async function onSummarize() {
		if (!hasSource || isBusy) return;
		await summarizerPresenter.runSummarize(sourcePlainText);
	}

	async function copySummary() {
		const text = summaryText.trim();
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			toast.success('Summary copied to clipboard');
		} catch {
			toast.error('Could not copy summary.');
		}
	}

	function requestReplaceBody() {
		const text = summaryText.trim();
		if (!text) return;
		replaceConfirmOpen = true;
	}

	function confirmReplaceBody() {
		const text = summaryText.trim();
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
						<AbstractIcon name={icons.NotebookPen.name} class="size-5" width="20" height="20" />
						AI Summarize
					</Dialog.Title>
					<Dialog.Description class="mt-1 text-xs leading-snug text-base-content/70">
						{#if phase === 'opt-in'}
							On-device summarization with Chrome's Summarizer API — review before continuing.
						{:else if phase === 'unsupported'}
							On-device summarization with Chrome's Summarizer API.
						{:else if showEmptyState}
							Add post text in the composer, then open Summarize again.
						{:else}
							Shorten the post on-device, then replace the composer body with the summary.
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
					<p class="font-medium text-base-content">Use AI Summarize on this device?</p>
					<p class="mt-2 text-base-content/70">
						AI Summarize uses Chrome's on-device Summarizer API. Your post text stays on this
						device.
					</p>
					<p class="mt-2 text-base-content/70">
						The first time you use it, Chrome may download an on-device model. That download and
						all summarization run locally in your browser.
					</p>
				</div>
			</div>
			<div class="border-base-300 flex shrink-0 justify-end gap-2 border-t px-4 py-3 sm:px-6">
				<Button type="button" variant="ghost" onclick={close}>Not now</Button>
				<Button type="button" variant="primary" onclick={acceptOptIn}>Continue</Button>
			</div>
		{:else if phase === 'resolving'}
			<div class="flex min-h-[220px] items-center justify-center px-4 py-8 sm:px-6">
				<p class="text-sm text-base-content/70">Checking Summarizer support…</p>
			</div>
		{:else if phase === 'unsupported'}
			<div class="flex min-h-[220px] flex-col gap-3 px-4 py-4 sm:px-6">
				<div class="rounded-md border border-base-300 bg-base-100 p-3 text-sm text-base-content/80">
					<p class="font-medium text-base-content">Summarizer isn't available here</p>
					<p class="mt-2 text-base-content/70">
						AI Summarize uses Chrome's experimental on-device Summarizer API. It works in recent
						Chrome builds when the Summarizer API is enabled (and the on-device model can download).
						This feature does not send input to OpenQuok servers.
					</p>
					<p class="mt-2 text-base-content/70">
						See the
						<ExternalLink
							href={SUMMARIZER_API_DOCS_URL}
							trusted={true}
							class="link link-primary font-medium"
						>
							Chrome Summarizer API docs
						</ExternalLink>
						for setup steps, hardware notes, and origin-trial details.
					</p>
				</div>
			</div>
			<div class="border-base-300 flex shrink-0 justify-end border-t px-4 py-3 sm:px-6">
				<Button type="button" variant="ghost" onclick={close}>Close</Button>
			</div>
		{:else if showEmptyState}
			<div class="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-8 sm:px-6">
				<AbstractIcon
					name={icons.NotebookPen.name}
					class="size-8 text-base-content/40"
					width="32"
					height="32"
				/>
				<p class="text-center text-sm font-medium text-base-content">Nothing to summarize</p>
				<p class="max-w-sm text-center text-xs text-base-content/70">
					Write or paste post text in the composer first, then open AI Summarize again.
				</p>
			</div>
			<div class="border-base-300 flex shrink-0 justify-end border-t px-4 py-3 sm:px-6">
				<Button type="button" variant="ghost" onclick={close}>Close</Button>
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

				<div class="border-base-300 shrink-0 border-b px-3 py-2 sm:px-4">
					{@render constraintStrip(true)}
				</div>

				<div class="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6">
					<div class="flex flex-col gap-3">
						<div>
							<div class="mb-1.5 flex items-baseline justify-between gap-2">
								<p class="text-[11px] font-semibold tracking-wide text-primary uppercase">
									Post draft
								</p>
								{#if hasSource}
									<span class="text-[11px] tabular-nums text-primary/80">
										{sourcePlainText.length} characters
									</span>
								{/if}
							</div>
							<div
								class="max-h-36 overflow-y-auto rounded-md border border-primary/35 bg-primary/10 px-3 py-2 text-sm leading-relaxed font-medium whitespace-pre-wrap text-primary shadow-sm"
								role="region"
								aria-label="Post draft to summarize"
							>
								{sourcePreviewText}
							</div>
						</div>

						<div class="flex flex-wrap gap-3">
							<label class="flex min-w-[8rem] flex-1 flex-col gap-1">
								<span class="text-[11px] font-semibold tracking-wide text-base-content/55 uppercase"
									>Type</span
								>
								<select
									class="select select-bordered select-sm w-full bg-base-100"
									value={summaryType}
									disabled={isBusy}
									onchange={onTypeChange}
								>
									{#each SUMMARIZER_TYPES as option (option.value)}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							</label>
							<label class="flex min-w-[8rem] flex-1 flex-col gap-1">
								<span class="text-[11px] font-semibold tracking-wide text-base-content/55 uppercase"
									>Length</span
								>
								<select
									class="select select-bordered select-sm w-full bg-base-100"
									value={summaryLengthOption}
									disabled={isBusy}
									onchange={onLengthChange}
								>
									{#each SUMMARIZER_LENGTHS as option (option.value)}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							</label>
						</div>

						<div>
							<p class="mb-1.5 text-[11px] font-semibold tracking-wide text-base-content/55 uppercase">
								Summary
							</p>
							<div
								class="min-h-[120px] rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm leading-relaxed text-base-content"
								role="region"
								aria-live="polite"
								aria-label="Generated summary"
							>
								{#if isBusy && !summaryText}
									<Shimmer class="text-sm" content_length={24}>
										{#if downloadPercent != null && downloadPercent < 100}
											Downloading model…
										{:else}
											Summarizing…
										{/if}
									</Shimmer>
								{:else if errorMessage && runStatus === 'error' && !summaryText}
									<p class="text-error text-sm">{errorMessage}</p>
								{:else if summaryText}
									{#if errorMessage && runStatus === 'error'}
										<p class="text-error text-sm">{summaryText}</p>
									{:else}
										<p class="whitespace-pre-wrap">{summaryText}</p>
									{/if}
								{:else}
									<p class="text-sm text-base-content/60">
										Choose type and length, then summarize.
									</p>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<div
					class="border-base-300 flex shrink-0 flex-wrap items-center justify-end gap-2 border-t px-4 py-3 sm:px-6"
				>
					{#if summaryText}
						<span
							class="mr-auto text-xs font-medium tabular-nums {isOverLimit
								? 'text-error'
								: 'text-base-content/60'}"
						>
							{summaryLength}/{maxCharacters}
						</span>
					{/if}
					<Button type="button" variant="ghost" onclick={close}>Close</Button>
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
							onclick={onSummarize}
						>
							Summarize
						</Button>
					{/if}
					<Button type="button" variant="outline" size="sm" disabled={!canReplace} onclick={copySummary}>
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
	title="Replace post with summary?"
	description="The summary will replace the existing composer body. Closing AI Summarize clears this result — you won't get the summary back here."
	confirmLabel="Replace and close"
	cancelLabel="Keep editing"
	confirmVariant="primary"
	cancelFirst={true}
	onConfirm={confirmReplaceBody}
	onCancel={() => (replaceConfirmOpen = false)}
/>
