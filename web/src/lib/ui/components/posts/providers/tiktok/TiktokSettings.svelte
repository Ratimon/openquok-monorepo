<script lang="ts">
	import type {
		TiktokContentPostingMethod,
		TiktokPrivacyLevel
	} from '$lib/ui/components/posts/providers/provider.types';

	import { TIKTOK_PHOTO_TITLE_MAX } from '$lib/ui/components/posts/providers/tiktok/tiktok.provider';

	type Props = {
		privacyLevel?: TiktokPrivacyLevel;
		contentPostingMethod?: TiktokContentPostingMethod;
		title?: string;
		duet?: boolean;
		stitch?: boolean;
		comment?: boolean;
		autoAddMusic?: boolean;
		brandContentToggle?: boolean;
		brandOrganicToggle?: boolean;
		videoMadeWithAi?: boolean;
		/** Business API: trending audio sound id (DIRECT_POST only). */
		musicSoundId?: string;
		/** Business API: location / POI id (DIRECT_POST only). */
		poiId?: string;
		/** Content API vs Business Marketing API — controls business-only fields. */
		variant?: 'content' | 'business';
		disabled?: boolean;
	};

	let {
		privacyLevel = $bindable<TiktokPrivacyLevel>('PUBLIC_TO_EVERYONE'),
		contentPostingMethod = $bindable<TiktokContentPostingMethod>('DIRECT_POST'),
		title = $bindable(''),
		duet = $bindable(true),
		stitch = $bindable(true),
		comment = $bindable(true),
		autoAddMusic = $bindable(false),
		brandContentToggle = $bindable(false),
		brandOrganicToggle = $bindable(false),
		videoMadeWithAi = $bindable(false),
		musicSoundId = $bindable(''),
		poiId = $bindable(''),
		variant = 'content',
		disabled = false
	}: Props = $props();

	const isBusiness = $derived(variant === 'business');
</script>

<div class="space-y-4">
	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="tt-privacy">Privacy</label>
		<select
			id="tt-privacy"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			bind:value={privacyLevel}
			{disabled}
		>
			<option value="PUBLIC_TO_EVERYONE">Public</option>
			<option value="MUTUAL_FOLLOW_FRIENDS">Friends (mutual followers)</option>
			<option value="FOLLOWER_OF_CREATOR">Followers</option>
			<option value="SELF_ONLY">Only me (private)</option>
		</select>
	</div>

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="tt-posting-method">Posting method</label>
		<select
			id="tt-posting-method"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			bind:value={contentPostingMethod}
			{disabled}
		>
			<option value="DIRECT_POST">Direct post (publish to profile)</option>
			<option value="UPLOAD">Upload to inbox (finish in TikTok app)</option>
		</select>
	</div>

	{#if contentPostingMethod === 'DIRECT_POST' && !isBusiness}
		<div
			class="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs leading-relaxed text-base-content/80"
			role="note"
		>
			<strong class="font-medium text-base-content">Unaudited TikTok app?</strong>
			Direct post needs <strong>Only me (private)</strong> above <em>and</em> your TikTok profile set to
			<strong>Private</strong> in the TikTok app (Settings → Privacy). Inbox upload does not require a private
			account. After TikTok approves Content Posting API access, you can post publicly again.
		</div>
	{/if}

	{#if isBusiness && contentPostingMethod === 'DIRECT_POST'}
		<div class="space-y-3">
			<div class="text-xs font-medium text-base-content/70">Business direct post</div>
			<div class="space-y-1">
				<label class="text-xs font-medium text-base-content/70" for="tt-music-sound-id">
					Trending audio sound ID (optional)
				</label>
				<input
					id="tt-music-sound-id"
					type="text"
					class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
					placeholder="Sound ID from TikTok Business"
					bind:value={musicSoundId}
					{disabled}
				/>
				<p class="text-xs text-base-content/50">
					Attach commercial or trending audio on direct posts. Leave blank to use the video&apos;s original
					sound.
				</p>
			</div>
			<div class="space-y-1">
				<label class="text-xs font-medium text-base-content/70" for="tt-poi-id">
					Location POI ID (optional)
				</label>
				<input
					id="tt-poi-id"
					type="text"
					class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
					placeholder="Point-of-interest ID"
					bind:value={poiId}
					{disabled}
				/>
				<p class="text-xs text-base-content/50">
					Tag a location on direct posts when your Business account supports it.
				</p>
			</div>
		</div>
	{/if}

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="tt-title">Photo title (optional)</label>
		<input
			id="tt-title"
			type="text"
			maxlength={TIKTOK_PHOTO_TITLE_MAX}
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			placeholder="Title or caption (max 2000 characters)"
			bind:value={title}
			{disabled}
		/>
		<p class="text-xs text-base-content/50">
			Used for carousels; video posts use the caption as description.
		</p>
	</div>

	<div class="space-y-2">
		<div class="text-xs font-medium text-base-content/70">Interactions</div>
		<label class="flex items-center gap-2 text-sm text-base-content/80">
			<input type="checkbox" class="checkbox checkbox-primary checkbox-sm" bind:checked={duet} {disabled} />
			Allow duet
		</label>
		<label class="flex items-center gap-2 text-sm text-base-content/80">
			<input type="checkbox" class="checkbox checkbox-primary checkbox-sm" bind:checked={stitch} {disabled} />
			Allow stitch
		</label>
		<label class="flex items-center gap-2 text-sm text-base-content/80">
			<input type="checkbox" class="checkbox checkbox-primary checkbox-sm" bind:checked={comment} {disabled} />
			Allow comments
		</label>
		{#if !isBusiness}
			<label class="flex items-center gap-2 text-sm text-base-content/80">
				<input
					type="checkbox"
					class="checkbox checkbox-primary checkbox-sm"
					bind:checked={autoAddMusic}
					{disabled}
				/>
				Auto-add music (photo posts)
			</label>
		{/if}
	</div>

	<div class="space-y-2">
		<div class="text-xs font-medium text-base-content/70">Brand disclosure</div>
		<label class="flex items-center gap-2 text-sm text-base-content/80">
			<input
				type="checkbox"
				class="checkbox checkbox-primary checkbox-sm"
				bind:checked={brandContentToggle}
				{disabled}
			/>
			Branded content (paid partnership)
		</label>
		<label class="flex items-center gap-2 text-sm text-base-content/80">
			<input
				type="checkbox"
				class="checkbox checkbox-primary checkbox-sm"
				bind:checked={brandOrganicToggle}
				{disabled}
			/>
			Your brand
		</label>
	</div>

	<div class="space-y-2">
		<div class="text-xs font-medium text-base-content/70">AI-generated content</div>
		<label class="flex items-start gap-2 text-sm text-base-content/80">
			<input
				type="checkbox"
				class="checkbox checkbox-primary checkbox-sm mt-0.5"
				bind:checked={videoMadeWithAi}
				{disabled}
			/>
			<span>
				<span class="block">Disclose AI-generated content</span>
				<span class="mt-0.5 block text-xs text-base-content/50">
					Add this label to tell viewers the post was generated or edited with AI.
				</span>
			</span>
		</label>
		<div
			class="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs leading-relaxed text-base-content/80"
			role="note"
		>
			<strong class="font-medium text-base-content">Required disclosure.</strong>
			If this post was generated or edited with AI and you do not label it, TikTok may keep it
			out of distribution (including For You).
		</div>
	</div>
</div>
