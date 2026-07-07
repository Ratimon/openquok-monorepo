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
		hubLabelClass?: string;
		owner?: Owner;
		pageTitle: string;
		class?: string;
	};

	let {
		hubHref,
		hubLabel,
		hubLabelClass = 'text-sm',
		owner = null,
		pageTitle,
		class: className = ''
	}: Props = $props();

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
			<Breadcrumb.Link
				href={hubHref}
				class={cn('text-primary hover:text-primary/80 no-underline font-bold tracking-wider text-primary uppercase', hubLabelClass)}
			>
				{hubLabel}
			</Breadcrumb.Link>
		</Breadcrumb.Item>
		{#if creatorHref && creatorLabel}
			<Breadcrumb.Separator class="text-primary/60" />
			<Breadcrumb.Item>
				<Breadcrumb.Link
					href={creatorHref}
					class="text-primary hover:text-primary/80 line-clamp-1 text-sm no-underline"
				>
					{creatorLabel}
				</Breadcrumb.Link>
			</Breadcrumb.Item>
		{/if}
		<Breadcrumb.Separator class="text-primary/60" />
		<Breadcrumb.Item>
			<Breadcrumb.Page class="text-primary line-clamp-1 text-sm">{pageTitle}</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>
