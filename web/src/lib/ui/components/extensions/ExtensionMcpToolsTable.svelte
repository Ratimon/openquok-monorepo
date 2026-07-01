<script lang="ts">
	import type { McpToolProgrammerModel } from '$lib/listings/Listing.repository.svelte';

	import {
		extensionCatalogTableClass,
		extensionCatalogTableHeadCellClass,
		extensionCatalogTableRowClass,
		extensionCatalogTableShellClass
	} from '$lib/ui/components/extensions/extensionCatalogTableClasses';

	type Props = {
		toolsVm: McpToolProgrammerModel[];
		/** Hub card style: smaller padding and text. */
		compact?: boolean;
	};

	let { toolsVm, compact = false }: Props = $props();
</script>

{#if toolsVm.length > 0}
	<div class={extensionCatalogTableShellClass}>
		<table class="{extensionCatalogTableClass} {compact ? 'table-sm' : ''}">
			<thead>
				<tr>
					<th class={extensionCatalogTableHeadCellClass}>Tool</th>
					<th class={extensionCatalogTableHeadCellClass}>Description</th>
				</tr>
			</thead>
			<tbody>
				{#each toolsVm as tool (tool.name)}
					<tr class={extensionCatalogTableRowClass}>
						<td class="px-3 py-2 font-mono {compact ? 'text-xs' : 'text-sm'} whitespace-nowrap">
							{tool.name}
						</td>
						<td class="px-3 py-2 {compact ? 'text-sm' : ''}">{tool.description}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
