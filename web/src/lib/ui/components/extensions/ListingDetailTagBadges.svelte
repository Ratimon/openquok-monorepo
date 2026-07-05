<script lang="ts">
	type Tag = { id: string; name: string };

	type Props = {
		tags: Tag[];
	};

	let { tags }: Props = $props();
</script>

{#if tags.length > 0}
	<div class="flex flex-wrap gap-2">
		{#each tags as tag (tag.id)}
			<span class="badge badge-ghost">
				{tag.name}
			</span>
		{/each}
	</div>
{/if}
