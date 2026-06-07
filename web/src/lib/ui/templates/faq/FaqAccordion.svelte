<script lang="ts">
	import { icons } from '$data/icons';
	import * as Accordion from '$lib/ui/accordion';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		title: string;
		description: string;
	};

	let { title, description }: Props = $props();

	let expanded = $state(false);
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
			<div class="mt-4 max-w-lg text-base font-normal text-base-content/70 select-text">
				{@html description}
			</div>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
