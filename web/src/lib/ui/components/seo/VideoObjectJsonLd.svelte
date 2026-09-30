<script lang="ts">
	import {
		createYoutubeVideoObjectSchema,
		type CreateYoutubeVideoObjectSchemaParams
	} from '$lib/seo/createYoutubeVideoObjectSchema';
	import { createJsonLdWithContext } from '$lib/seo/jsonLdSchema';
	import { jsonLdScriptHtml } from '$lib/seo/jsonLdScriptHtml';

	type Props = {
		videoObject: CreateYoutubeVideoObjectSchemaParams;
	};

	let { videoObject }: Props = $props();

	let schemaData = $derived.by(() => {
		const node = createYoutubeVideoObjectSchema(videoObject);
		if (!node || !('@type' in node)) {
			return null;
		}
		return createJsonLdWithContext(node);
	});
</script>

<svelte:head>
	{#if schemaData != null}
		{@html jsonLdScriptHtml(schemaData)}
	{/if}
</svelte:head>
