<script lang="ts">
	import type { GuestComposerLockAction } from '$lib/posts/constants/guestComposerLock';

	import { page } from '$app/state';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ComposerGuestLockBadge from '$lib/ui/components/posts/ComposerGuestLockBadge.svelte';
	import ComposerMediaTooltip, {
		composeTooltipTriggerClick
	} from '$lib/ui/components/posts/ComposerMediaTooltip.svelte';
	import GlyphDesignEditor from '$lib/ui/components/posts/GlyphDesignEditor.svelte';
	import SignInToComposerActionModal from '$lib/ui/components/posts/SignInToComposerActionModal.svelte';
	import * as Tooltip from '$lib/ui/tooltip';

	type Props = {
		isLoggedIn?: boolean;
		showLinkedInCompany?: boolean;
		class?: string;
	};

	let { isLoggedIn: isLoggedInProp, showLinkedInCompany = false, class: className = '' }: Props =
		$props();

	const isLoggedIn = $derived(
		isLoggedInProp ?? Boolean((page.data as { isLoggedIn?: boolean } | undefined)?.isLoggedIn)
	);

	let guestLockOpen = $state(false);
	let guestLockAction = $state<GuestComposerLockAction>('media-library');

	function openGuestLock(action: GuestComposerLockAction) {
		guestLockAction = action;
		guestLockOpen = true;
	}

	const iconBtn =
		'border-base-300/90 bg-base-200/45 text-base-content/85 hover:bg-base-300/55 hover:text-base-content focus-visible:ring-primary/40 relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none';
</script>

<div class="pointer-events-auto space-y-2 {className}">
	<p class="text-xs text-base-content/50">
		Workspace tools. Sign in or sign up to use your library, design editor, and signatures.
	</p>
	<div
		class="border-base-300/80 bg-base-100/90 inline-flex max-w-full min-w-0 flex-wrap items-center gap-1 rounded-xl border p-1 shadow-md backdrop-blur-md"
		role="toolbar"
		aria-label="Workspace composer tools"
	>
		<Tooltip.Provider delayDuration={200}>
			<ComposerMediaTooltip label="Sign in to attach from your media library">
				{#snippet trigger({ props })}
					<button
						{...props}
						type="button"
						class={iconBtn}
						onclick={composeTooltipTriggerClick(props, () => openGuestLock('media-library'))}
						aria-label="Sign in to attach from your media library"
					>
						<AbstractIcon name={icons.Images.name} class="size-6" width="24" height="24" />
						<ComposerGuestLockBadge />
					</button>
				{/snippet}
			</ComposerMediaTooltip>
			<ComposerMediaTooltip label="Sign in to open the design editor">
				{#snippet trigger({ props })}
					<button
						{...props}
						type="button"
						class={iconBtn}
						onclick={composeTooltipTriggerClick(props, () => openGuestLock('design-editor'))}
						aria-label="Sign in to open the design editor"
					>
						<GlyphDesignEditor badgeSurfaceClass="rounded-sm bg-base-200/45 shadow-none ring-0" />
						<ComposerGuestLockBadge />
					</button>
				{/snippet}
			</ComposerMediaTooltip>
			<ComposerMediaTooltip label="Sign in to insert a workspace signature">
				{#snippet trigger({ props })}
					<button
						{...props}
						type="button"
						class={iconBtn}
						onclick={composeTooltipTriggerClick(props, () => openGuestLock('signature'))}
						aria-label="Sign in to insert a workspace signature"
					>
						<AbstractIcon name={icons.Signature.name} class="size-5" width="20" height="20" />
						<ComposerGuestLockBadge />
					</button>
				{/snippet}
			</ComposerMediaTooltip>
			{#if showLinkedInCompany}
				<ComposerMediaTooltip label="Sign in to mention a LinkedIn company">
					{#snippet trigger({ props })}
						<button
							{...props}
							type="button"
							class={iconBtn}
							onclick={composeTooltipTriggerClick(props, () => openGuestLock('linkedin-company'))}
							aria-label="Sign in to mention a LinkedIn company"
						>
							<AbstractIcon name={icons.LinkedIn.name} class="size-5" width="20" height="20" />
							<ComposerGuestLockBadge />
						</button>
					{/snippet}
				</ComposerMediaTooltip>
			{/if}
		</Tooltip.Provider>
	</div>
	<SignInToComposerActionModal bind:open={guestLockOpen} action={guestLockAction} {isLoggedIn} />
</div>
