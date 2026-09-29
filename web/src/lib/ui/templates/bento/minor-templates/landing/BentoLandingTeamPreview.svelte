<script lang="ts">
	import { page } from '$app/state';
	import { icons } from '$data/icons';
	import {
		LANDING_TEAM_MOCK_MEMBERS,
		LANDING_TEAM_MOCK_PENDING_INVITE,
		LANDING_TEAM_MOCK_SEATS,
		LANDING_TEAM_MOCK_WORKSPACE_NAME,
		landingTeamRoleLabel
	} from '$lib/ui/templates/bento/minor-templates/landing/landingTeamMock';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ComposerGuestLockBadge from '$lib/ui/components/posts/ComposerGuestLockBadge.svelte';
	import SignInToComposerActionModal from '$lib/ui/components/posts/SignInToComposerActionModal.svelte';

	type Props = {
		isLoggedIn?: boolean;
	};

	let { isLoggedIn: isLoggedInProp }: Props = $props();

	const isLoggedIn = $derived(
		isLoggedInProp ?? Boolean((page.data as { isLoggedIn?: boolean } | undefined)?.isLoggedIn)
	);

	const teamSeatsUsageLabel = $derived(
		`${LANDING_TEAM_MOCK_SEATS.used}/${LANDING_TEAM_MOCK_SEATS.limit}`
	);

	let guestLockOpen = $state(false);

	function openGuestLock() {
		guestLockOpen = true;
	}
</script>

<div class="select-none bg-base-100 text-base-content">
	<div class="border-b border-base-300 px-4 py-3">
		<p class="text-xs font-medium tracking-wide text-base-content/50 uppercase">Sample workspace</p>
		<p class="mt-1 text-sm font-semibold text-base-content">{LANDING_TEAM_MOCK_WORKSPACE_NAME}</p>
	</div>

	<section
		class="pointer-events-none overflow-hidden rounded-none border-0 bg-base-200 shadow-sm"
		aria-labelledby="landing-team-mock-heading"
	>
		<div class="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h2 id="landing-team-mock-heading" class="text-lg font-semibold text-base-content">
					Team Members
					<span class="text-base-content/70">({teamSeatsUsageLabel})</span>
				</h2>
				<p class="mt-1 text-sm text-base-content/70">
					Invite your assistant or team member to manage your account
				</p>
			</div>
			<div class="pointer-events-auto shrink-0">
				<Button
					type="button"
					variant="primary"
					class="relative gap-1.5"
					onclick={openGuestLock}
				>
					<AbstractIcon
						name={icons.Lock.name}
						class="size-4"
						width="16"
						height="16"
						focusable="false"
					/>
					Add another member
					<ComposerGuestLockBadge />
				</Button>
			</div>
		</div>

		<div class="border-t border-base-300 px-6 pb-4 pt-4">
			<p class="text-sm text-base-content/90">
				Team members on your plan:
				<span class="font-medium tabular-nums">{teamSeatsUsageLabel}</span>
				used across your account.
			</p>
		</div>

		<div class="border-t border-base-300 px-6 pb-6 pt-4 space-y-4">
			{#each LANDING_TEAM_MOCK_MEMBERS as member (member.id)}
				<div class="flex items-center justify-between gap-4">
					<div class="min-w-0">
						<p class="text-sm font-medium text-base-content">
							{member.displayName}
						</p>
						<p class="text-xs text-base-content/70 truncate">
							{member.email}
						</p>
					</div>
					<span class="shrink-0 text-sm text-base-content/70">
						{landingTeamRoleLabel(member.workspaceRole)}
					</span>
				</div>
			{/each}

			<div class="space-y-3 border-t border-base-300 pt-4">
				<h3 class="text-sm font-medium text-base-content">Pending invitations</h3>
				<div class="flex items-center justify-between gap-4">
					<div class="min-w-0">
						<p class="text-sm font-medium text-base-content truncate">
							{LANDING_TEAM_MOCK_PENDING_INVITE.email}
						</p>
						<p class="text-xs text-base-content/70">
							Invited · {landingTeamRoleLabel(LANDING_TEAM_MOCK_PENDING_INVITE.workspaceRole)}
							<span class="ml-1">· Expires in 6 days</span>
						</p>
					</div>
					<span class="shrink-0 text-sm text-base-content/50">Cancel</span>
				</div>
			</div>
		</div>
	</section>

	<SignInToComposerActionModal bind:open={guestLockOpen} action="workspace-team" {isLoggedIn} />
</div>
