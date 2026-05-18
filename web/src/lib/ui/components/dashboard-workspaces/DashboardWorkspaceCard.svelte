<script lang="ts">
	import type { DashboardWorkspaceCardViewModel } from '$lib/area-protected/GetDashboardWorkspaces.presenter.svelte';

	import { socialProviderIcon } from '$data/social-providers';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ActionVerificationModal from '$lib/ui/modals/ActionVerificationModal.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AddProvider from '$lib/ui/components/posts/AddProvider.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';

	type SwitchWorkspaceModalData = {
		workspaceId: string;
		workspaceName: string;
	};

	type Props = {
		card: DashboardWorkspaceCardViewModel;
		index: number;
		onSwitchWorkspace?: (workspaceId: string) => void;
		onOpenWorkspaceSettings?: (workspaceId: string) => void;
	};

	let { card, index, onSwitchWorkspace, onOpenWorkspaceSettings }: Props =
		$props();

	const workspaceInitial = $derived((card.name || 'W').trim().slice(0, 1).toUpperCase());
	const iconTone = $derived.by(() => {
		const tones = [
			'bg-primary text-primary-content',
			'bg-secondary text-secondary-content',
			'bg-accent text-accent-content'
		] as const;
		return tones[index % tones.length]!;
	});

	const userSubtitle = $derived.by(() => {
		const name = card.userFullName !== '—' ? card.userFullName : '';
		const email = card.userEmail !== '—' ? card.userEmail : '';
		if (name && email) return `${name} · ${email}`;
		return name || email || '—';
	});

	const hasSocialChannels = $derived(card.socialChannelCount > 0);
	const showAddChannel = $derived(card.isCurrent && !hasSocialChannels);

	let switchModalOpen = $state(false);

	const switchWorkspaceModalData = $derived<SwitchWorkspaceModalData>({
		workspaceId: card.id,
		workspaceName: card.name
	});

	function requestSwitchWorkspace(e?: Event) {
		e?.stopPropagation();
		if (card.isCurrent || !onSwitchWorkspace) return;
		switchModalOpen = true;
	}

	async function executeSwitchWorkspace(
		data: unknown
	): Promise<{ success: boolean; message: string }> {
		if (!onSwitchWorkspace) {
			return { success: false, message: 'Unable to switch workspace.' };
		}
		const { workspaceId, workspaceName } = data as SwitchWorkspaceModalData;
		onSwitchWorkspace(workspaceId);
		return { success: true, message: `Switched to ${workspaceName}` };
	}

	function handleSettingsClick() {
		onOpenWorkspaceSettings?.(card.id);
	}
</script>

<article
	class="flex h-full flex-col overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm transition-colors {card.isCurrent
		? 'ring-2 ring-primary/40'
		: ''}"
