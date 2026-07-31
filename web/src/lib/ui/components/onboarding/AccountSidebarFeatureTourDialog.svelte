<script lang="ts">
	import type { AccountSidebarTourId } from '$lib/onboarding/accountSidebarTour.types';

	import { icons } from '$data/icons';
	import { ACCOUNT_SIDEBAR_TOUR_CONTENT } from '$lib/onboarding/accountSidebarTourContent';
	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AccountSidebarTourParagraph from '$lib/ui/components/onboarding/AccountSidebarTourParagraph.svelte';
	import * as Dialog from '$lib/ui/dialog';

	const ACCOUNT_SIDEBAR_TOUR_DIALOG_CLASS =
		'flex max-h-[min(90vh,720px)] w-full max-w-[min(96vw,42rem)] flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-lg';

	type Props = {
		open: boolean;
		tourId: AccountSidebarTourId | null;
		onOpenChange?: (open: boolean) => void;
		onFinished?: (tourId: AccountSidebarTourId) => void;
	};

	let { open = $bindable(false), tourId, onOpenChange, onFinished }: Props = $props();

	let stepIndex = $state(0);

	const definition = $derived(tourId ? ACCOUNT_SIDEBAR_TOUR_CONTENT[tourId] : null);
	const steps = $derived(definition?.steps ?? []);
	const step = $derived(steps[stepIndex] ?? null);
	const totalSteps = $derived(steps.length);
	const isFirstStep = $derived(stepIndex <= 0);
	const isLastStep = $derived(totalSteps > 0 && stepIndex >= totalSteps - 1);

	$effect(() => {
		void tourId;
		if (!open) {
			stepIndex = 0;
			return;
		}
		stepIndex = 0;
	});

	function handleOpenChange(next: boolean) {
		if (!next) {
			open = false;
			onOpenChange?.(false);
			if (tourId) onFinished?.(tourId);
			stepIndex = 0;
			return;
		}
		open = next;
		onOpenChange?.(next);
	}

	function goBack() {
		stepIndex = Math.max(0, stepIndex - 1);
	}

	function goNext() {
		if (isLastStep) {
			handleOpenChange(false);
			return;
		}
		stepIndex = Math.min(totalSteps - 1, stepIndex + 1);
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class={ACCOUNT_SIDEBAR_TOUR_DIALOG_CLASS} showCloseButton={false}>
		{#if step && tourId}
			<div class="relative overflow-hidden rounded-t-xl bg-primary px-6 pb-6 pt-6 text-primary-content">
				<Dialog.Close
					class="absolute end-3 top-3 z-30 inline-flex size-9 items-center justify-center rounded-md text-primary-content opacity-90 transition hover:bg-primary-content/15 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-content"
				>
					<AbstractIcon name={icons.X2.name} width="20" height="20" aria-hidden="true" />
					<span class="sr-only">Close</span>
				</Dialog.Close>
				<div
					class="pointer-events-none absolute end-12 top-2 flex size-16 items-center justify-center rounded-2xl bg-primary-content/10"
					aria-hidden="true"
				>
					<AbstractIcon
						name={step.iconName}
						width="36"
						height="36"
						class="text-primary-content/90"
					/>
				</div>
				<Dialog.Title class="pe-14 font-serif text-2xl font-bold tracking-tight text-primary-content">
					{step.title}
				</Dialog.Title>
				<Dialog.Description class="mt-2 max-w-md text-sm leading-snug text-primary-content/90">
					{step.subtitle}
				</Dialog.Description>
			</div>

			<div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5">
				<div class="space-y-4">
					{#each step.paragraphs as paragraph, i (`${tourId}-${stepIndex}-${i}`)}
						<AccountSidebarTourParagraph parts={paragraph} />
					{/each}
				</div>

				{#if step.remember}
					<p class="mt-5 text-sm leading-relaxed text-base-content/75">
						<span aria-hidden="true">💡</span>
						<span class="font-medium text-base-content"> Remember:</span>
						{' '}{step.remember}
					</p>
				{/if}

				{#if totalSteps > 1}
					<p class="mt-6 text-center text-xs text-base-content/50">
						Step {stepIndex + 1} of {totalSteps}
					</p>
				{/if}
			</div>

			<Dialog.Footer
				class="flex shrink-0 items-center justify-between gap-3 border-t border-base-300 bg-base-100 px-6 py-4"
			>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					class={cn('gap-1.5', isFirstStep && 'invisible pointer-events-none')}
					disabled={isFirstStep}
					onclick={goBack}
				>
					<AbstractIcon name={icons.ChevronLeft.name} width="16" height="16" />
					Back
				</Button>
				<Button type="button" variant="primary" size="sm" class="gap-2" onclick={goNext}>
					{isLastStep ? 'Got it' : 'Next'}
					{#if !isLastStep}
						<span
							class="inline-flex size-6 items-center justify-center rounded-full bg-primary-content/20"
						>
							<AbstractIcon
								name={icons.ChevronRight.name}
								width="14"
								height="14"
								class="text-primary-content"
							/>
						</span>
					{/if}
				</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
