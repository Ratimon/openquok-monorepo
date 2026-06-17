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
		disabled = false
	}: Props = $props();
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
		<p class="text-xs text-base-content/50">
			Unaudited TikTok apps may force posts to private until app review passes.
		</p>
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

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="tt-title">Photo title (optional)</label>
		<input
			id="tt-title"
			type="text"
			maxlength={TIKTOK_PHOTO_TITLE_MAX}
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			placeholder="Title for photo posts (falls back to caption)"
			bind:value={title}
			{disabled}
		/>
		<p class="text-xs text-base-content/50">
			Used for photo carousels; video posts use the caption as description.
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
		<label class="flex items-center gap-2 text-sm text-base-content/80">
			<input
				type="checkbox"
				class="checkbox checkbox-primary checkbox-sm"
				bind:checked={autoAddMusic}
				{disabled}
			/>
			Auto-add music (photo posts)
		</label>
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
			Your brand (promoting yourself or your business)
		</label>
	</div>

	<label class="flex items-center gap-2 text-sm text-base-content/80">
		<input
			type="checkbox"
			class="checkbox checkbox-primary checkbox-sm"
			bind:checked={videoMadeWithAi}
			{disabled}
		/>
		Disclose AI-generated content
	</label>
</div>
