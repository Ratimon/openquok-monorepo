<script lang="ts">
import { cn } from '$lib/ui/helpers/common';
import {
	normalizeSubredditFieldInput,
	normalizeSubredditInput,
	parseRedditCommunityInput,
	subredditInputValidationError,
	subredditSlugForField,
} from '$lib/utils/normalizeSubredditInput';

type Props = {
	id: string;
	value?: string;
	disabled?: boolean;
	class?: string;
};

let { id, value = $bindable(''), disabled = false, class: className = '' }: Props = $props();

/** Slug only — visual `r/` / `u/` prefix is separate; parent `value` stays canonical. */
let slugField = $state('');
let lastSyncedCanonical = $state('');

$effect(() => {
	if (value === lastSyncedCanonical) return;
	slugField = subredditSlugForField(value);
	lastSyncedCanonical = value;
});

const validationMessage = $derived(subredditInputValidationError(normalizeSubredditInput(slugField)));
const showError = $derived(Boolean(validationMessage) && Boolean(slugField.trim()));

const prefixHint = $derived.by(() => {
	const fromCanonical = parseRedditCommunityInput(value);
	if (fromCanonical?.kind === 'user') return 'u/';
	const pasted = parseRedditCommunityInput(slugField);
	if (pasted?.kind === 'user') return 'u/';
	return 'r/';
});

function normalizeSubredditOnBlur() {
	const trimmed = slugField.trim();
	if (!trimmed) {
		value = '';
		slugField = '';
		lastSyncedCanonical = '';
		return;
	}
	const { canonical, slug } = normalizeSubredditFieldInput(trimmed);
	value = canonical;
	lastSyncedCanonical = canonical;
	slugField = slug;
}

function normalizeSubredditOnPaste(event: ClipboardEvent) {
	event.preventDefault();
	const text = event.clipboardData?.getData('text/plain') ?? '';
	if (!text.trim()) return;
	const { canonical, slug } = normalizeSubredditFieldInput(text);
	value = canonical;
	lastSyncedCanonical = canonical;
	slugField = slug;
}
</script>

<div class={cn('space-y-1', className)}>
	<div class="relative flex">
		<span
			class="border-base-300 bg-base-200/60 text-base-content/60 inline-flex min-w-[2.25rem] items-center justify-center rounded-l-md border border-r-0 px-2 text-sm tabular-nums"
			aria-hidden="true"
		>
			{prefixHint}
		</span>
		<input
			{id}
			type="text"
			class={cn(
				'border-base-300 bg-base-100 w-full min-w-0 rounded-r-md border py-2 pr-3 pl-2 text-sm text-base-content shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
				showError && 'border-error focus-visible:border-error focus-visible:ring-error/30',
				disabled && 'text-base-content/60'
			)}
			placeholder="yoursubreddit"
			bind:value={slugField}
			{disabled}
			onblur={normalizeSubredditOnBlur}
			onpaste={normalizeSubredditOnPaste}
			aria-invalid={showError}
			aria-describedby={showError ? `${id}-error` : `${id}-hint`}
		/>
	</div>
	<p id="{id}-hint" class="text-xs text-base-content/50">
		Use <span class="font-mono">r/</span> for a subreddit or <span class="font-mono">u/</span> for your profile.
		Paste <span class="font-mono">r/name</span> or <span class="font-mono">u/name</span> — the prefix is stripped automatically.
	</p>
	{#if showError && validationMessage}
		<p id="{id}-error" class="text-xs text-error">{validationMessage}</p>
	{/if}
</div>
