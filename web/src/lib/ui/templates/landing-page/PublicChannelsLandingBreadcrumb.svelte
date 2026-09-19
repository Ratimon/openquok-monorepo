<script lang="ts">
	import { page } from '$app/state';

	import { getRootPathPublicChannels } from '$lib/area-public/constants/getRootPathPublicChannels';
	import { PUBLIC_LANDING_BREADCRUMB } from '$lib/content/constants/publicLandingBreadcrumbConfig';
	import PublicLandingHubBreadcrumb, {
		type PublicLandingHubBreadcrumbItem
	} from '$lib/ui/templates/landing-page/PublicLandingHubBreadcrumb.svelte';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	type Props = {
		platformLabel?: string | null;
		class?: string;
	};

	let { platformLabel = null, class: className = '' }: Props = $props();

	const channelsHubHref = $derived(
		hostedMarketingHref(route(getRootPathPublicChannels()), page.url.origin)
	);

	const items = $derived.by((): PublicLandingHubBreadcrumbItem[] => {
		const trimmedPlatformLabel = platformLabel?.trim() ?? '';

		if (trimmedPlatformLabel) {
			return [
				{ label: PUBLIC_LANDING_BREADCRUMB.supportedChannels, href: channelsHubHref },
				{ label: trimmedPlatformLabel }
			];
		}

		return [{ label: PUBLIC_LANDING_BREADCRUMB.supportedChannels }];
	});
</script>

<PublicLandingHubBreadcrumb {items} class={className} />
