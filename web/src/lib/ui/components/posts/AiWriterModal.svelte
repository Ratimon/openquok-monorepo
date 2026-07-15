<script lang="ts">
	import type { WriterAvailability, WriterSession } from '$lib/ai-writer';
	import type { ChatStatus, Message as PromptInputMessage } from '$lib/ui/components/ai-elements/prompt-input';

	import {
		COMPOSER_WRITER_SUGGESTIONS,
		WRITER_API_DOCS_URL,
		acceptWriterSoftOptIn,
		createComposerWriter,
		destroyWriter,
		getWriterAvailability,
		hasWriterSoftOptIn,
		isWriterSupported,
		writeDraftStreaming
	} from '$lib/ai-writer';
	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import * as Conversation from '$lib/ui/components/ai-elements/conversation';
	import * as Message from '$lib/ui/components/ai-elements/message';
	import * as PromptInput from '$lib/ui/components/ai-elements/prompt-input';
	import { Shimmer } from '$lib/ui/components/ai-elements/shimmer';
	import { Suggestion, Suggestions } from '$lib/ui/components/ai-elements/suggestion';
	import * as Dialog from '$lib/ui/dialog';

	type Props = {
		open?: boolean;
		/** Optional current composer body used as Writer context. */
		existingBody?: string;
		onInsertDraft?: (text: string) => void;
	};

	let {
		open = $bindable(false),
		existingBody = '',
		onInsertDraft = undefined
	}: Props = $props();

	type UiPhase = 'opt-in' | 'resolving' | 'unsupported' | 'ready';

	let phase = $state<UiPhase>('resolving');
	let availability = $state<WriterAvailability | null>(null);
	let downloadPercent = $state<number | null>(null);
	let chatStatus = $state<ChatStatus>('ready');
	let lastPrompt = $state('');
	let draftText = $state('');
	let errorMessage = $state<string | null>(null);
	let promptText = $state('');
	let promptTextareaRef = $state<HTMLTextAreaElement | null>(null);

	let writerSession = $state.raw<WriterSession | null>(null);
	let abortController: AbortController | null = null;
	let sessionGeneration = 0;

	const isBusy = $derived(chatStatus === 'submitted' || chatStatus === 'streaming');
	const canInsert = $derived(draftText.trim().length > 0 && !isBusy);
	const showEmptyState = $derived(!lastPrompt && !draftText && !isBusy && !errorMessage);
	const showDownloadBanner = $derived(
		downloadPercent != null &&
			downloadPercent < 100 &&
			(availability === 'downloadable' || availability === 'downloading' || chatStatus === 'submitted')
	);

	$effect(() => {
		if (!open) return;

		void onOpen();

		return () => {
			teardownSession();
			resetUi();
		};
	});

	async function onOpen() {
		if (!hasWriterSoftOptIn()) {
			phase = 'opt-in';
			return;
		}

		await startWriterSession();
	}

	async function acceptOptIn() {
		acceptWriterSoftOptIn();
		await startWriterSession();
	}

	async function startWriterSession() {
		const gen = ++sessionGeneration;
		phase = 'resolving';
		availability = null;
		downloadPercent = null;
		errorMessage = null;
		abortController = new AbortController();

		if (!isWriterSupported()) {
			if (gen !== sessionGeneration) return;
			phase = 'unsupported';
			availability = 'unavailable';
			return;
		}

		const nextAvailability = await getWriterAvailability();
		if (gen !== sessionGeneration) return;
		availability = nextAvailability;

		if (nextAvailability === 'unavailable') {
			phase = 'unsupported';
			return;
		}

		phase = 'ready';

		if (nextAvailability === 'downloadable' || nextAvailability === 'downloading') {
			void ensureWriter().catch((err) => {
				if (gen !== sessionGeneration) return;
				const aborted =
					(err instanceof DOMException && err.name === 'AbortError') ||
					(err instanceof Error && err.name === 'AbortError');
				if (aborted) return;
				downloadPercent = null;
				toast.error(
					err instanceof Error && err.message
						? err.message
						: 'Could not download the on-device Writer model.'
				);
			});
		}
	}

	function resetUi() {
		phase = 'resolving';
		availability = null;
		downloadPercent = null;
		chatStatus = 'ready';
		lastPrompt = '';
		draftText = '';
		errorMessage = null;
		promptText = '';
	}

	function teardownSession() {
		sessionGeneration += 1;
		abortController?.abort();
		abortController = null;
		destroyWriter(writerSession);
		writerSession = null;
	}

	function close() {
		open = false;
	}

	function stopGeneration() {
		abortController?.abort();
		abortController = new AbortController();
		if (chatStatus === 'submitted' || chatStatus === 'streaming') {
			chatStatus = 'ready';
		}
	}

	async function ensureWriter(): Promise<WriterSession> {
		if (writerSession) return writerSession;
		const signal = abortController?.signal;
		const created = await createComposerWriter({
			signal,
			onDownloadProgress: (loaded) => {
				downloadPercent = Math.round(loaded * 100);
			}
		});
		writerSession = created;
		downloadPercent = 100;
		availability = 'available';
		return created;
	}

	async function runWrite(prompt: string) {
		const trimmed = prompt.trim();
		if (!trimmed || isBusy) return;

		lastPrompt = trimmed;
		draftText = '';
		errorMessage = null;
		chatStatus = 'submitted';

		const context = existingBody?.trim() || undefined;
		const gen = sessionGeneration;

		try {
			const writer = await ensureWriter();
			if (gen !== sessionGeneration) return;

			chatStatus = 'streaming';
			let assembled = '';
			for await (const chunk of writeDraftStreaming(writer, trimmed, {
				context,
				signal: abortController?.signal
			})) {
				if (gen !== sessionGeneration) return;
				assembled += chunk;
				draftText = assembled;
			}
			if (gen !== sessionGeneration) return;
			chatStatus = 'ready';
		} catch (err) {
			if (gen !== sessionGeneration) return;
			const aborted =
				(err instanceof DOMException && err.name === 'AbortError') ||
				(err instanceof Error && err.name === 'AbortError');
			if (aborted) {
				chatStatus = 'ready';
				return;
			}
			chatStatus = 'error';
			errorMessage =
				err instanceof Error && err.message
					? err.message
					: 'Could not generate a draft. Try again.';
			toast.error(errorMessage);
		}
	}

	function onSuggestion(suggestion: string) {
		promptText = suggestion;
		promptTextareaRef?.focus();
	}

	async function onPromptSubmit(message: PromptInputMessage) {
		await runWrite(message.text ?? '');
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

	function insertDraft() {
		const text = draftText.trim();
		if (!text) return;
		onInsertDraft?.(text);
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="flex max-h-[min(90vh,640px)] w-[min(100vw-1rem,560px)] max-w-[min(100vw-1rem,560px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(100vw-1rem,560px)]"
		showCloseButton={true}
	>
		<Dialog.Header class="border-base-300 shrink-0 border-b px-4 py-3 sm:px-6">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0 flex-1">
					<Dialog.Title class="flex items-center gap-2 text-base font-semibold text-base-content">
						<AbstractIcon name={icons.Sparkles.name} class="size-5" width="20" height="20" />
						AI Writer
					</Dialog.Title>
					<Dialog.Description class="mt-1 text-xs leading-snug text-base-content/70">
						{#if phase === 'opt-in'}
							On-device drafting with Chrome's Writer API — review before continuing.
						{:else if phase === 'unsupported'}
							On-device drafting with Chrome's Writer API.
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
					<Conversation.Root class="h-[min(42vh,320px)] min-h-[200px]">
						<Conversation.Content class="flex flex-col gap-3 overflow-y-auto px-2 py-2">
							{#if showEmptyState}
								<div class="flex flex-col items-center gap-4 py-6">
									<Conversation.EmptyState
										class="size-auto min-h-0 p-0"
										title="What should we draft?"
										description="Pick a suggestion or describe the post you want."
									>
										{#snippet icon()}
											<AbstractIcon
												name={icons.Sparkles.name}
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
								</div>
							{:else}
								{#if lastPrompt}
									<Message.Root from="user">
										<Message.Content>
											{lastPrompt}
										</Message.Content>
									</Message.Root>
								{/if}
								<Message.Root from="assistant">
									<Message.Content class="w-full max-w-full">
										{#if isBusy && !draftText}
											<Shimmer class="text-sm" content_length={24}>
												{#if downloadPercent != null && downloadPercent < 100}
													Downloading model…
												{:else}
													Writing draft…
												{/if}
											</Shimmer>
										{:else if draftText}
											<Message.Response content={draftText} />
										{:else if errorMessage}
											<p class="text-error text-sm">{errorMessage}</p>
										{:else}
											<p class="text-sm text-base-content/60">No draft yet.</p>
										{/if}
									</Message.Content>
									{#if draftText && !isBusy}
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
						</Conversation.Content>
					</Conversation.Root>
				</div>

				<div class="border-base-300 shrink-0 border-t px-3 py-3 sm:px-4">
					<PromptInput.Root class="divide-y-0 rounded-lg border border-base-300" onSubmit={onPromptSubmit}>
						<PromptInput.Body>
							<PromptInput.Textarea
								bind:ref={promptTextareaRef}
								bind:value={promptText}
								placeholder="Describe the post to draft…"
								class="min-h-[72px]"
							/>
						</PromptInput.Body>
						<PromptInput.Toolbar class="border-t border-base-300/80">
							<PromptInput.Tools>
								{#if !showEmptyState}
									<Suggestions class="max-w-[min(100%,280px)]">
										{#each COMPOSER_WRITER_SUGGESTIONS as suggestion (suggestion)}
											<Suggestion
												{suggestion}
												size="sm"
												disabled={isBusy}
												onclick={onSuggestion}
											/>
										{/each}
									</Suggestions>
								{/if}
							</PromptInput.Tools>
							<PromptInput.Submit status={chatStatus} onStop={stopGeneration} disabled={false} />
						</PromptInput.Toolbar>
					</PromptInput.Root>
				</div>

				<div class="border-base-300 flex shrink-0 flex-wrap items-center justify-end gap-2 border-t px-4 py-3 sm:px-6">
					<Button type="button" variant="ghost" onclick={close}>Close</Button>
					{#if isBusy}
						<Button type="button" variant="outline" size="sm" onclick={stopGeneration}>
							Stop
						</Button>
					{/if}
					<Button type="button" variant="outline" size="sm" disabled={!canInsert} onclick={copyDraft}>
						Copy
					</Button>
					<Button type="button" variant="primary" size="sm" disabled={!canInsert} onclick={insertDraft}>
						Insert into post
					</Button>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
