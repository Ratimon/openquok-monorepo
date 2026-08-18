<script lang="ts">
	import { page } from '$app/state';
	import { icons } from '$data/icons';
	import { prepareBlogRichTextForDisplay } from '$lib/blogs/utils/prepareBlogContentForDisplay';
	import { rewriteHtmlHostedMarketingHrefs } from '$lib/utils/hostedMarketingHref';
	import * as Accordion from '$lib/ui/accordion';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		title: string;
		description: string;
	};

	let { title, description }: Props = $props();

	let expanded = $state(false);

	/** Admin / git-managed FAQ HTML only (prepared + link policy applied). */
	const htmlDescription = $derived(
		rewriteHtmlHostedMarketingHrefs(
			prepareBlogRichTextForDisplay(description),
			page.url.origin
		)
	);
</script>

<Accordion.Root class="w-full">
	<Accordion.Item bind:open={expanded} class="rounded-lg border border-base-300 bg-base-100 p-6">
		<Accordion.Trigger class="flex cursor-pointer justify-center text-xl">
			<div class="flex-1 text-left">{title}</div>
			<div class="flex h-8 w-8 items-center justify-center" aria-hidden="true">
				<AbstractIcon
					name={expanded ? icons.Minus.name : icons.Plus.name}
					width={expanded ? '32' : '24'}
					height={expanded ? '32' : '24'}
				/>
			</div>
		</Accordion.Trigger>
		<Accordion.Content class="overflow-hidden transition-all duration-500">
			<div
				class="mt-4 max-w-lg text-base font-normal text-base-content/70 select-text [&_p]:m-0 [&_p+p]:mt-3 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-90"
			>
				{@html htmlDescription}
			</div>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
