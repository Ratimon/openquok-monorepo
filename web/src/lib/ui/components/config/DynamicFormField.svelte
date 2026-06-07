<script lang="ts">
	import type { AnyFieldApi } from '@tanstack/svelte-form';

	import * as Field from '$lib/ui/field';
	import { cn } from '$lib/ui/helpers/common';
	import { Textarea } from '$lib/ui/textarea';
	import { Switch } from '$lib/ui/switch';
	import * as Select from '$lib/ui/select';

	import FaqEditor from '$lib/ui/components/FaqEditor.svelte';

	type ValueLabelPair = {
		value: string;
		label: string;
	};

	type Props = {
		field: AnyFieldApi;
		fieldName: string;
		fieldDescription: string;
		inputType: 'input' | 'select' | 'textarea' | 'switch' | 'faq';
		defaultValue: string | number | boolean | unknown[];
		maxInputLength?: number;
		options?: ValueLabelPair[] | null;
	};

	let {
		field,
		fieldName,
		fieldDescription,
		inputType,
		defaultValue,
		maxInputLength,
		options
	}: Props = $props();

	const stringValue = $derived.by(() => String(field.state.value ?? ''));
	const valueLength = $derived.by(() => stringValue.length);

	const checkedValue = $derived.by(() => {
		const v = field.state.value;
		return v === true || v === 'true' || v === 1 || v === '1';
	});

	function placeholder() {
		return defaultValue == null ? '' : String(defaultValue);
	}
</script>

<div class="grid grid-cols-1 gap-4 {inputType === 'faq' ? '' : 'lg:grid-cols-3'}">
	{#if inputType !== 'faq'}
		<div class="lg:col-span-2">
			<Field.Label {field} for={fieldName}>
				{fieldName}
			</Field.Label>
			<Field.Description>{fieldDescription}</Field.Description>
		</div>
	{/if}

	<div class={inputType === 'faq' ? '' : 'lg:col-span-1'}>
		{#if inputType === 'input'}
			<input
				class="input input-bordered w-full"
				type="text"
				placeholder={placeholder()}
				value={stringValue}
				onblur={field.handleBlur}
				oninput={(e) => field.handleChange((e.currentTarget as HTMLInputElement).value)}
			/>

			{#if stringValue && maxInputLength}
				<p
					class={cn(
						'txt-xs italic float-right text-primary mr-1',
						valueLength > maxInputLength && 'text-red-600'
					)}
				>
					{valueLength} / {maxInputLength}
				</p>
			{/if}
		{:else if inputType === 'textarea'}
			<Textarea
				class="w-full"
				rows={4}
				placeholder={placeholder()}
				value={stringValue}
				onblur={field.handleBlur}
				oninput={(e) =>
					field.handleChange((e.currentTarget as HTMLTextAreaElement).value)
				}
			/>

			{#if stringValue && maxInputLength}
				<p
					class={cn(
						'txt-xs italic float-right text-primary mr-1',
						valueLength > maxInputLength && 'text-red-600'
					)}
				>
					{valueLength} / {maxInputLength}
				</p>
			{/if}
		{:else if inputType === 'switch'}
			<Switch
				checked={checkedValue}
				onblur={field.handleBlur}
				onchange={(e) => field.handleChange((e.currentTarget as HTMLInputElement).checked)}
			/>
		{:else if inputType === 'select'}
			<Select.Root
				type="single"
				value={field.state.value || undefined}
				onValueChange={(v) => field.handleChange(v ?? '')}
			>
				<Select.Trigger class="w-full max-w-md">
					{#if field.state.value}
						{options?.find((opt) => opt.value === field.state.value)?.label ??
						'Select value'}
					{:else}
						Select value
					{/if}
				</Select.Trigger>
				<Select.Content>
					{#each options || [] as option (option.value)}
						<Select.Item value={option.value} label={option.label}>
							{option.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{:else if inputType === 'faq'}
			<FaqEditor
				faqs={Array.isArray(field.state.value) ? field.state.value : []}
				onChange={field.handleChange}
				label={fieldName}
				description={fieldDescription}
			/>
		{/if}

		<Field.Error
			errors={field.state.meta.errors as unknown as Array<{ message?: string }>}
		/>
	</div>
</div>

