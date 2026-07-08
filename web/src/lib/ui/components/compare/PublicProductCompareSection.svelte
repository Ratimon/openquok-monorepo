<script lang="ts">
	import type {
		CompareFeatureCellViewModel,
		CompareFeatureRowViewModel
	} from '$lib/area-public/PublicComparePage.presenter.svelte';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Table from '$lib/ui/table';
	import * as Tooltip from '$lib/ui/tooltip';

	type Props = {
		leftProductName: string;
		rightProductName: string;
		rowsVm: CompareFeatureRowViewModel[];
	};

	let {
		leftProductName,
		rightProductName,
		rowsVm
	}: Props = $props();
</script>

<section class="scroll-mt-24">
	<h2 class="text-center text-2xl font-bold text-base-content sm:text-3xl">
		Feature comparison
	</h2>

	<div class="mt-10 overflow-x-auto">
		<Table.Root class="min-w-[40rem] border-separate border-spacing-x-2 border-spacing-y-2">
			<Table.Header>
				<Table.Row class="border-0 hover:bg-transparent">
					<Table.Head class="w-[18rem] min-w-[18rem] align-bottom border-0 bg-transparent p-3">
						<div class="text-lg font-bold">Features</div>
					</Table.Head>
					<Table.Head class="min-w-[10rem] rounded-2xl border-0 bg-primary/10 p-4 align-top text-base-content">
						<span class="text-lg font-semibold">{leftProductName}</span>
					</Table.Head>
					<Table.Head class="min-w-[10rem] rounded-2xl border-0 bg-base-200 p-4 align-top text-base-content">
						<span class="text-lg font-semibold">{rightProductName}</span>
					</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Tooltip.Provider delayDuration={200}>
					{#each rowsVm as rowVm (rowVm.id)}
						<Table.Row class="border-0 hover:bg-transparent">
							<Table.Cell class="rounded-xl border-0 bg-base-200/80 p-4 align-middle font-medium">
								<div class="flex items-center gap-1.5">
									<span>{rowVm.label}</span>
									{#if rowVm.tooltip}
										<Tooltip.Root>
											<Tooltip.Trigger>
												{#snippet child({ props: triggerProps })}
													{@const { class: tipClass, ...tipRest } = triggerProps}
													<span
														{...tipRest}
														class={`inline-flex shrink-0 ${String(tipClass ?? '')} cursor-help text-base-content/50`}
														aria-label="More info"
													>
														<AbstractIcon
															name={icons.Info.name}
															class="size-4"
															width="16"
															height="16"
														/>
													</span>
												{/snippet}
											</Tooltip.Trigger>
											<Tooltip.Content
												side="top"
												sideOffset={8}
												class="max-w-sm whitespace-pre-line"
											>
												{rowVm.tooltip}
											</Tooltip.Content>
										</Tooltip.Root>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell class="rounded-xl border-0 bg-primary/10 p-4 text-center align-middle">
								{@render featureCell(rowVm.left)}
							</Table.Cell>
							<Table.Cell class="rounded-xl border-0 bg-base-200/60 p-4 text-center align-middle">
								{@render featureCell(rowVm.right)}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Tooltip.Provider>
			</Table.Body>
		</Table.Root>
	</div>
</section>

{#snippet featureCell(cell: CompareFeatureCellViewModel)}
	{#if cell.kind === 'text'}
		<span class="tabular-nums">{cell.text}</span>
	{:else if cell.kind === 'included'}
		<span class="mx-auto inline-flex" aria-label="Included">
			<AbstractIcon
				name={icons.CircleCheck.name}
				class="size-5 text-success"
				width="20"
				height="20"
			/>
		</span>
	{:else}
		<span class="mx-auto inline-flex text-base-content/40" aria-label="Not included">—</span>
	{/if}
{/snippet}
