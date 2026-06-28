<script lang="ts">
	import type {
		ListingFormSchemaType,
		CategoryChoice,
		TagChoice,
		ListingExtensionFormSchemaType,
		ListingStackFormSchemaType
	} from '$lib/listings/listing.types';

	import { listingExtensionFormSchema, listingStackFormSchema } from '$lib/listings/listing.types';
	import { createForm } from '@tanstack/svelte-form';
	import { toast } from '$lib/ui/sonner';
	import * as Field from '$lib/ui/field';
	import { Textarea } from '$lib/ui/textarea';
	import { Switch } from '$lib/ui/switch';
	import { Alert, AlertTitle, AlertDescription } from '$lib/ui/alert';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Select from '$lib/ui/select';
	import { Input } from '$lib/ui/input';

	type Props = {
		initialValues: Partial<ListingFormSchemaType>;
		categoryChoices: CategoryChoice[];
		tagChoices: TagChoice[];
		listingKind: 'extension' | 'stack';
		isPlatformAdmin: boolean;
		isSubmitting: boolean;
		slugDisplay?: string;
		noListingFound?: boolean;
		onSave: (formData: ListingFormSchemaType) => void | Promise<void>;
		onDiscard: () => void;
	};

	let {
		initialValues,
		categoryChoices,
		tagChoices,
		listingKind,
		isPlatformAdmin,
		isSubmitting,
		slugDisplay = '',
		noListingFound = false,
		onSave,
		onDiscard
	}: Props = $props();

	const extensionTypeOptions = [
		{ value: 'skills', label: 'Skills' },
		{ value: 'mcp', label: 'MCP' },
		{ value: 'both', label: 'Both' }
	];

	const form = createForm(() => ({
		defaultValues: {
			id: initialValues.id ?? '',
			title: initialValues.title ?? '',
			excerpt: initialValues.excerpt ?? '',
			description: initialValues.description ?? '',
			content: initialValues.content ?? '',
			listing_kind: listingKind,
			extension_type:
				listingKind === 'extension'
					? ((initialValues as ListingExtensionFormSchemaType).extension_type ?? null)
					: null,
			install_command_skills: initialValues.install_command_skills ?? '',
			install_command_mcp: initialValues.install_command_mcp ?? '',
			is_official: initialValues.is_official ?? false,
			listing_category_id: initialValues.listing_category_id ?? '',
			tag_ids: initialValues.tag_ids ?? [],
			is_user_published: initialValues.is_user_published ?? false,
			is_admin_published: initialValues.is_admin_published ?? false
		},
		onSubmit: async ({ value }) => {
			const payload = {
				...(value.id ? { id: value.id } : {}),
				title: value.title,
				excerpt: value.excerpt || null,
				description: value.description || null,
				content: value.content || null,
				listing_kind: listingKind,
				...(listingKind === 'extension'
					? { extension_type: value.extension_type || null }
					: {}),
				install_command_skills: value.install_command_skills || null,
				install_command_mcp: value.install_command_mcp || null,
				is_official: value.is_official,
				listing_category_id: value.listing_category_id || null,
				tag_ids: value.tag_ids ?? [],
				is_user_published: value.is_user_published,
				is_admin_published: value.is_admin_published
			};

			const schema =
				listingKind === 'extension' ? listingExtensionFormSchema : listingStackFormSchema;
			const result = schema.safeParse(payload);
			if (!result.success) {
				result.error.issues.forEach((issue) => toast.error(issue.message));
				return;
			}
			await onSave(result.data);
		}
	}));

	function handleFormSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		form.handleSubmit();
	}

	function toggleTag(field: { state: { value: string[] }; handleChange: (v: string[]) => void }, tagId: string, checked: boolean) {
		const current = field.state.value ?? [];
		if (checked) {
			if (!current.includes(tagId)) field.handleChange([...current, tagId]);
		} else {
			field.handleChange(current.filter((id) => id !== tagId));
		}
	}
</script>

