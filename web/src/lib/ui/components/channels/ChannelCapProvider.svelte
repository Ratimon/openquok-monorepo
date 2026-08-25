<script lang="ts">
	import type { Snippet } from 'svelte';

	import { setContext } from 'svelte';

	import { protectedHomePagePresenter, getRootPathAccount } from '$lib/area-protected';
	import { firstBillingGatePresenter } from '$lib/billing';
	import { route, url } from '$lib/utils/path';

	import ChannelLimitUpgradeModal from '$lib/ui/components/channels/ChannelLimitUpgradeModal.svelte';
	import {
		channelCapKey,
		countActiveChannels,
		resolveChannelLimit,
		type ChannelCapContext
	} from '$lib/ui/components/channels/channelCapContext';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	let connectedUpgradeDialogOpen = $state(false);
	let activeUpgradeDialogOpen = $state(false);

	const billingHref = $derived(url(`${route(getRootPathAccount())}/billing`));

	function readConnectedChannelCount(): number {
		return protectedHomePagePresenter.connectedChannelsVm.length;
	}

	function readActiveChannelCount(): number {
		return countActiveChannels(protectedHomePagePresenter.connectedChannelsVm);
	}

	function readChannelLimit(): number | null {
		return resolveChannelLimit(
			firstBillingGatePresenter.pricingVm?.currentVm?.limits?.channelPerWorkspace ?? null
		);
	}

	function readIsConnectedChannelLimitFull(): boolean {
		const limit = readChannelLimit();
		if (limit == null) return false;
		return readConnectedChannelCount() >= limit;
	}

	function readIsActiveChannelLimitFull(): boolean {
		const limit = readChannelLimit();
		if (limit == null) return false;
		return readActiveChannelCount() >= limit;
	}

	function readCanEnableChannel(): boolean {
		const limit = readChannelLimit();
		if (limit == null) return true;
		return readActiveChannelCount() < limit;
	}

	function openConnectedLimitUpgradeDialog() {
		connectedUpgradeDialogOpen = true;
	}

	function openActiveLimitUpgradeDialog() {
		activeUpgradeDialogOpen = true;
	}

	setContext(channelCapKey, {
		getConnectedChannelCount: readConnectedChannelCount,
		getActiveChannelCount: readActiveChannelCount,
		getChannelLimit: readChannelLimit,
		isConnectedChannelLimitFull: readIsConnectedChannelLimitFull,
		isActiveChannelLimitFull: readIsActiveChannelLimitFull,
		canEnableChannel: readCanEnableChannel,
		openConnectedLimitUpgradeDialog,
		openActiveLimitUpgradeDialog
	} satisfies ChannelCapContext);
</script>

{@render children()}

<ChannelLimitUpgradeModal
	bind:open={connectedUpgradeDialogOpen}
	upgradeHref={billingHref}
	variant="connected"
/>
<ChannelLimitUpgradeModal
	bind:open={activeUpgradeDialogOpen}
	upgradeHref={billingHref}
	variant="active"
/>
