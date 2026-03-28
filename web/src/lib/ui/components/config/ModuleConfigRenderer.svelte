<script lang="ts">
	import type { ModuleConfigSchema } from '$lib/config/constants/types';
	import type { ModuleConfigViewModel } from '$lib/config/ModuleConfigRenderer.presenter.svelte';

	import { buildModuleConfigFormSchema } from '$lib/config';
	import { createForm } from '@tanstack/svelte-form';
	import { toast } from '$lib/ui/sonner';

	import { cn } from '$lib/ui/helpers/common';
	import Button from '$lib/ui/buttons/Button.svelte';
	import DynamicFormField from '$lib/ui/components/config/DynamicFormField.svelte';

	type Props = {
		currentConfigVm: ModuleConfigViewModel;
		moduleSchema: ModuleConfigSchema;
		handleUpdateConfigByModuleName: (moduleConfigVm: Record<string, string | boolean>) => Promise<{
			success: boolean;
			message: string;
		}>;
	};

	let { currentConfigVm, moduleSchema, handleUpdateConfigByModuleName }: Props = $props();

	type ModuleConfigInputVm = Record<string, string | boolean>;

	const ModuleFormSchema = $derived.by(() => buildModuleConfigFormSchema(moduleSchema));

	let defaultValues = $derived.by(() =>
		Object.fromEntries(
			Object.entries(moduleSchema).map(([key, schemaItem]) => {
				const currentValue = currentConfigVm?.[key];
				const isSwitch = schemaItem.inputType === 'switch' || schemaItem.type === 'boolean';

				if (currentValue !== undefined) {
					if (isSwitch) {
						if (typeof currentValue === 'string') return [key, currentValue === 'true'];
						return [key, Boolean(currentValue)];
					}
					return [key, String(currentValue)];
				}

				if (isSwitch) {
					return [key, schemaItem.default === true || schemaItem.default === 'true'];
				}

				if (schemaItem.default === undefined || schemaItem.default === null) return [key, ''];
				return [key, String(schemaItem.default)];
			})
		)
	);

	const form = createForm(() => ({
		defaultValues: defaultValues,
		validators: {
			onChange: ModuleFormSchema
		},
		onSubmit: async ({ value }) => {
			const moduleConfigVm = value as ModuleConfigInputVm;

			try {
				const result = await handleUpdateConfigByModuleName(moduleConfigVm);
				if (result.success) {
					toast.success(result.message || 'Configuration updated successfully');
				} else {
					toast.error(result.message || 'Failed to update configuration');
				}
			} catch {
				toast.error('There was an error updating the configuration. Please try again');
			}
		}
	}));

	// Keep form inputs in sync when the presenter loads/refreshes config.
	// This avoids showing only schema defaults when the real values arrive.
	$effect(() => {
		if (Object.keys(currentConfigVm ?? {}).length === 0) return;
		if (form.state.isDirty) return;

		for (const key of Object.keys(moduleSchema)) {
			form.setFieldValue(key, (defaultValues as Record<string, unknown>)[key] as unknown);
		}
	});
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		e.stopPropagation();

		if (form.state.errors?.[0]) {
			Object.entries(form.state.errors[0] as Record<string, Array<{ message?: string }>>).forEach(
				([, errors]) => {
					(errors ?? []).forEach((error) => {
						if (error?.message) toast.error(error.message);
					});
				}
			);
			return;
		}

		form.handleSubmit();
	}}
>
	<div class="flex w-full justify-end">
		<Button class="my-4 mr-4 w-fit" type="submit" variant="outline">Save Settings</Button>
	</div>

	<div class="mb-4">
		{#each Object.entries(moduleSchema) as [key, schemaItem], index}
			<form.Field name={key}>
				{#snippet children(field)}
					<div class={cn('p-4', index % 2 === 0 ? '' : 'bg-info/30')}>
						<DynamicFormField
							field={field}
							fieldName={field.name}
							fieldDescription={schemaItem.description}
							inputType={schemaItem.inputType}
							defaultValue={
								currentConfigVm?.[key] !== undefined
									? schemaItem.inputType === 'switch'
										? typeof currentConfigVm[key] === 'string'
											? currentConfigVm[key] === 'true'
											: Boolean(currentConfigVm[key])
										: currentConfigVm[key]
									: schemaItem.inputType === 'switch'
										? (schemaItem.default as unknown) === true ||
										  (schemaItem.default as unknown) === 'true'
										: schemaItem.default == null
											? ''
											: String(schemaItem.default)
							}
							maxInputLength={schemaItem.maxInputLength}
							options={schemaItem.options || null}
						/>
					</div>
				{/snippet}
			</form.Field>
		{/each}
	</div>

	{#if Object.entries(moduleSchema).length > 4}
		<div class="flex w-full justify-end">
			<Button class="my-4 w-fit" type="submit" variant="outline">Save Settings</Button>
		</div>
	{/if}
</form>

