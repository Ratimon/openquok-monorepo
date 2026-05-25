<script lang="ts">
	import type {
		CreateSocialPostChannelViewModel,
		HomePlatformChannelRowViewModel
	} from '$lib/channels/GetChannel.presenter.svelte';

	import { icons } from '$data/icons';
	import { socialProviderDisplayLabel, socialProviderIcon } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import IntegrationMenu from '$lib/ui/components/posts/IntegrationMenu.svelte';

	type Props = {
		rows: HomePlatformChannelRowViewModel[];
		workspaceId: string;
		continueSetupHref: (integration: CreateSocialPostChannelViewModel) => string;
		onCreatePost: (integrationId: string) => void;
		onMoveToGroup: (integration: CreateSocialPostChannelViewModel) => void;
		onEditTimeSlots: (integration: CreateSocialPostChannelViewModel) => void;
		onSetDisabled: (id: string, disabled: boolean) => Promise<boolean>;
		onRemove: (id: string) => Promise<boolean>;
		onAddAnotherChannel: (identifier: string) => void;
	};

	let {
		rows,
		workspaceId,
		continueSetupHref,
		onCreatePost,
		onMoveToGroup,
		onEditTimeSlots,
		onSetDisabled,
		onRemove,
		onAddAnotherChannel
	}: Props = $props();
</script>

<div class="divide-y divide-base-300">
	{#each rows as row (row.identifier)}
		<div class="flex w-full flex-wrap items-center gap-3 py-4 first:pt-1">
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200/70 text-base-content"
				aria-hidden="true"
			>
				<AbstractIcon
					name={socialProviderIcon(row.identifier)}
					class="size-6"
					width="24"
					height="24"
				/>
			</div>
			<ul class="flex min-w-0 flex-1 list-none flex-wrap gap-2 p-0">
				{#each row.items as integration (integration.id)}
					<li class="min-w-0">
						<IntegrationMenu
							variant="chip"
							{integration}
							{workspaceId}
							providerIcon={socialProviderIcon}
							{continueSetupHref}
							onCreatePost={() => onCreatePost(integration.id)}
							{onMoveToGroup}
							{onEditTimeSlots}
							{onSetDisabled}
							{onRemove}
						/>
					</li>
				{/each}
			</ul>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				class="shrink-0 gap-1.5 border-base-300"
				aria-label={`Add another ${socialProviderDisplayLabel(row.identifier)} connection`}
				onclick={() => onAddAnotherChannel(row.identifier)}
			>
				<span class="inline-flex items-center gap-1.5" aria-hidden="true">
					<AbstractIcon name={icons.Plus.name} class="h-4 w-4" width="16" height="16" />
					Add more
					<AbstractIcon
						name={socialProviderIcon(row.identifier)}
						class="h-4 w-4"
						width="16"
						height="16"
					/>
				</span>
			</Button>
		</div>
	{/each}
</div>
