<script lang="ts">
	import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import { getRootPathPublicPlaybooks } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
	import { cn } from '$lib/ui/helpers/common';
	import { route, url } from '$lib/utils/path';

	type ActiveHub = 'playbooks' | 'building-blocks';

	type Props = {
		active: ActiveHub;
		class?: string;
	};

	let { active, class: className = '' }: Props = $props();

	// /playbooks
	const rootPathPublicPlaybooks = getRootPathPublicPlaybooks();
	const playbooksHubPath = route(rootPathPublicPlaybooks);
	const playbooksHubHref = url(playbooksHubPath);

	// /building-blocks
	const rootPathPublicBuildingBlocks = getRootPathPublicBuildingBlocks();
	const buildingBlocksHubPath = route(rootPathPublicBuildingBlocks);
	const buildingBlocksHubHref = url(buildingBlocksHubPath);

	const links = [
		{ id: 'playbooks' as const, label: 'Playbooks', href: playbooksHubHref },
		{ id: 'building-blocks' as const, label: 'Building Blocks', href: buildingBlocksHubHref }
	];
</script>

<nav
	class={cn('flex flex-wrap justify-center gap-2', className)}
	aria-label="Playbooks and building blocks"
>
	{#each links as link (link.id)}
		<a
			href={link.href}
			class={cn(
				'btn btn-sm rounded-full',
				active === link.id ? 'btn-primary' : 'btn-ghost border border-base-content/10'
			)}
			aria-current={active === link.id ? 'page' : undefined}
		>
			{link.label}
		</a>
	{/each}
</nav>
