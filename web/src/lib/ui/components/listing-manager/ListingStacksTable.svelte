<script lang="ts">
	import ListingExtensionsTable, {
		type ListingTableItem
	} from '$lib/ui/components/listing-manager/ListingExtensionsTable.svelte';
	import type { ActionVerificationModalPresenter } from '$lib/core/ActionVerificationModal.presenter.svelte';

	type Props = {
		listings: ListingTableItem[];
		getEditHref: (listing: ListingTableItem) => string;
		onListingDeleted: (listing: ListingTableItem) => void | Promise<void>;
		deleteVerificationPresenter?: ActionVerificationModalPresenter;
	};

	let props: Props = $props();
</script>

<ListingExtensionsTable {...props} itemLabel="stacks" />
