<script lang="ts">
	import type {
		AccountGettingStartedAutomationLink,
		AccountGettingStartedChecklistItem
	} from '$lib/ui/components/home/accountGettingStarted.types';

	import Button from '$lib/ui/buttons/Button.svelte';

	import AccountGettingStartedAutomationPanel from '$lib/ui/components/home/AccountGettingStartedAutomationPanel.svelte';
	import AccountGettingStartedChecklistPanel from '$lib/ui/components/home/AccountGettingStartedChecklistPanel.svelte';

	type Props = {
		onDismiss: () => void;
		checklistItems: AccountGettingStartedChecklistItem[];
		automationLinks: AccountGettingStartedAutomationLink[];
	};

	let { onDismiss, checklistItems, automationLinks }: Props = $props();
</script>

<section class="mb-6 overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
	<header
		class="flex flex-col gap-3 border-b border-base-300 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
	>
		<div>
			<h2 class="text-lg font-semibold text-base-content">Getting started</h2>
			<p class="mt-0.5 text-sm text-base-content/65">
				Set up your workspace, schedule posts, and connect agents.
			</p>
		</div>
		<Button type="button" variant="ghost" size="sm" class="shrink-0 self-start" onclick={onDismiss}>
			Don't show this
		</Button>
	</header>

	<div class="grid divide-y divide-base-300 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
		<div class="px-5 py-5">
			<AccountGettingStartedChecklistPanel {checklistItems} />
		</div>
		<div class="px-5 py-5">
			<AccountGettingStartedAutomationPanel {automationLinks} />
		</div>
	</div>
</section>
