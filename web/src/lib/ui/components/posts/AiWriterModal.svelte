<script lang="ts">
	import type { Message as PromptInputMessage } from '$lib/ui/components/ai-elements/prompt-input';
	import type { WriterPresenter } from '$lib/ai-writer/Writer.presenter.svelte';

	import { untrack } from 'svelte';

	import {
		COMPOSER_REWRITER_REFINE_ACTIONS,
		COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS,
		COMPOSER_WRITER_SUGGESTIONS,
		REWRITER_API_DOCS_URL,
		WRITER_API_DOCS_URL
	} from '$lib/ai-writer/constants/config';
	import { formatWriterProviderConstraintTooltip } from '$lib/ai-writer/utils';
	import { socialProviderIcon } from '$data/social-providers';
	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import ComposerMediaTooltip from '$lib/ui/components/posts/ComposerMediaTooltip.svelte';
	import * as Conversation from '$lib/ui/components/ai-elements/conversation';
	import * as Message from '$lib/ui/components/ai-elements/message';
	import * as PromptInput from '$lib/ui/components/ai-elements/prompt-input';
	import { Shimmer } from '$lib/ui/components/ai-elements/shimmer';
	import { Suggestion, Suggestions } from '$lib/ui/components/ai-elements/suggestion';
	import * as Dialog from '$lib/ui/dialog';
	import DeleteModal from '$lib/ui/modals/DeleteModal.svelte';
	import * as Tooltip from '$lib/ui/tooltip';

	type Props = {
		writerPresenter: WriterPresenter;
		open?: boolean;
		/** Optional current composer body used as Writer context. */
		existingBody?: string;
		/** Composer soft character limit (Global Edit or focused provider). */
		softCharLimit?: number;
		composerMode?: 'global' | 'custom';
		focusedProviderIdentifier?: string | null;
		/** Unique provider identifiers the draft constraints apply to. */
		constraintProviderIdentifiers?: readonly string[];
		onInsertDraft?: (text: string) => void;
	};

	let {
		writerPresenter,
		open = $bindable(false),
		existingBody = '',
		softCharLimit = COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS,
		composerMode = 'global',
		focusedProviderIdentifier = null,
		constraintProviderIdentifiers = [],
		onInsertDraft = undefined
	}: Props = $props();

	let promptTextareaRef = $state.raw<HTMLTextAreaElement | null>(null);
	let insertConfirmOpen = $state(false);

	const phase = $derived(writerPresenter.phase);
	const rewriterGate = $derived(writerPresenter.rewriterGate);
	const chatStatus = $derived(writerPresenter.chatStatus);
	const draftText = $derived(writerPresenter.draftText);
	const messagesVm = $derived(writerPresenter.messagesVm);
	const errorMessage = $derived(writerPresenter.errorMessage);
	const downloadPercent = $derived(writerPresenter.downloadPercent);
	const isBusy = $derived(writerPresenter.isBusy);
	const canInsert = $derived(writerPresenter.canInsert);
	const showRefineActions = $derived(writerPresenter.showRefineActions);
	const showEmptyState = $derived(writerPresenter.showEmptyState);
	const showDownloadBanner = $derived(writerPresenter.showDownloadBanner);
	const draftLength = $derived(writerPresenter.draftLength);
	const isOverLimit = $derived(writerPresenter.isOverLimit);
	const maxCharacters = $derived(writerPresenter.maxCharacters);
	/** Presenter is source of truth after open seed / user removals. */
	const resolvedConstraintProviders = $derived(writerPresenter.constraintProvidersVm);
	const showConstraintStrip = $derived(true);
	const lastAssistantId = $derived.by(() => {
		for (let i = messagesVm.length - 1; i >= 0; i -= 1) {
			if (messagesVm[i]?.role === 'assistant') return messagesVm[i]!.id;
		}
		return null;
	});

	$effect(() => {
		if (!open) return;

		// Depend only on `open`. onOpen writes presenter $state; tracking those would
		// re-run this effect → cleanup resetUi → infinite loop.
		untrack(() => {
			const ids =
				constraintProviderIdentifiers.length > 0
					? [...constraintProviderIdentifiers]
					: focusedProviderIdentifier?.trim()
						? [focusedProviderIdentifier.trim()]
						: [];
			writerPresenter.setDraftConstraints({
				maxCharacters: softCharLimit,
				providerIdentifiers: ids,
				providerIdentifier: ids[0] ?? focusedProviderIdentifier,
				composerMode
			});
			void writerPresenter.onOpen();
		});

		return () => {
			writerPresenter.teardown();
			writerPresenter.resetUi();
		};
	});

	$effect(() => {
		const msg = writerPresenter.pendingToastError;
		if (!msg) return;
		toast.error(msg);
		writerPresenter.clearPendingToastError();
	});

	function close() {
		open = false;
	}

	async function acceptOptIn() {
		await writerPresenter.acceptOptIn();
	}

	async function acceptRewriterOptIn() {
		await writerPresenter.acceptRewriterOptIn();
	}

	function dismissRewriterGate() {
		writerPresenter.dismissRewriterGate();
	}

	function stopGeneration() {
		writerPresenter.stopGeneration();
	}

	function onSuggestion(suggestion: string) {
		writerPresenter.promptText = suggestion;
		promptTextareaRef?.focus();
	}

	function removeConstraint(identifier: string) {
		writerPresenter.removeConstraintProvider(identifier);
	}

	async function onPromptSubmit(message: PromptInputMessage) {
		await writerPresenter.runWrite(message.text ?? '', { existingBody });
	}

	async function copyDraft() {
		const text = draftText.trim();
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			toast.success('Draft copied to clipboard');
		} catch {
			toast.error('Could not copy draft.');
		}
	}

	function requestInsertDraft() {
		const text = draftText.trim();
		if (!text) return;
		insertConfirmOpen = true;
	}

	function confirmInsertDraft() {
		const text = draftText.trim();
		insertConfirmOpen = false;
		if (!text) return;
		onInsertDraft?.(text);
		open = false;
	}
