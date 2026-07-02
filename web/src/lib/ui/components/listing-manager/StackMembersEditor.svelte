<script lang="ts">
	import type { StackMemberFormSchemaType } from '$lib/listings/listing.types';

	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Select from '$lib/ui/select';

	type ExtensionChoice = {
		id: string;
		title: string;
		slug: string;
		extensionType: string | null;
	};

	type Props = {
		members: StackMemberFormSchemaType[];
		extensionChoices: ExtensionChoice[];
		onChange: (members: StackMemberFormSchemaType[]) => void;
	};

	let { members, extensionChoices, onChange }: Props = $props();

	function addMember() {
		const first = extensionChoices[0];
		if (!first) return;
		const role =
			first.extensionType === 'mcp' ? 'mcp' : first.extensionType === 'skills' ? 'skills' : 'skills';
		onChange([
			...members,
			{
				member_listing_id: first.id,
				member_role: role,
				sort_order: members.length
			}
		]);
	}

	function removeMember(index: number) {
		onChange(
			members
				.filter((_, i) => i !== index)
				.map((member, sortIndex) => ({ ...member, sort_order: sortIndex }))
		);
	}

	function updateMember(index: number, patch: Partial<StackMemberFormSchemaType>) {
		onChange(
			members.map((member, i) => (i === index ? { ...member, ...patch } : member))
		);
	}

	function moveMember(index: number, direction: -1 | 1) {
		const target = index + direction;
		if (target < 0 || target >= members.length) return;
		const next = [...members];
		const [item] = next.splice(index, 1);
		next.splice(target, 0, item);
		onChange(next.map((member, sortIndex) => ({ ...member, sort_order: sortIndex })));
	}
</script>

<div class="space-y-4 rounded-xl border border-base-content/10 p-4">
	<div class="flex items-center justify-between gap-3">
		<div>
			<h3 class="text-sm font-semibold text-base-content">Building blocks in this playbook</h3>
			<p class="text-xs text-base-content/60">
				Choose skills and MCP building blocks and set the order they appear.
			</p>
		</div>
		<Button type="button" variant="outline" size="sm" onclick={addMember} disabled={!extensionChoices.length}>
			Add building block
		</Button>
	</div>

	{#if !extensionChoices.length}
		<p class="text-sm text-base-content/60">
			Publish at least one building block before you can compose a playbook.
		</p>
	{:else if members.length === 0}
		<p class="text-sm text-base-content/60">No building blocks added yet.</p>
	{:else}
		<ul class="space-y-3">
			{#each members as member, index (member.member_listing_id + '-' + index)}
				<li class="flex flex-wrap items-end gap-3 rounded-lg bg-base-200/40 p-3">
					<label class="form-control min-w-[220px] flex-1">
						<span class="label-text text-xs">Building block</span>
						<select
							class="select select-bordered select-sm w-full"
							value={member.member_listing_id}
							onchange={(e) =>
								updateMember(index, {
									member_listing_id: (e.currentTarget as HTMLSelectElement).value
								})}
						>
							{#each extensionChoices as choice (choice.id)}
								<option value={choice.id}>{choice.title} ({choice.slug})</option>
							{/each}
						</select>
					</label>

					<label class="form-control w-28">
						<span class="label-text text-xs">Role</span>
						<select
							class="select select-bordered select-sm w-full"
							value={member.member_role}
							onchange={(e) =>
								updateMember(index, {
									member_role: (e.currentTarget as HTMLSelectElement).value as 'skills' | 'mcp'
								})}
						>
							<option value="skills">Skills</option>
							<option value="mcp">MCP</option>
						</select>
					</label>

					<div class="flex items-center gap-1">
						<Button type="button" variant="ghost" size="sm" onclick={() => moveMember(index, -1)} disabled={index === 0}>
							Up
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onclick={() => moveMember(index, 1)}
							disabled={index === members.length - 1}
						>
							Down
						</Button>
						<Button type="button" variant="ghost" size="sm" onclick={() => removeMember(index)}>
							Remove
						</Button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
