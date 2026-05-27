<script lang="ts">
	import type { PendingInviteViewModel } from '$lib/settings/WorkspaceSettings.presenter.svelte';

	import { workspaceRoleDisplayLabel } from '$lib/area-protected/GetHomeWorkspaces.presenter.svelte';
	import { formatInviteExpiry } from '$lib/settings/utils/formatInviteExpiry';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		invite: PendingInviteViewModel;
		index: number;
		accepting?: boolean;
		disabled?: boolean;
		onAccept?: (inviteId: string) => void | Promise<void>;
	};

	let { invite, index, accepting = false, disabled = false, onAccept }: Props = $props();

	const workspaceInitial = $derived((invite.organizationName || 'W').trim().slice(0, 1).toUpperCase());
	const iconTone = $derived.by(() => {
		const tones = [
			'bg-info/20 text-info',
			'bg-secondary/20 text-secondary',
			'bg-accent/20 text-accent'
		] as const;
		return tones[index % tones.length]!;
	});

	const roleLabel = $derived(
		workspaceRoleDisplayLabel(
			invite.role === 'admin' ? 'admin' : invite.role === 'owner' ? 'owner' : 'user'
		)
	);

	const expiryLabel = $derived(formatInviteExpiry(invite.expiresAt));
	const isExpired = $derived(expiryLabel === 'Expired');
</script>

<article
	class="flex h-full flex-col overflow-hidden rounded-xl border border-dashed border-info/40 bg-info/5 shadow-sm"
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
						{invite.organizationName}
					</h3>
					<p class="mt-1 text-xs font-medium text-info">Pending invite</p>
					<p class="mt-1 text-xs text-base-content/70">
						{roleLabel}
						{#if expiryLabel}
							<span class="text-base-content/50"> · {expiryLabel}</span>
						{/if}
					</p>
				</div>
				<span
					class="shrink-0 rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-info"
				>
					Invite
				</span>
			</div>
		</div>
	</div>

	<div class="mt-auto border-t border-info/20 bg-base-100/60 px-4 py-3">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-xs text-base-content/60">
				Accept to join this workspace and collaborate with the team.
			</p>
			<Button
				type="button"
				variant="primary"
				size="sm"
				class="shrink-0"
				disabled={disabled || accepting || isExpired || !onAccept}
				onclick={() => onAccept?.(invite.id)}
			>
				{#if accepting}
					Accepting…
				{:else if isExpired}
					Expired
				{:else}
					<AbstractIcon name={icons.UserPlus.name} class="size-3.5" width="14" height="14" />
					Accept invite
				{/if}
			</Button>
		</div>
	</div>
</article>
