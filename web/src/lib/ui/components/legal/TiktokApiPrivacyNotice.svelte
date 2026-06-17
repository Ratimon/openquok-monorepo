<script lang="ts">
	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();
</script>

<div
	role="note"
	aria-label="TikTok API privacy notice"
	class="rounded-lg border border-base-300 bg-base-200/50 px-4 py-3 text-sm leading-relaxed text-base-content/85 {className}"
>
	<p class="font-medium text-base-content">TikTok for Developers</p>
	<p class="mt-1.5">
		We use TikTok Login Kit and the Content Posting API when you connect a TikTok account. Your use is
		also subject to the
		<a
			href="https://www.tiktok.com/legal/terms-of-service"
			class="link link-hover"
			rel="noopener noreferrer"
			target="_blank"
		>
			TikTok Terms of Service
		</a>
		and
		<a
			href="https://www.tiktok.com/legal/privacy-policy"
			class="link link-hover"
			rel="noopener noreferrer"
			target="_blank"
		>
			TikTok Privacy Policy
		</a>. See our
		<a href="/privacy-policy#tiktok-api-services" class="link link-hover font-medium">Privacy Policy</a>
		for how we access, use, store, and share TikTok user data—including that we do not use it to train AI
		models.
	</p>
</div>
