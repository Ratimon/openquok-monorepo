<script lang="ts">
	import type {
		ListingFormSchemaType,
		CategoryChoice,
		TagChoice,
		ListingExtensionFormSchemaType,
		ListingStackFormSchemaType
	} from '$lib/listings/listing.types';
	import type { ListingGithubImportPreviewProgrammerModel } from '$lib/listings/Listing.repository.svelte';

	import { listingExtensionFormSchema, listingStackFormSchema } from '$lib/listings/listing.types';
	import {
		LISTING_SCHEMA_TYPES,
		LISTING_SCHEMA_TYPE_LABELS,
		getDefaultSchemaTypeForListingKind,
		getSchemaTypeForExtensionCategory,
		type ListingSchemaType
	} from '$lib/listings/constants/listingSchemaTypes';
	import { collectFormErrorMessages } from '$lib/listings/utils/listingForm';
	import { arraysEqual } from '$lib/ui/helpers/common';
	import { createForm } from '@tanstack/svelte-form';
	import { toast } from '$lib/ui/sonner';

	import FaqEditor from '$lib/ui/components/FaqEditor.svelte';
	import EditorListingValidationNotice from '$lib/ui/components/listing-manager/EditorListingValidationNotice.svelte';
	import StackMembersEditor from '$lib/ui/components/listing-manager/StackMembersEditor.svelte';

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
		stackExtensionChoices?: Array<{
			id: string;
			title: string;
			slug: string;
			extensionType: string | null;
		}>;
		importingGithub?: boolean;
		syncingGithub?: boolean;
		slugDisplay?: string;
		listingId?: string;
		noListingFound?: boolean;
		onSave: (formData: ListingFormSchemaType) => void | Promise<void>;
		onDiscard: () => void;
		onImportGithub?: (
			githubUrl: string,
			extensionType?: 'skills' | 'mcp' | 'both' | null
		) => Promise<{ ok: true; preview: ListingGithubImportPreviewProgrammerModel } | { ok: false; error: string }>;
		onSyncGithub?: (
			listingId: string
		) => Promise<{ ok: true; message: string } | { ok: false; error: string }>;
	};

	let {
		initialValues,
		categoryChoices,
		tagChoices,
		listingKind,
		isPlatformAdmin,
		isSubmitting,
		stackExtensionChoices = [],
		importingGithub = false,
		syncingGithub = false,
		slugDisplay = '',
		listingId = '',
		noListingFound = false,
		onSave,
		onDiscard,
		onImportGithub,
		onSyncGithub
	}: Props = $props();

	let githubImportUrl = $state('');
	let submitAttempted = $state(false);
	let stackMembers = $derived.by(() =>
		((initialValues as ListingStackFormSchemaType).stack_members ?? []).map((member, index) => ({
			...member,
			sort_order: member.sort_order ?? index
		}))
	);
	const formBaseline = (() => ({
		tagIds: [...(initialValues.tag_ids ?? [])],
		isNewListing: !(initialValues.id ?? '').length
	}))();

	function tagsChangedFromInitial(tagIds: string[] | undefined): boolean {
		return !arraysEqual([...(tagIds ?? [])].sort(), [...formBaseline.tagIds].sort());
	}

	function anyFieldDirty(
		fieldMeta?: Partial<Record<string, { isDirty?: boolean } | undefined>>
	): boolean {
		if (!fieldMeta) return false;
		return Object.values(fieldMeta).some((meta) => meta?.isDirty === true);
	}

	function canSaveForm(formState: {
		isDirty: boolean;
		values?: { id?: string; tag_ids?: string[] };
		fieldMeta?: Partial<Record<string, { isDirty?: boolean } | undefined>>;
	}): boolean {
		if (isSubmitting) return false;
		if (formBaseline.isNewListing) return true;
		if (formState.isDirty || anyFieldDirty(formState.fieldMeta)) return true;
		if (tagsChangedFromInitial(formState.values?.tag_ids)) return true;
		return false;
	}

	function hasUnsavedChanges(formState: {
		isDirty: boolean;
		values?: { tag_ids?: string[] };
		fieldMeta?: Partial<Record<string, { isDirty?: boolean } | undefined>>;
	}): boolean {
		return (
			formState.isDirty ||
			anyFieldDirty(formState.fieldMeta) ||
			tagsChangedFromInitial(formState.values?.tag_ids)
		);
	}

	function fieldErrors(field: { state: { meta: { errors?: unknown[] } } }) {
		return field.state.meta.errors as unknown as Array<{ message?: string }>;
	}

	function applySchemaTypeForCategory(categoryId: string) {
		const slug = categoryChoices.find((choice) => choice.value === categoryId)?.slug;
		if (listingKind === 'extension') {
			form.setFieldValue('schema_type', getSchemaTypeForExtensionCategory(slug));
			return;
		}
		form.setFieldValue('schema_type', getDefaultSchemaTypeForListingKind('stack'));
	}

	const initialSkillCommandsJson = $derived(
		JSON.stringify((initialValues as ListingExtensionFormSchemaType).skill_commands ?? [], null, 2)
	);
	const initialMcpToolsJson = $derived(
		JSON.stringify((initialValues as ListingExtensionFormSchemaType).mcp_tools ?? [], null, 2)
	);
	const initialMcpServerConfigJson = $derived(
		JSON.stringify((initialValues as ListingExtensionFormSchemaType).mcp_server_config ?? {}, null, 2)
	);

	let skillCommandsJson = $derived(initialSkillCommandsJson);
	let mcpToolsJson = $derived(initialMcpToolsJson);
	let mcpServerConfigJson = $derived(initialMcpServerConfigJson);

	const extensionTypeOptions = [
		{ value: 'skills', label: 'Skills' },
		{ value: 'mcp', label: 'MCP' },
		{ value: 'both', label: 'Both' }
	];

	const form = createForm(() => {
		const extInitial = initialValues as ListingExtensionFormSchemaType;
		const extType =
			listingKind === 'extension' ? (extInitial.extension_type ?? 'skills') : null;
		const defaultSchemaType =
			(initialValues.schema_type as ListingSchemaType | undefined) ??
			getDefaultSchemaTypeForListingKind(listingKind);
		const initialFaq = Array.isArray(initialValues.faq)
			? initialValues.faq.map((item) => ({
					question: item.question ?? '',
					answer: item.answer ?? ''
				}))
			: [];

		return {
		defaultValues: {
			id: initialValues.id ?? '',
			title: initialValues.title ?? '',
			excerpt: initialValues.excerpt ?? '',
			click_url: initialValues.click_url ?? '',
			click_url_skills:
				extInitial.click_url_skills ?? (extType === 'skills' ? (initialValues.click_url ?? '') : ''),
			click_url_mcp:
				extInitial.click_url_mcp ?? (extType === 'mcp' ? (initialValues.click_url ?? '') : ''),
			description: initialValues.description ?? '',
			description_skills:
				extInitial.description_skills ??
				(extType === 'skills' ? (initialValues.description ?? '') : ''),
			description_mcp:
				extInitial.description_mcp ?? (extType === 'mcp' ? (initialValues.description ?? '') : ''),
			content: initialValues.content ?? '',
			content_skills:
				extInitial.content_skills ?? (extType === 'skills' ? (initialValues.content ?? '') : ''),
			content_mcp: extInitial.content_mcp ?? (extType === 'mcp' ? (initialValues.content ?? '') : ''),
			listing_kind: listingKind,
			extension_type: extType,
			install_command_skills: initialValues.install_command_skills ?? '',
			install_command_mcp: initialValues.install_command_mcp ?? '',
			is_official: initialValues.is_official ?? false,
			source_repo_url: initialValues.source_repo_url ?? '',
			skill_source_url: (initialValues as ListingExtensionFormSchemaType).skill_source_url ?? '',
			skill_name: (initialValues as ListingExtensionFormSchemaType).skill_name ?? '',
			license: initialValues.license ?? '',
			version: initialValues.version ?? '',
			skill_commands: (initialValues as ListingExtensionFormSchemaType).skill_commands ?? [],
			mcp_tools: (initialValues as ListingExtensionFormSchemaType).mcp_tools ?? [],
			mcp_transport: (initialValues as ListingExtensionFormSchemaType).mcp_transport ?? null,
			mcp_server_config: (initialValues as ListingExtensionFormSchemaType).mcp_server_config ?? null,
			listing_category_id: initialValues.listing_category_id ?? '',
			tag_ids: initialValues.tag_ids ?? [],
			is_user_published: initialValues.is_user_published ?? false,
			is_admin_published: initialValues.is_admin_published ?? false,
			schema_type: defaultSchemaType,
			faq: initialFaq
		},
		validators: {
			onChange: (listingKind === 'extension'
				? listingExtensionFormSchema
				: listingStackFormSchema) as never
		},
		onSubmit: async ({ value }) => {
			let parsedSkillCommands: ListingExtensionFormSchemaType['skill_commands'] =
				value.skill_commands ?? [];
			let parsedMcpTools: ListingExtensionFormSchemaType['mcp_tools'] = value.mcp_tools ?? [];
			let parsedMcpConfig: ListingExtensionFormSchemaType['mcp_server_config'] = value.mcp_server_config ?? null;

			const needsSkillsFields =
				listingKind === 'extension' &&
				(value.extension_type === 'skills' || value.extension_type === 'both');

			const needsMcpFields =
				listingKind === 'extension' &&
				(value.extension_type === 'mcp' || value.extension_type === 'both');

			if (needsSkillsFields) {
				try {
					const commandsParsed = JSON.parse(skillCommandsJson || '[]') as unknown;
					if (!Array.isArray(commandsParsed)) {
						toast.error('CLI commands must be a JSON array.');
						return;
					}
					parsedSkillCommands = commandsParsed as ListingExtensionFormSchemaType['skill_commands'];
				} catch {
					toast.error('CLI commands JSON is invalid.');
					return;
				}
			}

			if (needsMcpFields) {
				try {
					const toolsParsed = JSON.parse(mcpToolsJson || '[]') as unknown;
					if (!Array.isArray(toolsParsed)) {
						toast.error('MCP tools must be a JSON array.');
						return;
					}
					parsedMcpTools = toolsParsed as ListingExtensionFormSchemaType['mcp_tools'];
				} catch {
					toast.error('MCP tools JSON is invalid.');
					return;
				}

				try {
					const configParsed = JSON.parse(mcpServerConfigJson || '{}') as unknown;
					if (configParsed == null || typeof configParsed !== 'object' || Array.isArray(configParsed)) {
						toast.error('MCP server config must be a JSON object.');
						return;
					}
					parsedMcpConfig = configParsed as Record<string, unknown>;
					if (Object.keys(parsedMcpConfig).length === 0) {
						parsedMcpConfig = null;
					}
				} catch {
					toast.error('MCP server config JSON is invalid.');
					return;
				}
			}

			const payload = {
				...(value.id ? { id: value.id } : {}),
				title: value.title,
				excerpt: value.excerpt || null,
				click_url: value.click_url || null,
				click_url_skills: value.click_url_skills || null,
				click_url_mcp: value.click_url_mcp || null,
				description: value.description || null,
				description_skills: value.description_skills || null,
				description_mcp: value.description_mcp || null,
				content: value.content || null,
				content_skills: value.content_skills || null,
				content_mcp: value.content_mcp || null,
				listing_kind: listingKind,
				...(listingKind === 'extension'
					? {
							extension_type: value.extension_type,
							source_repo_url: value.source_repo_url || null,
							skill_source_url: value.skill_source_url || null,
							skill_name: value.skill_name || null,
							license: value.license || null,
							version: value.version || null,
							skill_commands: parsedSkillCommands,
							mcp_tools: parsedMcpTools,
							mcp_transport: value.mcp_transport || null,
							mcp_server_config: parsedMcpConfig
						}
					: {}),
				install_command_skills: value.install_command_skills || null,
				install_command_mcp: value.install_command_mcp || null,
				is_official: isPlatformAdmin ? value.is_official : false,
				listing_category_id: value.listing_category_id,
				tag_ids: value.tag_ids ?? [],
				is_user_published: value.is_user_published,
				is_admin_published: value.is_admin_published,
				schema_type: value.schema_type,
				faq: value.faq ?? [],
				...(listingKind === 'stack' ? { stack_members: stackMembers } : {})
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
		};
	});

	function handleFormSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		submitAttempted = true;
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

	function applyGithubPreview(
		preview: ListingGithubImportPreviewProgrammerModel,
		currentExtensionType: 'skills' | 'mcp' | 'both' | null
	) {
		form.setFieldValue('title', preview.title);
		form.setFieldValue('excerpt', preview.excerpt ?? '');
		form.setFieldValue('description', preview.description ?? '');
		form.setFieldValue('content', preview.content ?? '');
		form.setFieldValue('skill_name', preview.skillName ?? '');
		form.setFieldValue('skill_source_url', preview.skillSourceUrl);
		form.setFieldValue('source_repo_url', preview.sourceRepoUrl);
		form.setFieldValue('install_command_skills', preview.installCommandSkills ?? '');
		form.setFieldValue('license', preview.license ?? '');
		form.setFieldValue('version', preview.version ?? '');

		if (currentExtensionType === 'skills' || currentExtensionType === 'both') {
			form.setFieldValue('description_skills', preview.descriptionSkills ?? preview.description ?? '');
			form.setFieldValue('content_skills', preview.contentSkills ?? preview.content ?? '');
		}
	}

	async function handleImportGithub(extensionType?: 'skills' | 'mcp' | 'both' | null) {
		if (!onImportGithub) return;
		const effectiveType = listingKind === 'stack' ? 'skills' : extensionType;
		if (effectiveType === 'mcp') {
			toast.error('GitHub import reads SKILL.md — select Skills or Both first.');
			return;
		}
		const urlValue = githubImportUrl.trim();
		if (!urlValue) {
			toast.error('Paste a GitHub URL first.');
			return;
		}
		const result = await onImportGithub(urlValue, effectiveType ?? null);
		if (result.ok) {
			applyGithubPreview(result.preview, effectiveType ?? null);
			toast.success('Imported from GitHub. Review the fields and save.');
			return;
		}
		toast.error(result.error);
	}

	async function handleSyncGithub(listingId: string) {
		if (!onSyncGithub) return;
		const result = await onSyncGithub(listingId);
		if (result.ok) {
			toast.success(result.message);
			return;
		}
		toast.error(result.error);
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
		<div class="sticky top-0 z-40 space-y-3 bg-base-100/95 pb-2 backdrop-blur-sm">
			<form.Subscribe
				selector={(state) => ({
					isDirty: state.isDirty,
					values: state.values,
					canSubmit: state.canSubmit,
					errors: state.errors,
					fieldMeta: state.fieldMeta
				})}
			>
				{#snippet children(formState)}
					{@const errorMessages = collectFormErrorMessages(formState)}
					{@const showValidationNotice =
						errorMessages.length > 0 &&
						(submitAttempted || hasUnsavedChanges(formState))}
					{#if showValidationNotice}
						<EditorListingValidationNotice messages={errorMessages} />
					{/if}
					<div class="flex flex-col items-end gap-2">
						{#if hasUnsavedChanges(formState)}
							<p class="text-base font-semibold text-base-content">
								You have unsaved changes.
							</p>
						{/if}
						<div class="flex flex-wrap items-center justify-end gap-2 rounded-lg bg-base-200 p-4">
							<Button type="button" variant="outline" disabled={isSubmitting} onclick={onDiscard}>
								Discard
							</Button>
							<Button
								type="submit"
								variant="outline"
								disabled={!canSaveForm(formState)}
							>
								{formState.values?.id ? 'Update' : 'Create'}
							</Button>
						</div>
					</div>
				{/snippet}
			</form.Subscribe>
		</div>

		<form.Field name="is_user_published">
			{#snippet children(field)}
				<div class="flex flex-col gap-2 rounded-lg border border-base-300 p-4">
					<Field.Label>Publish</Field.Label>
					<Field.Description>
						{#if isPlatformAdmin}
							Submit for publication when ready.
						{:else}
							Submit for review when ready. A platform admin must approve before your listing appears on
							the public catalog.
						{/if}
					</Field.Description>
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

		<form.Field name="listing_category_id">
			{#snippet children(field)}
				<div class="flex flex-col gap-2">
					<Field.Label>Category</Field.Label>
					<Field.Description>The main category for this listing. Required for hub browsing.</Field.Description>
					<Select.Root
						type="single"
						value={field.state.value || ''}
						onValueChange={(value) => {
							field.handleChange(value ?? '');
							if (value) applySchemaTypeForCategory(value);
						}}
					>
						<Select.Trigger class="w-full max-w-md">
							<span class="truncate">
								{#if field.state.value}
									{categoryChoices.find((c) => c.value === field.state.value)?.label ?? 'Select category'}
								{:else}
									Select a category
								{/if}
							</span>
						</Select.Trigger>
						<Select.Content>
							{#each categoryChoices as choice (choice.value)}
								<Select.Item value={choice.value} label={choice.label} />
							{/each}
						</Select.Content>
					</Select.Root>
					<Field.Error errors={fieldErrors(field)} />
				</div>
			{/snippet}
		</form.Field>

		<form.Field name="schema_type">
			{#snippet children(field)}
				<div class="flex flex-col gap-2">
					<Field.Label>Schema type (SEO)</Field.Label>
					<Field.Description>
						schema.org type for JSON-LD on the public detail page. Defaults from category for extensions.
					</Field.Description>
					<Select.Root
						type="single"
						value={field.state.value ?? ''}
						onValueChange={(value) => field.handleChange((value as ListingSchemaType) || field.state.value)}
					>
						<Select.Trigger class="w-full max-w-md">
							<span class="truncate">
								{LISTING_SCHEMA_TYPE_LABELS[field.state.value as ListingSchemaType] ??
									'Select schema type'}
							</span>
						</Select.Trigger>
						<Select.Content>
							{#each LISTING_SCHEMA_TYPES as schemaType (schemaType)}
								<Select.Item
									value={schemaType}
									label={LISTING_SCHEMA_TYPE_LABELS[schemaType]}
								/>
							{/each}
						</Select.Content>
					</Select.Root>
					<Field.Error errors={fieldErrors(field)} />
				</div>
			{/snippet}
		</form.Field>

		{#if slugDisplay}
			<p class="text-sm text-base-content/70">Slug: <span class="font-mono">{slugDisplay}</span></p>
		{/if}

		{#if isPlatformAdmin}
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
		{/if}

		{#if listingKind === 'extension'}
			<form.Field name="extension_type">
				{#snippet children(field)}
					<div class="flex flex-col gap-2">
						<Field.Label>Extension type</Field.Label>
						<Field.Description>
							Select type first, then import from GitHub to prefill title and skills fields.
						</Field.Description>
						<Select.Root
							type="single"
							value={field.state.value ?? ''}
							onValueChange={(value) =>
								field.handleChange((value as 'skills' | 'mcp' | 'both') || 'skills')}
						>
							<Select.Trigger class="w-full max-w-md">
								<span class="truncate">
									{extensionTypeOptions.find((o) => o.value === field.state.value)?.label ??
										'Select type'}
								</span>
							</Select.Trigger>
							<Select.Content>
								{#each extensionTypeOptions as option (option.value)}
									<Select.Item value={option.value} label={option.label} />
								{/each}
							</Select.Content>
						</Select.Root>
						<Field.Error errors={fieldErrors(field)} />
					</div>
				{/snippet}
			</form.Field>

			<form.Subscribe selector={(state) => state.values.extension_type}>
				{#snippet children(extensionType)}
					{#if onImportGithub && (extensionType === 'skills' || extensionType === 'both')}
						<div class="space-y-3 rounded-lg border border-base-300 p-4">
							<Field.Label>Import from GitHub (SKILL.md)</Field.Label>
							<Field.Description>
								Prefills title and Skills fields from SKILL.md. For Both listings, MCP fields stay
								empty for manual entry.
							</Field.Description>
							<div class="flex flex-col gap-2 sm:flex-row">
								<Input
									value={githubImportUrl}
									oninput={(e) => (githubImportUrl = e.currentTarget.value)}
									placeholder="https://github.com/owner/repo/..."
									disabled={isSubmitting || importingGithub}
								/>
								<Button
									type="button"
									variant="outline"
									disabled={isSubmitting || importingGithub}
									onclick={() =>
										void handleImportGithub(
											(extensionType as 'skills' | 'mcp' | 'both' | null) ?? null
										)}
								>
									{importingGithub ? 'Importing…' : 'Import from GitHub'}
								</Button>
							</div>
						</div>
					{/if}
				{/snippet}
			</form.Subscribe>
		{/if}

		{#if listingKind === 'stack' && onImportGithub}
			<div class="space-y-3 rounded-lg border border-base-300 p-4">
				<Field.Label>Import from GitHub (SKILL.md)</Field.Label>
				<Field.Description>
					Prefills title and content from SKILL.md.
				</Field.Description>
				<div class="flex flex-col gap-2 sm:flex-row">
					<Input
						value={githubImportUrl}
						oninput={(e) => (githubImportUrl = e.currentTarget.value)}
						placeholder="https://github.com/owner/repo/..."
						disabled={isSubmitting || importingGithub}
					/>
					<Button
						type="button"
						variant="outline"
						disabled={isSubmitting || importingGithub}
						onclick={() => void handleImportGithub('skills')}
					>
						{importingGithub ? 'Importing…' : 'Import from GitHub'}
					</Button>
				</div>
			</div>
		{/if}

		<form.Field name="title">
			{#snippet children(field)}
				<div class="flex flex-col gap-2">
					<Field.Label>Title</Field.Label>
					<Input
						value={field.state.value}
						oninput={(e) => field.handleChange(e.currentTarget.value)}
						onblur={field.handleBlur}
						placeholder="Listing title"
						disabled={isSubmitting}
					/>
					<Field.Error errors={fieldErrors(field)} />
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
						onblur={field.handleBlur}
						placeholder="Short excerpt (max 160 characters)"
						disabled={isSubmitting}
					/>
					<Field.Error errors={fieldErrors(field)} />
				</div>
			{/snippet}
		</form.Field>

		{#if listingKind === 'stack'}
			<StackMembersEditor
				members={stackMembers}
				extensionChoices={stackExtensionChoices}
				onChange={(next) => {
					stackMembers = next;
				}}
			/>
			<form.Field name="click_url">
				{#snippet children(field)}
					<div class="flex flex-col gap-2">
						<Field.Label>External URL</Field.Label>
						<Input
							value={field.state.value ?? ''}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							placeholder="https://www.openquok.com/docs/..."
							disabled={isSubmitting}
						/>
						<Field.Error errors={fieldErrors(field)} />
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
							disabled={isSubmitting}
						/>
					</div>
				{/snippet}
			</form.Field>
		{/if}

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

		<form.Field name="faq">
			{#snippet children(field)}
				<div class="flex flex-col gap-2 rounded-lg border border-base-300 p-4">
					<FaqEditor
						faqs={field.state.value ?? []}
						onChange={(faqs) => field.handleChange(faqs)}
						label="FAQ"
						description="Add Q&A pairs for the public detail page and FAQPage JSON-LD."
					/>
					<Field.Error errors={fieldErrors(field)} />
				</div>
			{/snippet}
		</form.Field>

		{#if listingKind === 'extension'}
			<form.Subscribe selector={(state) => state.values.extension_type}>
				{#snippet children(extensionType)}
					{#if extensionType === 'both'}
						<div class="space-y-6 rounded-lg border border-base-300 p-4">
							<h3 class="text-sm font-semibold uppercase tracking-wide text-base-content/60">Skills</h3>
							<form.Field name="click_url_skills">
								{#snippet children(field)}
									<div class="flex flex-col gap-2">
										<Field.Label>Skills external URL</Field.Label>
										<Field.Description>Setup or install docs CTA on the Skills tab.</Field.Description>
										<Input
											value={field.state.value ?? ''}
											oninput={(e) => field.handleChange(e.currentTarget.value)}
											placeholder="https://www.openquok.com/docs/..."
											disabled={isSubmitting}
										/>
									</div>
								{/snippet}
							</form.Field>
							<form.Field name="description_skills">
								{#snippet children(field)}
									<div class="flex flex-col gap-2">
										<Field.Label>Skills description</Field.Label>
										<Textarea
											value={field.state.value ?? ''}
											oninput={(e) => field.handleChange(e.currentTarget.value)}
											rows={4}
											placeholder="Describe the Skills install path"
											disabled={isSubmitting}
										/>
									</div>
								{/snippet}
							</form.Field>
							<form.Field name="content_skills">
								{#snippet children(field)}
									<div class="flex flex-col gap-2">
										<Field.Label>Skills content (Markdown)</Field.Label>
										<Textarea
											value={field.state.value ?? ''}
											oninput={(e) => field.handleChange(e.currentTarget.value)}
											rows={10}
											class="font-mono text-sm"
											placeholder="Skills tab markdown body"
											disabled={isSubmitting}
										/>
									</div>
								{/snippet}
							</form.Field>
						</div>

						<div class="space-y-6 rounded-lg border border-base-300 p-4">
							<h3 class="text-sm font-semibold uppercase tracking-wide text-base-content/60">MCP</h3>
							<form.Field name="click_url_mcp">
								{#snippet children(field)}
									<div class="flex flex-col gap-2">
										<Field.Label>MCP external URL</Field.Label>
										<Field.Description>Setup guide CTA on the MCP tab.</Field.Description>
										<Input
											value={field.state.value ?? ''}
											oninput={(e) => field.handleChange(e.currentTarget.value)}
											placeholder="https://www.openquok.com/docs/mcp-setup-guides/cursor"
											disabled={isSubmitting}
										/>
									</div>
								{/snippet}
							</form.Field>
							<form.Field name="description_mcp">
								{#snippet children(field)}
									<div class="flex flex-col gap-2">
										<Field.Label>MCP description</Field.Label>
										<Textarea
											value={field.state.value ?? ''}
											oninput={(e) => field.handleChange(e.currentTarget.value)}
											rows={4}
											placeholder="Describe the MCP setup path"
											disabled={isSubmitting}
										/>
									</div>
								{/snippet}
							</form.Field>
							<form.Field name="content_mcp">
								{#snippet children(field)}
									<div class="flex flex-col gap-2">
										<Field.Label>MCP content (Markdown)</Field.Label>
										<Textarea
											value={field.state.value ?? ''}
											oninput={(e) => field.handleChange(e.currentTarget.value)}
											rows={10}
											class="font-mono text-sm"
											placeholder="MCP tab markdown body"
											disabled={isSubmitting}
										/>
									</div>
								{/snippet}
							</form.Field>
						</div>
					{:else if extensionType === 'mcp'}
						<div class="space-y-6 rounded-lg border border-base-300 p-4">
							<h3 class="text-sm font-semibold uppercase tracking-wide text-base-content/60">MCP</h3>
							<form.Field name="click_url_mcp">
								{#snippet children(field)}
									<div class="flex flex-col gap-2">
										<Field.Label>MCP external URL</Field.Label>
										<Field.Description>
											Setup guide or getting started link (shown as a CTA on the detail page).
										</Field.Description>
										<Input
											value={field.state.value ?? ''}
											oninput={(e) => field.handleChange(e.currentTarget.value)}
											placeholder="https://www.openquok.com/docs/mcp-setup-guides/cursor"
											disabled={isSubmitting}
										/>
									</div>
								{/snippet}
							</form.Field>
							<form.Field name="description_mcp">
								{#snippet children(field)}
									<div class="flex flex-col gap-2">
										<Field.Label>MCP description</Field.Label>
										<Textarea
											value={field.state.value ?? ''}
											oninput={(e) => field.handleChange(e.currentTarget.value)}
											rows={4}
											placeholder="Describe what this MCP server provides"
											disabled={isSubmitting}
										/>
									</div>
								{/snippet}
							</form.Field>
							<form.Field name="content_mcp">
								{#snippet children(field)}
									<div class="flex flex-col gap-2">
										<Field.Label>MCP content (Markdown)</Field.Label>
										<Textarea
											value={field.state.value ?? ''}
											oninput={(e) => field.handleChange(e.currentTarget.value)}
											rows={12}
											class="font-mono text-sm"
											placeholder="MCP documentation, tools overview, setup notes"
											disabled={isSubmitting}
										/>
									</div>
								{/snippet}
							</form.Field>
						</div>
					{:else if extensionType === 'skills'}
						<div class="space-y-6 rounded-lg border border-base-300 p-4">
							<h3 class="text-sm font-semibold uppercase tracking-wide text-base-content/60">Skills</h3>
							<form.Field name="click_url_skills">
								{#snippet children(field)}
									<div class="flex flex-col gap-2">
										<Field.Label>Skills external URL</Field.Label>
										<Field.Description>
											Setup or install docs link (shown as a CTA on the detail page).
										</Field.Description>
										<Input
											value={field.state.value ?? ''}
											oninput={(e) => field.handleChange(e.currentTarget.value)}
											placeholder="https://www.openquok.com/docs/..."
											disabled={isSubmitting}
										/>
									</div>
								{/snippet}
							</form.Field>
							<form.Field name="description_skills">
								{#snippet children(field)}
									<div class="flex flex-col gap-2">
										<Field.Label>Skills description</Field.Label>
										<Textarea
											value={field.state.value ?? ''}
											oninput={(e) => field.handleChange(e.currentTarget.value)}
											rows={4}
											placeholder="Describe what this skill does"
											disabled={isSubmitting}
										/>
									</div>
								{/snippet}
							</form.Field>
							<form.Field name="content_skills">
								{#snippet children(field)}
									<div class="flex flex-col gap-2">
										<Field.Label>Skills content (Markdown)</Field.Label>
										<Textarea
											value={field.state.value ?? ''}
											oninput={(e) => field.handleChange(e.currentTarget.value)}
											rows={12}
											class="font-mono text-sm"
											placeholder="Skill documentation markdown"
											disabled={isSubmitting}
										/>
									</div>
								{/snippet}
							</form.Field>
						</div>
					{:else}
						<form.Field name="click_url">
							{#snippet children(field)}
								<div class="flex flex-col gap-2">
									<Field.Label>External URL</Field.Label>
									<Field.Description>
										Primary outbound link for setup docs or getting started (shown as a CTA on the detail page; tracked as clicks).
									</Field.Description>
									<Input
										value={field.state.value ?? ''}
										oninput={(e) => field.handleChange(e.currentTarget.value)}
										placeholder="https://www.openquok.com/docs/..."
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
					{/if}

					<form.Field name="source_repo_url">
						{#snippet children(field)}
							<div class="flex flex-col gap-2">
								<Field.Label>Source repo URL</Field.Label>
								<Input
									value={field.state.value ?? ''}
									oninput={(e) => field.handleChange(e.currentTarget.value)}
									placeholder="https://github.com/owner/repo"
									disabled={isSubmitting}
								/>
							</div>
						{/snippet}
					</form.Field>

					<div class="grid gap-4 sm:grid-cols-2">
						<form.Field name="license">
							{#snippet children(field)}
								<div class="flex flex-col gap-2">
									<Field.Label>License</Field.Label>
									<Input
										value={field.state.value ?? ''}
										oninput={(e) => field.handleChange(e.currentTarget.value)}
										placeholder="MIT"
										disabled={isSubmitting}
									/>
								</div>
							{/snippet}
						</form.Field>

						<form.Field name="version">
							{#snippet children(field)}
								<div class="flex flex-col gap-2">
									<Field.Label>Version</Field.Label>
									<Input
										value={field.state.value ?? ''}
										oninput={(e) => field.handleChange(e.currentTarget.value)}
										placeholder="1.0.0"
										disabled={isSubmitting}
									/>
								</div>
							{/snippet}
						</form.Field>
					</div>

					{#if extensionType === 'skills' || extensionType === 'both'}
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

						<form.Field name="skill_source_url">
							{#snippet children(field)}
								<div class="flex flex-col gap-2">
									<Field.Label>SKILL.md source URL</Field.Label>
									<Input
										value={field.state.value ?? ''}
										oninput={(e) => field.handleChange(e.currentTarget.value)}
										placeholder="https://raw.githubusercontent.com/owner/repo/main/SKILL.md"
										disabled={isSubmitting}
									/>
									{#if field.state.value && listingId && onSyncGithub}
										<Button
											type="button"
											variant="outline"
											size="sm"
											class="self-start"
											disabled={isSubmitting || syncingGithub}
											onclick={() => void handleSyncGithub(listingId)}
										>
											{syncingGithub ? 'Syncing…' : 'Re-sync from GitHub'}
										</Button>
									{/if}
								</div>
							{/snippet}
						</form.Field>

						<form.Field name="skill_name">
							{#snippet children(field)}
								<div class="flex flex-col gap-2">
									<Field.Label>Skill name (frontmatter)</Field.Label>
									<Input
										value={field.state.value ?? ''}
										oninput={(e) => field.handleChange(e.currentTarget.value)}
										placeholder="e.g. openquok-core"
										disabled={isSubmitting}
									/>
								</div>
							{/snippet}
						</form.Field>

						<div class="flex flex-col gap-2">
							<Field.Label>CLI commands (JSON array)</Field.Label>
							<Field.Description>
								Powers the building blocks hub CLI table and Skill Builder command library. Each item needs
								<code class="text-xs">name</code> and
								<code class="text-xs">description</code>; optional
								<code class="text-xs">kind</code>,
								<code class="text-xs">command_template</code>,
								<code class="text-xs">example_prompt</code>, and
								<code class="text-xs">example_payload</code>.
							</Field.Description>
							<Textarea
								bind:value={skillCommandsJson}
								rows={10}
								class="font-mono text-sm"
								placeholder={'[\n  {\n    "name": "posts:create",\n    "description": "Create or schedule social posts.",\n    "kind": "cli",\n    "command_template": "openquok posts:create --json ./post.json"\n  }\n]'}
								disabled={isSubmitting}
							/>
						</div>
					{/if}

					{#if extensionType === 'mcp' || extensionType === 'both'}
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

						<form.Field name="mcp_transport">
							{#snippet children(field)}
								<div class="flex flex-col gap-2">
									<Field.Label>MCP transport</Field.Label>
									<Select.Root
										type="single"
										value={field.state.value ?? ''}
										onValueChange={(value) =>
											field.handleChange((value as 'stdio' | 'sse' | 'http' | undefined) || null)}
									>
										<Select.Trigger class="w-full max-w-md">
											<span class="truncate">{field.state.value ?? 'Select transport'}</span>
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="" label="None" />
											<Select.Item value="stdio" label="stdio" />
											<Select.Item value="sse" label="sse" />
											<Select.Item value="http" label="http" />
										</Select.Content>
									</Select.Root>
								</div>
							{/snippet}
						</form.Field>

						<div class="flex flex-col gap-2">
							<Field.Label>MCP tools (JSON array)</Field.Label>
							<Field.Description>
								Powers the building blocks hub MCP tools table and Skill Builder command library. Each item
								needs <code class="text-xs">name</code> and
								<code class="text-xs">description</code>.
							</Field.Description>
							<Textarea
								bind:value={mcpToolsJson}
								rows={6}
								class="font-mono text-sm"
								placeholder={'[\n  {\n    "name": "integrationList",\n    "description": "List connected social channels."\n  }\n]'}
								disabled={isSubmitting}
							/>
						</div>

						<div class="flex flex-col gap-2">
							<Field.Label>MCP server config (JSON)</Field.Label>
							<Textarea
								bind:value={mcpServerConfigJson}
								rows={8}
								class="font-mono text-sm"
								disabled={isSubmitting}
							/>
						</div>
					{/if}
				{/snippet}
			</form.Subscribe>
		{/if}

	</form>
{/if}
