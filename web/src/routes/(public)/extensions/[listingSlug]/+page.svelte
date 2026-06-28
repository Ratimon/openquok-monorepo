<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	import { publicExtensionBySlugPagePresenter } from '$lib/area-public/index';

	import ExtensionDetailPage from '$lib/ui/templates/extensions/ExtensionDetailPage.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let extensionVm = $derived(data.extensionVm);
	let relatedExtensionsVm = $derived(data.relatedExtensionsVm);
	let schemaData = $derived(data.schemaData);

	onMount(() => {
		if (!browser || !extensionVm?.id) return;
		void publicExtensionBySlugPagePresenter.trackExtensionView(extensionVm.id);
	});
</script>

<JsonLdHead schemaData={schemaData} />

<ExtensionDetailPage extension={extensionVm} relatedExtensions={relatedExtensionsVm} />
