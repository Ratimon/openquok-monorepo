<script lang="ts">
	import PageLink from '$lib/ui/nav-bars/PageLink.svelte';

	type Props = {
		class?: string;
		/** When true, mention browser-extension session channels (Skool, etc.). */
		browserExtension?: boolean;
	};

	let { class: className = '', browserExtension = false }: Props = $props();
</script>

<div
	role="note"
	aria-label="Channel connection terms"
	class="text-sm leading-relaxed text-base-content/70 {className}"
>
	By connecting a channel, you agree to our
	<PageLink href="/terms" class="link link-hover font-medium text-base-content/85">Terms</PageLink>
	and
	<PageLink href="/privacy-policy" class="link link-hover font-medium text-base-content/85">
		Privacy Policy
	</PageLink	>. Platform-specific terms apply when you authorize access.
	{#if browserExtension}
		Browser-extension channels use your existing platform login in Chrome; see our
		<PageLink href="/privacy-policy" class="link link-hover font-medium text-base-content/85">
			Privacy Policy
		</PageLink>
		for how session identifiers are handled.
	{/if}
</div>
