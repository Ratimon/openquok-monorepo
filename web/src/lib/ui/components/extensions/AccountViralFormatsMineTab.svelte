<script lang="ts">
	import type { AccountListingCollectionItemViewModel } from '$lib/area-protected/ProtectedAccountExtensionsPage.presenter.svelte';

	import AccountViralFormatsStackSelectionBar from '$lib/ui/components/extensions/AccountViralFormatsStackSelectionBar.svelte';
	import AccountListingsCollectionGroup from '$lib/ui/components/extensions/AccountListingsCollectionGroup.svelte';

	type MenuItemFactory = (item: AccountListingCollectionItemViewModel) => Array<{
		label: string;
		onSelect: () => void;
		destructive?: boolean;
		disabled?: boolean;
	}>;

	type Props = {
		extensions: AccountListingCollectionItemViewModel[];
		stacks: AccountListingCollectionItemViewModel[];
		loading?: boolean;
		selectableExtensions?: boolean;
		isSelected?: (listingId: string) => boolean;
		onToggleSelect?: (listingId: string) => void;
		getEditHref?: (item: AccountListingCollectionItemViewModel) => string;
		getMenuItems?: MenuItemFactory;
		selectedCount?: number;
		onCreateStack?: () => void;
		onClearSelection?: () => void;
	};

	let {
		extensions,
		stacks,
		loading = false,
		selectableExtensions = false,
		isSelected = () => false,
		onToggleSelect,
		getEditHref,
		getMenuItems,
		selectedCount = 0,
		onCreateStack,
		onClearSelection
	}: Props = $props();
</script>

<div class="space-y-6">
	<AccountViralFormatsStackSelectionBar
		{selectedCount}
		onCreateStack={onCreateStack}
		onClearSelection={onClearSelection}
	/>

	<AccountListingsCollectionGroup
		label="Building blocks"
		description="Check Add on one or more building blocks to include them in a new playbook."
		items={extensions}
		{loading}
		layout="grid"
		emptyMessage="No building blocks yet. Submit a skills or MCP listing for the hub."
		{selectableExtensions}
		{isSelected}
		{onToggleSelect}
		{getEditHref}
		{getMenuItems}
		showPublishStatus={true}
	/>
	<AccountListingsCollectionGroup
		label="Playbooks"
		items={stacks}
		{loading}
		layout="grid"
		emptyMessage="No playbooks yet. Compose building blocks into a playbook draft."
		{getEditHref}
		{getMenuItems}
		showPublishStatus={true}
	/>
</div>
