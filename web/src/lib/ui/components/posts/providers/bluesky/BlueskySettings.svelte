<script lang="ts">
	import type { BlueskyThreadGateSetting } from '$lib/ui/components/posts/providers/provider.types';

	import ProviderHttpUrlInput from '$lib/ui/components/posts/providers/ProviderHttpUrlInput.svelte';
	import { normalizeHttpUrlInputIfLikely } from '$lib/utils/normalizeHttpUrlInput';

	type Props = {
		linkUrl?: string;
		linkTitle?: string;
		linkDescription?: string;
		quoteUrl?: string;
		threadGate?: BlueskyThreadGateSetting;
	};

	let {
		linkUrl = $bindable(''),
		linkTitle = $bindable(''),
		linkDescription = $bindable(''),
		quoteUrl = $bindable(''),
		threadGate = $bindable('everyone' as BlueskyThreadGateSetting)
	}: Props = $props();

	function normalizeLinkUrlOnBlur() {
		const trimmed = linkUrl.trim();
		if (!trimmed) return;
		const normalized = normalizeHttpUrlInputIfLikely(trimmed);
		if (normalized !== linkUrl) linkUrl = normalized;
	}

	const threadGateOptions: { value: BlueskyThreadGateSetting; label: string }[] = [
		{ value: 'everyone', label: 'Everyone can reply (default)' },
		{ value: 'mentioned', label: 'Accounts you mention' },
		{ value: 'following', label: 'Accounts you follow' },
		{ value: 'followers', label: 'Your followers' },
		{ value: 'nobody', label: 'Nobody' }
	];
</script>

<div class="space-y-4">
	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="bsky-thread-gate">
			Who can reply
		</label>
		<select
			id="bsky-thread-gate"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			bind:value={threadGate}
		>
			{#each threadGateOptions as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	</div>

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="bsky-quote-url">
			Quote post (bsky.app URL)
		</label>
		<ProviderHttpUrlInput
			id="bsky-quote-url"
			placeholder="https://bsky.app/profile/handle/post/…"
			bind:value={quoteUrl}
		/>
		<p class="text-xs text-base-content/50">
			Optional quote of another Bluesky post. Not combined with media or link cards.
		</p>
	</div>

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="bsky-link-url">
			Link card URL
		</label>
		<ProviderHttpUrlInput
			id="bsky-link-url"
			placeholder="https://example.com/article"
			bind:value={linkUrl}
			onblur={normalizeLinkUrlOnBlur}
		/>
		<p class="text-xs text-base-content/50">
			Optional external link preview for text-only posts without attachments.
		</p>
	</div>

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="bsky-link-title">
			Link title (optional)
		</label>
		<input
			id="bsky-link-title"
			type="text"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			placeholder="Page title"
			bind:value={linkTitle}
		/>
	</div>

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="bsky-link-description">
			Link description (optional)
		</label>
		<textarea
			id="bsky-link-description"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			rows="2"
			placeholder="Short summary for the link card"
			bind:value={linkDescription}
		></textarea>
	</div>
</div>