</script>

{#snippet constraintStrip(compact: boolean)}
	{#if showConstraintStrip}
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
						<span class="text-base-content/55">No channel constraints · up to {maxCharacters} characters</span>
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
	{/if}
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
						<AbstractIcon name={icons.PencilSparkles.name} class="size-5" width="20" height="20" />
						AI Writer
					</Dialog.Title>
					<Dialog.Description class="mt-1 text-xs leading-snug text-base-content/70">
						{#if phase === 'opt-in'}
							On-device drafting with Chrome's Writer API — review before continuing.
						{:else if phase === 'unsupported'}
							On-device drafting with Chrome's Writer API.
						{:else if rewriterGate === 'opt-in'}
							On-device refine with Chrome's Rewriter API — review before continuing.
						{:else if rewriterGate === 'unsupported'}
							On-device refine with Chrome's Rewriter API.
						{:else if showRefineActions}
							Refine tone or length, or ask for a revision — then insert into the composer.
						{:else}
							Draft a social post on-device, then insert it into the composer.
						{/if}
					</Dialog.Description>
				</div>
				{#if phase === 'resolving' || chatStatus === 'submitted'}
					<span class="loading loading-spinner loading-sm shrink-0 text-primary"></span>
				{/if}
			</div>
		</Dialog.Header>

		{#if phase === 'opt-in'}
			<div class="flex min-h-[220px] flex-col gap-3 px-4 py-4 sm:px-6">
				<div class="rounded-md border border-base-300 bg-base-100 p-3 text-sm text-base-content/80">
					<p class="font-medium text-base-content">
						Use AI Writer on this device?
					</p>
					<p class="mt-2 text-base-content/70">
						AI Writer uses Chrome's on-device Writer API. Your drafts stay on this device.
					</p>
					<p class="mt-2 text-base-content/70">
						The first time you use it, Chrome may download an on-device model. That download and
						all generation run locally in your browser.
					</p>
				</div>
			</div>
			<div class="border-base-300 flex shrink-0 justify-end gap-2 border-t px-4 py-3 sm:px-6">
				<Button type="button" variant="ghost" onclick={close}>Not now</Button>
				<Button type="button" variant="primary" onclick={acceptOptIn}>Continue</Button>
			</div>
		{:else if phase === 'resolving'}
			<div class="flex min-h-[220px] items-center justify-center px-4 py-8 sm:px-6">
				<p class="text-sm text-base-content/70">Checking Writer support…</p>
			</div>
		{:else if phase === 'unsupported'}
			<div class="flex min-h-[220px] flex-col gap-3 px-4 py-4 sm:px-6">
				<div class="rounded-md border border-base-300 bg-base-100 p-3 text-sm text-base-content/80">
					<p class="font-medium text-base-content">
						Writer isn't available here
					</p>
					<p class="mt-2 text-base-content/70">
						AI Writer uses Chrome's experimental on-device Writer API. It works in recent Chrome
						builds when the Writer API is enabled (and the on-device model can download). This feature
						does not send input to OpenQuok servers.
					</p>
					<p class="mt-2 text-base-content/70">
						See the
						<ExternalLink
							href={WRITER_API_DOCS_URL}
							trusted={true}
							class="link link-primary font-medium"
						>
							Chrome Writer API docs
						</ExternalLink>
						for setup steps, hardware notes, and origin-trial details.
					</p>
				</div>
			</div>
			<div class="border-base-300 flex shrink-0 justify-end border-t px-4 py-3 sm:px-6">
				<Button type="button" variant="ghost" onclick={close}>Close</Button>
			</div>
		{:else if rewriterGate === 'opt-in'}
			<div class="flex min-h-[220px] flex-col gap-3 px-4 py-4 sm:px-6">
				<div class="rounded-md border border-base-300 bg-base-100 p-3 text-sm text-base-content/80">
					<p class="font-medium text-base-content">Use tone and length refine on this device?</p>
					<p class="mt-2 text-base-content/70">
						Refine uses Chrome's on-device Rewriter API. Your drafts stay on this device.
					</p>
					<p class="mt-2 text-base-content/70">
						The first time you use it, Chrome may download an on-device model. That download and
						all generation run locally in your browser.
					</p>
				</div>
			</div>
			<div class="border-base-300 flex shrink-0 justify-end gap-2 border-t px-4 py-3 sm:px-6">
				<Button type="button" variant="ghost" onclick={dismissRewriterGate}>Not now</Button>
				<Button type="button" variant="primary" onclick={acceptRewriterOptIn}>Continue</Button>
			</div>
		{:else if rewriterGate === 'unsupported'}
			<div class="flex min-h-[220px] flex-col gap-3 px-4 py-4 sm:px-6">
				<div class="rounded-md border border-base-300 bg-base-100 p-3 text-sm text-base-content/80">
					<p class="font-medium text-base-content">Rewriter isn't available here</p>
					<p class="mt-2 text-base-content/70">
						Tone and length refine uses Chrome's experimental on-device Rewriter API. It works in
						recent Chrome builds when the Rewriter API is enabled (and the on-device model can
						download). Free-text revisions with Writer still work. This feature does not send
						input to servers.
					</p>
					<p class="mt-2 text-base-content/70">
						See the
						<ExternalLink
							href={REWRITER_API_DOCS_URL}
							trusted={true}
							class="link link-primary font-medium"
						>
							Chrome Rewriter API docs
						</ExternalLink>
						for setup steps, hardware notes, and origin-trial details.
					</p>
				</div>
			</div>
			<div class="border-base-300 flex shrink-0 justify-end border-t px-4 py-3 sm:px-6">
				<Button type="button" variant="ghost" onclick={dismissRewriterGate}>Back</Button>
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

				<div class="min-h-0 flex-1 overflow-hidden px-2 py-2 sm:px-3">
					<Conversation.Root class="h-full min-h-0 max-h-[min(42vh,320px)]">
						<Conversation.Content class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-2 py-2 pb-6">
							{#if showEmptyState}
								<div class="flex flex-col items-center gap-4 py-6">
									<Conversation.EmptyState
										class="size-auto min-h-0 p-0"
										title="What should we draft?"
										description="Pick a suggestion or describe the post you want."
									>
										{#snippet icon()}
											<AbstractIcon
												name={icons.PencilSparkles.name}
												class="size-8 text-base-content/40"
												width="32"
												height="32"
											/>
										{/snippet}
									</Conversation.EmptyState>
									<Suggestions>
										{#each COMPOSER_WRITER_SUGGESTIONS as suggestion (suggestion)}
											<Suggestion
												{suggestion}
												disabled={isBusy}
												onclick={onSuggestion}
											/>
										{/each}
									</Suggestions>
									{@render constraintStrip(false)}
								</div>
							{:else}
								{#each messagesVm as message (message.id)}
									{#if message.role === 'user'}
										<Message.Root from="user">
											<Message.Content>
												{message.content}
											</Message.Content>
										</Message.Root>
									{:else}
										<Message.Root from="assistant">
											<Message.Content class="w-full max-w-full">
												{#if isBusy && message.id === lastAssistantId && !message.content}
													<Shimmer class="text-sm" content_length={24}>
														{#if downloadPercent != null && downloadPercent < 100}
															Downloading model…
														{:else}
															Writing draft…
														{/if}
													</Shimmer>
												{:else if message.content}
													{#if message.id === lastAssistantId && errorMessage && chatStatus === 'error'}
														<p class="text-error text-sm">{message.content}</p>
													{:else}
														<Message.Response content={message.content} />
													{/if}
												{:else}
													<p class="text-sm text-base-content/60">No draft yet.</p>
												{/if}
											</Message.Content>
											{#if message.id === lastAssistantId && message.content && !isBusy && chatStatus !== 'error'}
												<Message.Actions class="mt-1">
													<Message.Action
														tooltip="Copy draft"
														label="Copy draft"
														onclick={copyDraft}
													>
														<AbstractIcon name={icons.Copy.name} class="size-4" width="16" height="16" />
													</Message.Action>
												</Message.Actions>
											{/if}
										</Message.Root>
									{/if}
								{/each}
							{/if}
						</Conversation.Content>
					</Conversation.Root>
				</div>

				{#if !showEmptyState}
					<div class="border-base-300 bg-base-100 shrink-0 border-t px-3 py-1.5 sm:px-4">
						{@render constraintStrip(true)}
					</div>
				{/if}

				<div class="border-base-300 shrink-0 border-t px-3 py-3 sm:px-4">
					{#if showRefineActions}
						<div class="mb-2 flex flex-wrap gap-2">
							{#each COMPOSER_REWRITER_REFINE_ACTIONS as action (action.id)}
								<Suggestion
									suggestion={action.label}
									size="sm"
									disabled={isBusy || !draftText.trim()}
									onclick={() => void writerPresenter.requestRefine(action)}
								/>
							{/each}
						</div>
					{/if}
					<PromptInput.Root
						class="divide-y-0 rounded-lg border border-primary/35 bg-primary/10 shadow-sm"
						onSubmit={onPromptSubmit}
					>
						<PromptInput.Body>
							<PromptInput.Textarea
								bind:ref={promptTextareaRef}
								bind:value={writerPresenter.promptText}
								placeholder={showEmptyState
									? 'Describe the post to draft…'
									: showRefineActions
										? 'Refine tone or length, or ask for a revision…'
										: 'Ask for a revision or a new draft…'}
								class="min-h-[72px] font-medium text-primary placeholder:text-primary/50"
							/>
						</PromptInput.Body>
						<PromptInput.Toolbar class="justify-end border-t border-primary/25">
							<PromptInput.Submit
								class="shrink-0"
								status={chatStatus}
								onStop={stopGeneration}
								disabled={false}
							/>
						</PromptInput.Toolbar>
					</PromptInput.Root>
				</div>

				<div class="border-base-300 flex shrink-0 flex-wrap items-center justify-end gap-2 border-t px-4 py-3 sm:px-6">
					{#if draftText}
						<span
							class="mr-auto text-xs font-medium tabular-nums {isOverLimit
								? 'text-error'
								: 'text-base-content/60'}"
						>
							{draftLength}/{maxCharacters}
						</span>
					{/if}
					<Button type="button" variant="ghost" onclick={close}>Close</Button>
					{#if isBusy}
						<Button type="button" variant="outline" size="sm" onclick={stopGeneration}>
							Stop
						</Button>
					{/if}
					<Button type="button" variant="outline" size="sm" disabled={!canInsert} onclick={copyDraft}>
						Copy
					</Button>
					<Button type="button" variant="primary" size="sm" disabled={!canInsert} onclick={requestInsertDraft}>
						Insert into post
					</Button>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<DeleteModal
	bind:open={insertConfirmOpen}
	title="Insert draft into the post?"
	description="The draft will be added to the composer. Closing AI Writer clears this conversation — you won't get the prompt or draft back here."
	confirmLabel="Insert and close"
	cancelLabel="Keep editing"
	confirmVariant="primary"
	cancelFirst={true}
	onConfirm={confirmInsertDraft}
	onCancel={() => (insertConfirmOpen = false)}
/>
