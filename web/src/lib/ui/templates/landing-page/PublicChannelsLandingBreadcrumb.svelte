<script lang="ts">
	import { page } from '$app/state';

	import { getRootPathPublicChannels } from '$lib/area-public/constants/getRootPathPublicChannels';
	import type { PublicChannelKind } from '$lib/content/constants/channels/catalog/types';
	import {
		PUBLIC_CHANNELS_HUB_SECTION_IDS,
		PUBLIC_LANDING_BREADCRUMB
	} from '$lib/content/constants/landing/breadcrumbs';
	import PublicLandingHubBreadcrumb, {
		type PublicLandingHubBreadcrumbItem
	} from '$lib/ui/templates/landing-page/PublicLandingHubBreadcrumb.svelte';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	type Props = {
		platformLabel?: string | null;
		channelKind?: PublicChannelKind | null;
		class?: string;
	};

	let { platformLabel = null, channelKind = null, class: className = '' }: Props = $props();

	const homeHref = $derived(hostedMarketingHref('/', page.url.origin));

	const channelsHubHref = $derived.by(() => {
		const hubPath = route(getRootPathPublicChannels());
		const trimmedPlatformLabel = platformLabel?.trim() ?? '';
		if (trimmedPlatformLabel.length === 0) {
			return hostedMarketingHref(hubPath, page.url.origin);
		}
		const hubSectionId =
			channelKind === 'directory'
				? PUBLIC_CHANNELS_HUB_SECTION_IDS.directoryLaunchPlatforms
				: PUBLIC_CHANNELS_HUB_SECTION_IDS.socialMediaPlatforms;
		return hostedMarketingHref(`${hubPath}#${hubSectionId}`, page.url.origin);
	});

	const items = $derived.by((): PublicLandingHubBreadcrumbItem[] => {
		const trimmedPlatformLabel = platformLabel?.trim() ?? '';

		if (trimmedPlatformLabel) {
			return [
				{ label: 'Home', href: homeHref },
				{ label: PUBLIC_LANDING_BREADCRUMB.supportedChannels, href: channelsHubHref },
				{ label: trimmedPlatformLabel }
			];
		}

		return [
			{ label: 'Home', href: homeHref },
			{ label: PUBLIC_LANDING_BREADCRUMB.supportedChannels }
		];
	});
</script>

<PublicLandingHubBreadcrumb {items} class={className} />
