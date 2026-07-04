<script lang="ts">
	import { getRootPathPublicCreator } from '$lib/area-public/constants/getRootPathPublicCreators';
	import { listingOwnerDisplayName } from '$lib/area-public/utils/resolvePublicListingPaths';
	import { cn } from '$lib/ui/helpers/common';
	import { url } from '$lib/utils/path';

	import * as Breadcrumb from '$lib/ui/breadcrumb';

	type Owner = {
		username: string | null;
		fullName?: string | null;
	} | null;

	type Props = {
		hubHref: string;
		hubLabel: string;
		owner?: Owner;
		pageTitle: string;
		class?: string;
	};

	let { hubHref, hubLabel, owner = null, pageTitle, class: className = '' }: Props = $props();

	const creatorLabel = $derived(listingOwnerDisplayName(owner));
	const creatorHref = $derived(
		owner?.username?.trim()
			? url(`/${getRootPathPublicCreator(owner.username.trim())}`)
			: null
	);
</script>

<Breadcrumb.Root class={cn('max-w-full', className)}>
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href={hubHref} class="text-sm">{hubLabel}</Breadcrumb.Link>
		</Breadcrumb.Item>
		{#if creatorHref && creatorLabel}
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Link href={creatorHref} class="line-clamp-1 text-sm">{creatorLabel}</Breadcrumb.Link>
			</Breadcrumb.Item>
		{/if}
		<Breadcrumb.Separator />
		<Breadcrumb.Item>
			<Breadcrumb.Page class="line-clamp-1 text-sm">{pageTitle}</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>
