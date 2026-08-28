<script lang="ts">
	import type { AcquisitionSurveyGateContext } from '$lib/acquisition';
	import type { AcquisitionSurveySourceSlug } from '$lib/acquisition/acquisition.types';

	import {
		ACQUISITION_SURVEY_SOURCE_OPTIONS,
		acquisitionSurveyOtherFormSchema
	} from '$lib/acquisition';
	import { firstRunExperiencePresenter } from '$lib/onboarding';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';

	import { cn } from '$lib/ui/helpers/common';
	import {
		ONBOARDING_MODAL_DESCRIPTION_CLASS,
		ONBOARDING_MODAL_TITLE_CLASS
	} from '$lib/ui/components/onboarding/onboardingConstants';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';

	type Props = {
		open?: boolean;
		isSubmitting: boolean;
		gateContext: AcquisitionSurveyGateContext;
		onSubmit: (source: AcquisitionSurveySourceSlug, otherDetail?: string) => Promise<boolean>;
		onOpenChange?: (next: boolean) => void;
	};

	let {
		open = $bindable(false),
		isSubmitting,
		gateContext,
		onSubmit,
		onOpenChange
	}: Props = $props();

	let selectedSource = $state<AcquisitionSurveySourceSlug | null>(null);
	let otherDetail = $state('');
	let closeAfterSuccess = $state(false);

	const showOtherField = $derived(selectedSource === 'other');
	const canSubmit = $derived(
		selectedSource !== null && (selectedSource !== 'other' || otherDetail.trim().length > 0)
	);

	$effect(() => {
		if (!open) {
			selectedSource = null;
			otherDetail = '';
			closeAfterSuccess = false;
		}
	});

	$effect(() => {
		firstRunExperiencePresenter.setAcquisitionModalOpen(open);
	});

	function blockDismiss(event: Event) {
		event.preventDefault();
	}

	function handleOpenChange(next: boolean) {
		if (next) {
			open = true;
			onOpenChange?.(true);
			return;
		}

		if (closeAfterSuccess) {
			closeAfterSuccess = false;
			open = false;
			onOpenChange?.(false);
			return;
		}

		open = true;
	}

	async function handleSubmit() {
		if (!selectedSource || !canSubmit || isSubmitting) return;

		if (selectedSource === 'other') {
			const parsed = acquisitionSurveyOtherFormSchema.safeParse({ otherDetail });
			if (!parsed.success) {
				toast.error(parsed.error.issues.map((issue) => issue.message).join(' '));
				return;
			}
		}

		const ok = await onSubmit(
			selectedSource,
			selectedSource === 'other' ? otherDetail.trim() : undefined
		);
		if (!ok) {
			toast.error('Could not save your response. Try again.');
			return;
		}
		closeAfterSuccess = true;
		open = false;
		onOpenChange?.(false);
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content
		class="flex w-full max-w-[min(96vw,52rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
		showCloseButton={false}
		onInteractOutside={blockDismiss}
		onEscapeKeydown={blockDismiss}
	>
		<div class="bg-primary px-6 py-5 text-primary-content">
			<Dialog.Title class={ONBOARDING_MODAL_TITLE_CLASS}>How did you hear about us?</Dialog.Title>
			<Dialog.Description class={ONBOARDING_MODAL_DESCRIPTION_CLASS}>
				Help us understand where new subscribers discover OpenQuok. This takes about ten seconds.
			</Dialog.Description>
		</div>

		<div class="min-h-0 flex-1 overflow-y-auto px-6 py-5 [scrollbar-gutter:stable]">
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
				{#each ACQUISITION_SURVEY_SOURCE_OPTIONS as option (option.slug)}
					<button
						type="button"
						class={cn(
							'flex min-h-[5.75rem] flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-center transition-colors',
							selectedSource === option.slug
								? 'border-primary bg-primary/10 ring-2 ring-primary/30'
								: 'border-base-300 bg-base-100 hover:bg-base-200'
						)}
						disabled={isSubmitting}
						aria-pressed={selectedSource === option.slug}
						onclick={() => {
							selectedSource = option.slug;
							if (option.slug !== 'other') otherDetail = '';
						}}
					>
						<div
							class={cn(
								'grid h-10 w-10 place-items-center rounded-lg',
								option.iconTileClass ?? 'bg-transparent'
							)}
						>
							<AbstractIcon
								name={option.iconName}
								class="h-7 w-7"
								width="28"
								height="28"
								aria-hidden="true"
							/>
						</div>
						<span class="line-clamp-2 text-sm font-medium text-base-content">{option.label}</span>
					</button>
				{/each}
			</div>

			{#if showOtherField}
				<label class="mt-4 block">
					<span class="mb-1.5 block text-sm font-medium text-base-content">Where did you hear about us?</span>
					<input
						type="text"
						bind:value={otherDetail}
						maxlength={200}
						placeholder="e.g. a friend, podcast, or community"
						class="w-full rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content placeholder:text-base-content/50 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
						disabled={isSubmitting}
					/>
				</label>
			{/if}

			{#if !canSubmit}
				<p class="mt-4 text-center text-sm font-medium text-primary">
					Please select an option to continue
				</p>
			{/if}
		</div>

		<div class="flex shrink-0 items-center justify-between gap-3 border-t border-base-300 bg-base-100 px-6 py-4">
			<Button type="button" variant="ghost" size="sm" disabled>
				<AbstractIcon
					name={icons.ArrowLeft.name}
					class="mr-1 h-4 w-4"
					width="16"
					height="16"
					aria-hidden="true"
				/>
				Back
			</Button>

			<Button
				type="button"
				variant="primary"
				size="sm"
				disabled={!canSubmit || isSubmitting}
				onclick={() => void handleSubmit()}
			>
				{#if isSubmitting}
					<span class="flex items-center gap-2">
						<span>Saving…</span>
						<span class="loading loading-spinner loading-sm"></span>
					</span>
				{:else}
					Let's go
				{/if}
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
