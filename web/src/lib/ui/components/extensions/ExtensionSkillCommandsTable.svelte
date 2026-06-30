<script lang="ts">
	import type { SkillCommandViewModel } from '$lib/listings/index';

	import {
		extensionCatalogTableClass,
		extensionCatalogTableHeadCellClass,
		extensionCatalogTableRowClass,
		extensionCatalogTableShellClass,
		extensionCatalogCommandTemplateClass
	} from '$lib/ui/components/extensions/extensionCatalogTableClasses';

	type Props = {
		commands: SkillCommandViewModel[];
		/** Hub card style: compact rows, name + description only (no command templates). */
		compact?: boolean;
	};

	let { commands, compact = false }: Props = $props();
</script>

{#if commands.length > 0}
	<div class={extensionCatalogTableShellClass}>
		<table class="{extensionCatalogTableClass} {compact ? 'table-sm' : ''}">
			<thead>
				<tr>
					<th class={extensionCatalogTableHeadCellClass}>Command</th>
					<th class={extensionCatalogTableHeadCellClass}>Description</th>
				</tr>
			</thead>
			<tbody>
				{#each commands as command (command.name)}
					<tr class={extensionCatalogTableRowClass}>
						<td class="px-3 py-2 font-mono text-xs whitespace-nowrap">{command.name}</td>
						<td class="px-3 py-2 {compact ? 'text-sm align-top' : 'align-top'}">
							{#if compact}
								{command.description}
							{:else}
								<p>{command.description}</p>
								{#if command.commandTemplate}
									<pre class={extensionCatalogCommandTemplateClass}>{command.commandTemplate}</pre>
								{/if}
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
