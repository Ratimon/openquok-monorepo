<script lang="ts">
	type Props = {
		linkList: Record<string, { label: string; href: string }[]>;
	};
	let { linkList }: Props = $props();

	function capitalize(s: string): string {
		return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
	}
</script>

<div class="flex flex-wrap gap-8 text-center md:text-left">
	{#each Object.keys(linkList) as category (category)}
		<div>
			<h3 class="text-sm font-semibold leading-6 text-base-content">
				{capitalize(category)}</h3>
			<ul role="list" class="mt-6 space-y-4">
				{#each linkList[category] as link (link.href)}
					<li>
						<a
							href={link.href}
							class="text-sm leading-6 text-base-content/80 hover:underline"
							data-sveltekit-preload-data="tap"
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</div>
