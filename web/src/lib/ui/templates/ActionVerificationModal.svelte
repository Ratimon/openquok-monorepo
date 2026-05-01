<script lang="ts">
	import type { IconName } from '$data/icons';
	import { ActionVerificationModalStatus } from '$lib/core/ActionVerificationModal.presenter.svelte';

	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Field from '$lib/ui/field';
	import {
		Dialog,
		DialogHeader,
		DialogTitle,
		DialogFooter,
		DialogDescription,
		DialogContent
	} from '$lib/ui/dialog';

	type Props<T> = {
		data: T;
		open?: boolean;
		executionFunction: (data: T) => Promise<{ success: boolean; message: string }>;
		status?: ActionVerificationModalStatus;
		showToastMessage?: boolean;
		toastMessage?: string;
		buttonText?: string;
		buttonIconName?: IconName;
		modalTitle?: string;
		modalDescription?: string;
		modalVerficationWithAnswer?: boolean;
		modalVerificationAnswer?: string;
		onSuccess?: () => void;
	};

	let {
		data,
		open = $bindable(false),
		executionFunction,
		status = $bindable(ActionVerificationModalStatus.UNKNOWN),
		showToastMessage = $bindable(false),
		toastMessage = $bindable(''),
		buttonText = '',
		buttonIconName = icons.CircleX.name,
		modalTitle = 'Action Verification',
		modalDescription = 'Are you sure you want to perform this action?',
		modalVerficationWithAnswer = true,
		modalVerificationAnswer = 'YES',
		onSuccess
	}: Props<unknown> = $props();

	let verificationAnswer = $state('');

	$effect(() => {
		if (open) verificationAnswer = '';
	});

	let isSubmitting: boolean = $derived(status === ActionVerificationModalStatus.SUBMITTING);

	async function onSubmit() {
		try {
			const resultPm = await executionFunction(data);

			if (resultPm.success) {
				toast.success(resultPm.message);
				if (onSuccess) {
					await onSuccess();
				}
			} else {
				toast.error(resultPm.message);
			}
		} catch (error) {
			console.error('Error executing action:', error);
			toast.error('There was an error. Please try again');
		} finally {
			showToastMessage = false;
			open = false;
		}
	}

</script>

<Dialog bind:open>
	<DialogContent showCloseButton={true}>
		<div class="space-y-4">
			<DialogHeader>
				<DialogTitle>{modalTitle}</DialogTitle>
				<DialogDescription>
					{modalDescription}
				</DialogDescription>
			</DialogHeader>

			{#if modalVerficationWithAnswer}
				<div class="space-y-2 py-4">
					<Field.Label for="verificationAnswer">
						Verification: Type "<span class="font-bold">{modalVerificationAnswer}</span>" to confirm your action.
					</Field.Label>
					<input
						id="verificationAnswer"
						type="text"
						placeholder={modalVerificationAnswer}
						bind:value={verificationAnswer}
						class="border-input bg-transparent focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
					/>
				</div>
			{/if}

			<DialogFooter>
				<Button variant="outline" onclick={() => (open = false)}>
					Cancel
				</Button>
				<Button
					variant="warning"
					onclick={onSubmit}
					disabled={
						!data ||
						!executionFunction ||
						(modalVerficationWithAnswer && verificationAnswer !== modalVerificationAnswer) ||
						isSubmitting
					}
				>
					{#if isSubmitting}
						<span class={isSubmitting ? 'animate-spin' : ''}>
							<AbstractIcon name={icons.LoaderCircle.name} width="24" height="24" focusable="false" />
						</span>
					{:else}
						<span class="inline-flex items-center gap-1.5">
							<AbstractIcon
								class="size-4 shrink-0"
								name={buttonIconName}
								width="16"
								height="16"
								focusable="false"
							/>
							<span>{buttonText.trim() || 'Confirm'}</span>
						</span>
					{/if}
				</Button>
			</DialogFooter>
		</div>
	</DialogContent>
</Dialog>
