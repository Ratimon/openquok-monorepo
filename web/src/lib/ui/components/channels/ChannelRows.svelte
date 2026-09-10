<script lang="ts">
	import type {
		CreateSocialPostChannelViewModel,
		HomeChannelRowViewModel
	} from '$lib/channels/GetChannel.presenter.svelte';

	import { socialProviderDisplayLabel, socialProviderIcon } from '$data/social-providers';

	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ChannelAddMoreButton from '$lib/ui/components/channels/ChannelAddMoreButton.svelte';
	import IntegrationMenu from '$lib/ui/components/posts/IntegrationMenu.svelte';
	import * as Tooltip from '$lib/ui/tooltip';

	type Props = {
		rows: HomeChannelRowViewModel[];
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

<Tooltip.Provider delayDuration={200}>
<div class="divide-y divide-base-300">
	{#each rows as row (row.identifier)}
		{@const platformLabel = socialProviderDisplayLabel(row.identifier)}
		<div class="flex w-full flex-wrap items-center gap-3 py-4 first:pt-1">
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props: tooltipProps })}
						{@const { class: tooltipClass, ...tooltipRest } = tooltipProps}
						<div
							{...tooltipRest}
							class={cn(
								'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200/70 text-base-content',
								String(tooltipClass ?? '')
							)}
							aria-label={platformLabel}
						>
							<AbstractIcon
								name={socialProviderIcon(row.identifier)}
								class="size-6"
								width="24"
								height="24"
								aria-hidden="true"
							/>
						</div>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content side="top" sideOffset={6}>{platformLabel}</Tooltip.Content>
			</Tooltip.Root>
			<ul class="flex min-w-0 list-none flex-wrap items-center gap-2 p-0">
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
				<li class="shrink-0">
					<ChannelAddMoreButton
						platformKey={row.identifier}
						{channelLimitFull}
						class="h-auto py-1.5"
						onClick={() => onAddAnotherChannel(row.identifier)}
					/>
				</li>
			</ul>
		</div>
	{/each}
</div>
</Tooltip.Provider>