>
	<div class="flex items-start gap-3 p-4 pb-3">
		<div
			class="flex size-11 shrink-0 items-center justify-center rounded-full text-base font-semibold {iconTone}"
			aria-hidden="true"
		>
			{workspaceInitial}
		</div>
		<div class="min-w-0 flex-1">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0">
					<h3 class="truncate text-base font-semibold text-base-content">
						{card.name}
					</h3>
					{#if card.description}
						<p class="mt-0.5 line-clamp-2 text-xs text-base-content/60" title={card.description}>
							{card.description}
						</p>
					{/if}
					<p class="mt-0.5 truncate text-xs text-base-content/70" title={userSubtitle}>
						{userSubtitle}
					</p>
					<p class="mt-1 text-xs font-medium text-primary">
						{card.roleLabel}
					</p>
				</div>
				<div class="flex shrink-0 flex-col items-end gap-1.5">
					{#if card.isCurrent}
						<span
							class="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
						>
							Current
						</span>
					{/if}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						class="h-7 gap-1 px-2 text-xs"
						disabled={!card.isCurrent}
						onclick={handleSettingsClick}
					>
						<AbstractIcon name={icons.Cog.name} class="size-3.5" width="14" height="14" />
						Settings
					</Button>
				</div>
			</div>
		</div>
	</div>

	<div class="border-t border-base-300/80 px-4 py-3">
		{#if card.membersPreview.length > 0 || card.hiddenMemberCount > 0}
			<div class="flex items-center gap-2">
				<div class="flex -space-x-2" aria-hidden="true">
					{#each card.membersPreview as member (member.id)}
						<span
							class="flex size-8 items-center justify-center rounded-full border-2 border-base-100 bg-base-200 text-[10px] font-semibold text-base-content/80"
							title={member.displayName}
						>
							{member.initials}
						</span>
					{/each}
				</div>
				{#if card.hiddenMemberCount > 0}
					<span class="text-xs font-medium text-base-content/60">
						+{card.hiddenMemberCount} more
					</span>
				{:else if card.memberCount > card.membersPreview.length + 1}
					<span class="text-xs text-base-content/60">
						{card.memberCount} members
					</span>
				{/if}
			</div>
		{:else}
			<p class="text-xs text-base-content/50">
				{card.memberCount <= 1 ? 'Only you in this workspace' : `${card.memberCount} members`}
			</p>
		{/if}
	</div>

	<div class="mt-auto border-t border-base-300/80 bg-base-200/40 px-4 py-3">
		{#if hasSocialChannels}
			<div class="flex items-center gap-2">
				<div
					class="relative h-5 shrink-0"
					style:width={`${Math.max(20, 12 + (card.channelPreviews.length - 1) * 10)}px`}
				>
					{#each card.channelPreviews as ch, i (ch.id)}
						<div class="absolute top-0" style:left={`${i * 10}px`}>
							<div class="relative h-5 w-5 shrink-0">
								{#if ch.picture}
									<IntegrationChannelPicture
										profilePictureUrl={ch.picture}
										fallbackIcon={socialProviderIcon(ch.identifier ?? 'threads')}
										class="h-5 w-5 rounded object-cover ring-1 ring-base-100"
									/>
								{:else}
									<div
										class="flex h-5 w-5 items-center justify-center rounded bg-base-content/15 text-[9px] font-semibold text-base-content/80 ring-1 ring-base-100"
									>
										{(ch.identifier || 'CH').slice(0, 1).toUpperCase()}
									</div>
								{/if}
								<span
									class="absolute -bottom-0.5 -right-0.5 z-[1] flex size-[11px] items-center justify-center rounded-full border border-base-100 bg-base-100"
									aria-hidden="true"
								>
									<AbstractIcon
										name={socialProviderIcon(ch.identifier)}
										class="size-2.5"
										width="10"
										height="10"
									/>
								</span>
							</div>
						</div>
					{/each}
				</div>
				<span class="min-w-0 flex-1 truncate text-xs text-base-content/70">
					Connected Channels
				</span>
				{#if card.hiddenChannelCount > 0}
					<div
						class="rounded bg-base-content/10 px-1.5 py-0.5 text-[10px] font-semibold text-base-content/80"
					>
						+{card.hiddenChannelCount}
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<p class="text-xs text-base-content/50">
					No connected channels
				</p>
				{#if showAddChannel}
					<div class="shrink-0" data-workspace-card-action>
						<AddProvider buttonLabel="Add channel" hasConnectedChannels={false} />
					</div>
				{:else if !card.isCurrent && onSwitchWorkspace}
					<Button
						type="button"
						variant="warning"
						size="sm"
						class="shrink-0"
						data-workspace-card-action
						onclick={requestSwitchWorkspace}
					>
						Switch workspace
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</article>

{#if onSwitchWorkspace && !card.isCurrent}
	<ActionVerificationModal
		data={switchWorkspaceModalData}
		bind:open={switchModalOpen}
		executionFunction={executeSwitchWorkspace}
		buttonIconName={icons.ArrowRight.name}
		buttonText="Switch workspace"
		modalTitle="Switch workspace"
		modalDescription={`You are about to open "${card.name}". Your dashboard, channels, posts, your API keys will reflect that workspace.`}
		modalVerficationWithAnswer={false}
	/>
{/if}
