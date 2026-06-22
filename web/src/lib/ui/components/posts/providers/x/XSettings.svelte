<script lang="ts">
	import type { XReplySetting } from '$lib/ui/components/posts/providers/provider.types';

	type Props = {
		whoCanReplyPost?: XReplySetting | '';
		communityUrl?: string;
		madeWithAi?: boolean;
		paidPartnership?: boolean;
	};

	let {
		whoCanReplyPost = $bindable(''),
		communityUrl = $bindable(''),
		madeWithAi = $bindable(false),
		paidPartnership = $bindable(false)
	}: Props = $props();

	const replyOptions: { value: XReplySetting | ''; label: string }[] = [
		{ value: '', label: 'Everyone (default)' },
		{ value: 'following', label: 'Accounts you follow' },
		{ value: 'mentionedUsers', label: 'Accounts you mention' },
		{ value: 'subscribers', label: 'Subscribers only' },
		{ value: 'verified', label: 'Verified accounts only' }
	];
</script>

<div class="space-y-4">
	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="x-who-can-reply">
			Who can reply
		</label>
		<select
			id="x-who-can-reply"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			bind:value={whoCanReplyPost}
		>
			{#each replyOptions as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	</div>

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="x-community-url">
			Community URL (optional)
		</label>
		<input
			id="x-community-url"
			type="url"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			placeholder="https://x.com/i/communities/123456789"
			bind:value={communityUrl}
		/>
		<p class="text-xs text-base-content/50">
			Post into an X community when the URL is valid.
		</p>
	</div>

	<label class="flex items-center gap-2 text-sm text-base-content/80">
		<input type="checkbox" class="checkbox checkbox-primary checkbox-sm" bind:checked={madeWithAi} />
		Made with AI
	</label>

	<label class="flex items-center gap-2 text-sm text-base-content/80">
		<input
			type="checkbox"
			class="checkbox checkbox-primary checkbox-sm"
			bind:checked={paidPartnership}
		/>
		Paid partnership
	</label>
</div>
