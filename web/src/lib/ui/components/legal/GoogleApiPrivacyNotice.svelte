<script lang="ts">
	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();
</script>

<p class="text-xs leading-relaxed text-base-content/70 {className}">
	For YouTube, we use YouTube API Services. Your use is also subject to the
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
	</a>. See our
	<a href="/privacy-policy#google-api-services" class="link link-hover">Privacy Policy</a>
	for how we access, use, and store Google user data.
</p>
