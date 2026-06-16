<script lang="ts">
	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();
</script>

<div
	role="note"
	aria-label="YouTube API Services privacy notice"
	class="rounded-lg border border-base-300 bg-base-200/50 px-4 py-3 text-sm leading-relaxed text-base-content/85 {className}"
>
	<p class="font-medium text-base-content">YouTube API Services</p>
	<p class="mt-1.5">
		We use YouTube API Services when you connect a YouTube channel. Your use is also subject to the
		<a
			href="https://www.youtube.com/t/terms"
			class="link link-hover"
			rel="noopener noreferrer"
			target="_blank"
		>
			YouTube Terms of Service
		</a>
		and
		<a
			href="https://policies.google.com/privacy"
			class="link link-hover"
			rel="noopener noreferrer"
			target="_blank"
		>
			Google Privacy Policy
		</a>. Our use of Google user data follows the
		<a
			href="https://developers.google.com/terms/api-services-user-data-policy"
			class="link link-hover"
			rel="noopener noreferrer"
			target="_blank"
		>
			Google API Services User Data Policy
		</a>
		(Limited Use). See our
		<a href="/privacy-policy#google-api-services" class="link link-hover font-medium">Privacy Policy</a>
		for how we access, use, store, and share Google user data—including that we do not use it to train AI
		models.
	</p>
</div>