{#if noListingFound}
	<div class="flex size-full items-center">
		<Alert variant="error" class="mx-auto max-w-md">
			<AlertTitle>Listing not found</AlertTitle>
			<AlertDescription>
				The listing you're looking for doesn't exist or you don't have permission to edit it.
			</AlertDescription>
		</Alert>
	</div>
{:else}
	<form onsubmit={handleFormSubmit} class="space-y-8">
		<div class="sticky top-0 z-40 flex items-center justify-end">
			<div class="flex flex-col items-center gap-2">
				<form.Subscribe selector={(state) => ({ isDirty: state.isDirty, values: state.values })}>
					{#snippet children(state)}
						{#if state.isDirty}
							<p class="text-xs text-base-content/70">Unsaved changes</p>
						{/if}
						<div class="flex flex-wrap items-center justify-end gap-2 rounded-lg bg-base-200 p-4">
							<Button type="button" variant="outline" disabled={isSubmitting} onclick={onDiscard}>
								Discard
							</Button>
							<Button type="submit" disabled={!state.isDirty || isSubmitting}>
								{state.values?.id ? 'Update' : 'Create'}
							</Button>
						</div>
					{/snippet}
				</form.Subscribe>
			</div>
		</div>

		{#if slugDisplay}
			<p class="text-sm text-base-content/70">Slug: <span class="font-mono">{slugDisplay}</span></p>
		{/if}

		<form.Field name="title">
			{#snippet children(field)}
				<div class="flex flex-col gap-2">
					<Field.Label>Title</Field.Label>
					<Input
						value={field.state.value}
						oninput={(e) => field.handleChange(e.currentTarget.value)}
						placeholder="Listing title"
						disabled={isSubmitting}
					/>
				</div>
			{/snippet}
		</form.Field>

		<form.Field name="excerpt">
			{#snippet children(field)}
				<div class="flex flex-col gap-2">
					<Field.Label>Excerpt</Field.Label>
					<Input
						value={field.state.value ?? ''}
						oninput={(e) => field.handleChange(e.currentTarget.value)}
						placeholder="Short excerpt (max 160 characters)"
						disabled={isSubmitting}
					/>
				</div>
			{/snippet}
		</form.Field>

		<form.Field name="description">
			{#snippet children(field)}
				<div class="flex flex-col gap-2">
					<Field.Label>Description</Field.Label>
					<Textarea
						value={field.state.value ?? ''}
						oninput={(e) => field.handleChange(e.currentTarget.value)}
						rows={4}
						placeholder="Listing description"
						disabled={isSubmitting}
					/>
				</div>
			{/snippet}
		</form.Field>

		<form.Field name="content">
			{#snippet children(field)}
				<div class="flex flex-col gap-2">
					<Field.Label>Content (Markdown)</Field.Label>
					<Textarea
						value={field.state.value ?? ''}
						oninput={(e) => field.handleChange(e.currentTarget.value)}
						rows={12}
						class="font-mono text-sm"
						placeholder="Markdown content"
						disabled={isSubmitting}
					/>
				</div>
			{/snippet}
		</form.Field>

		<form.Field name="listing_category_id">
			{#snippet children(field)}
				<div class="flex flex-col gap-2">
					<Field.Label>Category</Field.Label>
					<Select.Root
						type="single"
						value={field.state.value || ''}
						onValueChange={(value) => field.handleChange(value ?? '')}
					>
						<Select.Trigger class="w-full max-w-md">
							<span class="truncate">
								{#if field.state.value}
									{categoryChoices.find((c) => c.value === field.state.value)?.label ?? 'Select category'}
								{:else}
									No category
								{/if}
							</span>
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="" label="No category" />
							{#each categoryChoices as choice (choice.value)}
								<Select.Item value={choice.value} label={choice.label} />
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			{/snippet}
		</form.Field>

		<form.Field name="tag_ids">
			{#snippet children(field)}
				<div class="flex flex-col gap-2">
					<Field.Label>Tags</Field.Label>
					<div class="flex flex-wrap gap-3 rounded-lg border border-base-300 p-4">
						{#each tagChoices as tag (tag.value)}
							<label class="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									class="checkbox checkbox-sm"
									checked={(field.state.value ?? []).includes(tag.value)}
									onchange={(e) => toggleTag(field, tag.value, e.currentTarget.checked)}
									disabled={isSubmitting}
								/>
								{tag.label}
							</label>
						{/each}
						{#if tagChoices.length === 0}
							<span class="text-sm text-base-content/60">No tags available.</span>
						{/if}
					</div>
				</div>
			{/snippet}
		</form.Field>

		{#if listingKind === 'extension'}
			<form.Field name="extension_type">
				{#snippet children(field)}
					<div class="flex flex-col gap-2">
						<Field.Label>Extension type</Field.Label>
						<Select.Root
							type="single"
							value={field.state.value ?? ''}
							onValueChange={(value) =>
								field.handleChange((value as 'skills' | 'mcp' | 'both' | undefined) || null)}
						>
							<Select.Trigger class="w-full max-w-md">
								<span class="truncate">
									{extensionTypeOptions.find((o) => o.value === field.state.value)?.label ?? 'Select type'}
								</span>
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="" label="None" />
								{#each extensionTypeOptions as option (option.value)}
									<Select.Item value={option.value} label={option.label} />
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				{/snippet}
			</form.Field>

			<form.Field name="install_command_skills">
				{#snippet children(field)}
					<div class="flex flex-col gap-2">
						<Field.Label>Install command (Skills)</Field.Label>
						<Input
							value={field.state.value ?? ''}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							placeholder="e.g. npx skills add …"
							disabled={isSubmitting}
						/>
					</div>
				{/snippet}
			</form.Field>

			<form.Field name="install_command_mcp">
				{#snippet children(field)}
					<div class="flex flex-col gap-2">
						<Field.Label>Install command (MCP)</Field.Label>
						<Input
							value={field.state.value ?? ''}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							placeholder="e.g. npx mcp add …"
							disabled={isSubmitting}
						/>
					</div>
				{/snippet}
			</form.Field>
		{/if}

		<form.Field name="is_official">
			{#snippet children(field)}
				<div class="flex flex-col gap-2 rounded-lg border border-base-300 p-4">
					<Field.Label>Official listing</Field.Label>
					<Field.Description>Mark as an official platform listing.</Field.Description>
					<label class="label cursor-pointer justify-start gap-2">
						<Switch
							checked={field.state.value}
							onchange={(e) => field.handleChange((e.currentTarget as HTMLInputElement).checked)}
							disabled={isSubmitting}
						/>
						<span class="label-text">{field.state.value ? 'Official' : 'Not official'}</span>
					</label>
				</div>
			{/snippet}
		</form.Field>

		<form.Field name="is_user_published">
			{#snippet children(field)}
				<div class="flex flex-col gap-2 rounded-lg border border-base-300 p-4">
					<Field.Label>Publish</Field.Label>
					<Field.Description>Submit for publication when ready.</Field.Description>
					<label class="label cursor-pointer justify-start gap-2">
						<Switch
							checked={field.state.value}
							onchange={(e) => field.handleChange((e.currentTarget as HTMLInputElement).checked)}
							disabled={isSubmitting}
						/>
						<span class="label-text">{field.state.value ? 'Published' : 'Draft'}</span>
					</label>
				</div>
			{/snippet}
		</form.Field>

		{#if isPlatformAdmin}
			<form.Field name="is_admin_published">
				{#snippet children(field)}
					<div class="flex flex-col gap-2 rounded-lg border border-base-300 p-4">
						<Field.Label>Platform admin published</Field.Label>
						<Field.Description>Approve and publish on the public catalog.</Field.Description>
						<label class="label cursor-pointer justify-start gap-2">
							<Switch
								checked={field.state.value ?? false}
								onchange={(e) => field.handleChange((e.currentTarget as HTMLInputElement).checked)}
								disabled={isSubmitting}
							/>
							<span class="label-text">{field.state.value ? 'Approved' : 'Not approved'}</span>
						</label>
					</div>
				{/snippet}
			</form.Field>
		{/if}
	</form>
{/if}
