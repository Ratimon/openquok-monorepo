<script lang="ts">
	import type { IntegrationMentionProgrammerModel } from '$lib/integrations';

	import { integrationsRepository } from '$lib/integrations/index';
	import {
		COMPOSER_MENTION_MIN_QUERY_LENGTH,
		applyMentionToTextarea,
		detectActiveMentionQuery,
		formatIntegrationMentionText,
		insertTextAtTextareaCaret,
		providerSupportsComposerMentions
	} from '$lib/posts/utils/composerMention';

	type Props = {
		textarea?: HTMLTextAreaElement | null;
		composerMode?: 'global' | 'custom';
		focusedIntegrationId?: string | null;
		focusedProviderIdentifier?: string | null;
		organizationId?: string | null;
		disabled?: boolean;
		guestMode?: boolean;
		onBeforeTextEdit?: () => void;
		onAfterTextEdit?: () => void;
	};

	let {
		textarea = null,
		composerMode = 'global',
		focusedIntegrationId = null,
		focusedProviderIdentifier = null,
		organizationId = null,
		disabled = false,
		guestMode = false,
		onBeforeTextEdit = undefined,
		onAfterTextEdit = undefined
	}: Props = $props();

	const mentionEnabled = $derived(
		composerMode === 'custom' &&
			!guestMode &&
			!disabled &&
			Boolean(organizationId?.trim()) &&
			Boolean(focusedIntegrationId?.trim()) &&
			providerSupportsComposerMentions(focusedProviderIdentifier)
	);

	let open = $state(false);
	let results = $state<IntegrationMentionProgrammerModel[]>([]);
	let loading = $state(false);
	let activeQuery = $state<{ start: number; query: string } | null>(null);
	let highlightedIndex = $state(0);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let fetchGeneration = 0;

	function closePicker() {
		open = false;
		results = [];
		activeQuery = null;
		highlightedIndex = 0;
		loading = false;
	}

	function scheduleSearch(queryState: { start: number; query: string }) {
		clearTimeout(debounceTimer);
		if (queryState.query.length < COMPOSER_MENTION_MIN_QUERY_LENGTH) {
			closePicker();
			return;
		}
		activeQuery = queryState;
		open = true;
		loading = true;
		const generation = ++fetchGeneration;
		debounceTimer = setTimeout(async () => {
			const orgId = organizationId?.trim();
			const integrationId = focusedIntegrationId?.trim();
			if (!orgId || !integrationId) {
				if (generation === fetchGeneration) closePicker();
				return;
			}
			const result = await integrationsRepository.searchIntegrationMentions(
				orgId,
				integrationId,
				queryState.query
			);
			if (generation !== fetchGeneration) return;
			loading = false;
			if (!result.ok) {
				results = [];
				return;
			}
			results = result.mentions;
			highlightedIndex = 0;
			if (!result.mentions.length) {
				open = true;
			}
		}, 250);
	}

	export function handleTextareaInput() {
		if (!mentionEnabled || !textarea) {
			closePicker();
			return;
		}
		const caret = textarea.selectionStart ?? 0;
		const queryState = detectActiveMentionQuery(textarea.value ?? '', caret);
		if (!queryState) {
			closePicker();
			return;
		}
		scheduleSearch(queryState);
	}

	function selectMention(mention: IntegrationMentionProgrammerModel) {
		const el = textarea;
		const queryState = activeQuery;
		if (!el || !queryState) return;
		const insertText = formatIntegrationMentionText(focusedProviderIdentifier, mention);
		onBeforeTextEdit?.();
		applyMentionToTextarea(el, queryState.start, insertText);
		onAfterTextEdit?.();
		closePicker();
	}

	export function isPickerOpen(): boolean {
		return open;
	}

	export function handleTextareaKeyDown(e: KeyboardEvent) {
		if (!open || !results.length) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			highlightedIndex = (highlightedIndex + 1) % results.length;
			return;
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			highlightedIndex = (highlightedIndex - 1 + results.length) % results.length;
			return;
		}
		if (e.key === 'Enter' || e.key === 'Tab') {
			e.preventDefault();
			const mention = results[highlightedIndex];
			if (mention) selectMention(mention);
			return;
		}
		if (e.key === 'Escape') {
			e.preventDefault();
			closePicker();
		}
	}

	export function insertAtSign() {
		const el = textarea;
		if (!el || !mentionEnabled) return;
		onBeforeTextEdit?.();
		insertTextAtTextareaCaret(el, '@');
		onAfterTextEdit?.();
		handleTextareaInput();
	}

	$effect(() => {
		if (!mentionEnabled) closePicker();
		return () => clearTimeout(debounceTimer);
	});
</script>

{#if open && mentionEnabled}
	<div
		class="border-base-300 bg-base-100 absolute top-full right-0 left-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border shadow-lg"
		role="listbox"
		aria-label="Mention suggestions"
	>
		{#if loading}
			<p class="text-base-content/60 px-3 py-2 text-xs">Searching…</p>
		{:else if results.length === 0}
			<p class="text-base-content/60 px-3 py-2 text-xs">No accounts found.</p>
		{:else}
			<ul class="divide-base-300/70 divide-y">
				{#each results as mention, index (mention.id)}
					<li>
						<button
							type="button"
							class="hover:bg-base-200/80 flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors {index ===
							highlightedIndex
								? 'bg-base-200/90'
								: ''}"
							role="option"
							aria-selected={index === highlightedIndex}
							onmousedown={(e) => e.preventDefault()}
							onclick={() => selectMention(mention)}
						>
							{#if mention.image}
								<img
									src={mention.image}
									alt=""
									class="size-7 shrink-0 rounded-full object-cover"
									loading="lazy"
								/>
							{:else}
								<span
									class="bg-base-300/70 text-base-content/70 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold uppercase"
									aria-hidden="true"
								>
									{mention.label.charAt(0) || '?'}
								</span>
							{/if}
							<span class="min-w-0 truncate">{mention.label}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
