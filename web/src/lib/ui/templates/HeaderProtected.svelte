<script lang="ts">
	import type { DockItem } from '$lib/ui/floating-dock/types';
	import Button from '$lib/ui/buttons/Button.svelte';
	import FloatingDockDesktop from '$lib/ui/floating-dock/FloatingDockDesktop.svelte';
	import DockCustomSlot from '$lib/ui/floating-dock/DockCustomSlot.svelte';
	import ThemeSwitcher from '$lib/ui/daisyui/ThemeSwitcher.svelte';
	import * as Tooltip from '$lib/ui/tooltip';
	import FeedbackPopoverForm from '$lib/ui/components/feedback/FeedbackPopoverForm.svelte';

	type Props = {
		dockItems: DockItem[];

		showEditorAreaButton?: boolean;
		editorAreaHref?: string;
		showAdminAreaButton?: boolean;
		adminAreaHref?: string;
		showSecretAdminAreaButton?: boolean;
		secretAdminAreaHref?: string;
		feedbackDescription?: string;
		feedbackOpen?: boolean;
		feedbackIsSubmitting: boolean;
		feedbackIsSuccess: boolean;
		feedbackSuccessMessage: string;
		onFeedbackSubmit: (description: string) => void | Promise<void>;
	};

	let {
		dockItems,
		showEditorAreaButton = false,
		editorAreaHref = '/editor/feedback-manager',
		showAdminAreaButton = false,
		adminAreaHref = '/admin',
		showSecretAdminAreaButton = false,
		secretAdminAreaHref = '/secret-admin',
		feedbackDescription = $bindable(''),
		feedbackOpen = $bindable(false),
		feedbackIsSubmitting,
		feedbackIsSuccess,
		feedbackSuccessMessage,
		onFeedbackSubmit
	}: Props = $props();
</script>

<header
	class="flex items-center justify-between gap-4 shrink-0 h-14 px-4 md:px-6 rounded-tl-2xl border-b border-l border-base-300 bg-base-100"
>
	<div class="flex items-center min-w-0">
		<!-- Left: reserved for breadcrumb later -->
	</div>

	<div class="flex items-center justify-end flex-shrink-0">
		{#if showEditorAreaButton}
			<Button variant="ghost" size="sm" class="hidden sm:inline-flex" href={editorAreaHref}>
				Editor area
			</Button>
		{/if}
		{#if showAdminAreaButton}
			<Button variant="ghost" size="sm" class="hidden sm:inline-flex" href={adminAreaHref}>
				Admin area
			</Button>
		{/if}
		{#if showSecretAdminAreaButton}
			<Button variant="ghost" size="sm" class="hidden sm:inline-flex" href={secretAdminAreaHref}>
				Secret admin
			</Button>
		{/if}
		
		<Button variant="ghost" size="sm" class="hidden sm:inline-flex" href="/docs">
			Docs
		</Button>

		<FloatingDockDesktop items={dockItems} class="mx-0" childrenFirst>
			{#snippet customSlots({ mouseX, containerX })}
				<DockCustomSlot {mouseX} {containerX} title="">
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props: triggerProps })}
								<span
									{...triggerProps}
									class="relative flex h-full w-full items-center justify-center"
								>
									<ThemeSwitcher variant="dock" />
								</span>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="top" sideOffset={8}>
							Switch theme
						</Tooltip.Content>
					</Tooltip.Root>
				</DockCustomSlot>
				<DockCustomSlot {mouseX} {containerX} title="">
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props: triggerProps })}
								<span
									{...triggerProps}
									class="relative w-full h-full flex items-center justify-center"
								>
									<FeedbackPopoverForm
										bind:description={feedbackDescription}
										bind:open={feedbackOpen}
										isSubmitting={feedbackIsSubmitting}
										isSuccess={feedbackIsSuccess}
										successMessage={feedbackSuccessMessage}
										onSubmit={onFeedbackSubmit}
									/>
								</span>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="top" sideOffset={8}>
							Feedback
						</Tooltip.Content>
					</Tooltip.Root>
				</DockCustomSlot>
			{/snippet}
		</FloatingDockDesktop>
	</div>
</header>
