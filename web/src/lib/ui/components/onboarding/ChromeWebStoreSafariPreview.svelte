<script lang="ts">
	import SafariMock from '$lib/ui/templates/device-mocks/safari/SafariMock.svelte';
	import SafariMockContent from '$lib/ui/templates/device-mocks/safari/SafariMockContent.svelte';

	type Props = {
		href: string;
		mockUrl?: string;
		class?: string;
	};

	let { href, mockUrl = 'chromewebstore.google.com', class: className = '' }: Props = $props();
</script>

<a
	{href}
	target="_blank"
	rel="noopener noreferrer"
	class="group block overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-md ring-1 ring-base-content/5 transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary {className}"
	aria-label="Open OpenQuok on the Chrome Web Store"
>
	<div class="aspect-[12/7] w-full min-h-[200px] max-h-[280px]">
		<SafariMock class="size-full" url={mockUrl}>
			<SafariMockContent content="chrome-web-store-openquok" />
		</SafariMock>
	</div>
	<p
		class="border-t border-base-300 bg-base-200/50 px-3 py-2 text-center text-xs font-medium text-base-content/70 transition-colors group-hover:text-primary"
	>
		Open Chrome Web Store
	</p>
</a>
