<script lang="ts">
	import type {
		AccountGettingStartedAutomationLink,
		AccountGettingStartedChecklistItem
	} from '$lib/ui/components/home/accountGettingStarted.types';

	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import * as Tabs from '$lib/ui/tabs';

	import AccountGettingStartedAutomationPanel from '$lib/ui/components/home/AccountGettingStartedAutomationPanel.svelte';
	import AccountGettingStartedChecklistPanel from '$lib/ui/components/home/AccountGettingStartedChecklistPanel.svelte';

	const MODAL_CONTENT_CLASS =
		'flex max-h-[min(90vh,720px)] w-full max-w-[min(96vw,42rem)] flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-2xl';

	type Props = {
		open?: boolean;
		checklistItems: AccountGettingStartedChecklistItem[];
		automationLinks: AccountGettingStartedAutomationLink[];
		onDismiss: () => void;
	};

	let {
		open = $bindable(false),
		checklistItems,
		automationLinks,
		onDismiss
	}: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class={MODAL_CONTENT_CLASS}>
		<Dialog.Header class="gap-1 border-b border-base-300 px-5 pb-4 pe-12 pt-5">
			<Dialog.Title class="text-lg font-semibold text-base-content">Getting started</Dialog.Title>
			<Dialog.Description class="text-sm text-base-content/65">
				Set up your workspace, schedule posts, and connect agents.
			</Dialog.Description>
		</Dialog.Header>

		<Tabs.Root defaultValue="checklist" class="flex min-h-0 flex-1 flex-col">
			<Tabs.List class="mx-5 mt-4 grid w-auto grid-cols-2 gap-1 rounded-lg bg-base-200 p-1">
				<Tabs.Trigger value="checklist" class="rounded-md text-sm">Checklist</Tabs.Trigger>
				<Tabs.Trigger value="automate" class="rounded-md text-sm">Automate</Tabs.Trigger>
			</Tabs.List>
			<div class="min-h-0 flex-1 overflow-y-auto px-5 py-5">
				<Tabs.Content value="checklist">
					<AccountGettingStartedChecklistPanel {checklistItems} />
				</Tabs.Content>
				<Tabs.Content value="automate">
					<AccountGettingStartedAutomationPanel {automationLinks} />
				</Tabs.Content>
			</div>
		</Tabs.Root>

		<div
			class="flex flex-col gap-2 border-t border-base-300 bg-base-200/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
		>
			<p class="text-xs text-base-content/55 sm:max-w-[55%]">
				Hides the getting started card on your dashboard. Use <span class="font-medium text-base-content/70"
					>Reset product tour</span
				> in the sidebar to bring it back.
			</p>
			<Button type="button" variant="warning" size="sm" class="shrink-0" onclick={onDismiss}>
				Don't show this again
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
