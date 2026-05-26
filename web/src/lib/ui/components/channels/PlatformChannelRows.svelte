<script lang="ts">
	import type {
		CreateSocialPostChannelViewModel,
		HomePlatformChannelRowViewModel
	} from '$lib/channels/GetChannel.presenter.svelte';

	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ChannelAddMoreButton from '$lib/ui/components/channels/ChannelAddMoreButton.svelte';
	import IntegrationMenu from '$lib/ui/components/posts/IntegrationMenu.svelte';

	type Props = {
		rows: HomePlatformChannelRowViewModel[];
		workspaceId: string;
		channelLimitFull?: boolean;
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
		channelLimitFull = false,
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
			<ChannelAddMoreButton
				platformKey={row.identifier}
				{channelLimitFull}
				class="h-auto shrink-0 py-1.5"
				onClick={() => onAddAnotherChannel(row.identifier)}
			/>
		</div>
	{/each}
</div>
