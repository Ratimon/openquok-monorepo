<script lang="ts">
	import type { BlogPostFormSchemaType, TopicChoice } from '$lib/blogs/blog.types';
	import type { DatabaseName } from '$lib/core/Image.repository.svelte';

	import { blogPostFormSchema } from '$lib/blogs/blog.types';
	import { createForm } from '@tanstack/svelte-form';
	import { toast } from '$lib/ui/sonner';
	import * as Field from '$lib/ui/field';
	import { ContentEditor } from '$lib/ui/editor';
	import { Textarea } from '$lib/ui/textarea';
	import { Switch } from '$lib/ui/switch';
	import { Alert, AlertTitle, AlertDescription } from '$lib/ui/alert';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Select from '$lib/ui/select';
	import { blogHeroImageUploadAreaPresenter, imageRepository } from '$lib/core/index';
	import SupabaseImageUploadArea from '$lib/ui/supabase/SupabaseImageUploadArea.svelte';

	type Props = {
		initialValues: Partial<BlogPostFormSchemaType>;
		topicChoices: TopicChoice[];
		userId: string;
		isSuperAdmin: boolean;
		isSubmitting: boolean;
		slugDisplay?: string;
		noPostFound?: boolean;
		onSave: (formData: BlogPostFormSchemaType) => void | Promise<void>;
		onDiscard: () => void;
	};

	let {
		initialValues,
		topicChoices,
		userId,
		isSuperAdmin,
		isSubmitting,
		slugDisplay = '',
		noPostFound = false,
		onSave,
		onDiscard
	}: Props = $props();

	const form = createForm(() => ({
		defaultValues: {
			id: initialValues.id ?? '',
			title: initialValues.title ?? '',
			description: initialValues.description ?? '',
			content: initialValues.content ?? '',
			topic_id: initialValues.topic_id ?? '',
			hero_image_filename: initialValues.hero_image_filename ?? '',
			is_sponsored: initialValues.is_sponsored ?? false,
			is_featured: initialValues.is_featured ?? false,
			is_user_published: initialValues.is_user_published ?? false,
			is_admin_approved: initialValues.is_admin_approved ?? false
		},
		onSubmit: async ({ value }) => {
			// Inline content image files are uploaded only on Create/Update click.
			if (contentEditorRef?.hasPendingInlineImages?.()) {
				const committed = await contentEditorRef.commitPendingInlineImages();
				if (!committed) return;
			}
			const latestContent = contentEditorRef?.getCurrentContent?.() ?? value.content;
			form.setFieldValue('content', latestContent);

			// TanStack submit `value` can be a stale snapshot; merge hero path explicitly after upload.
			let heroImageFilename = (value.hero_image_filename ?? '').trim();

			if (heroImageUploadRef?.hasSelectedFile?.()) {
				const uploadedPath = await heroImageUploadRef.uploadSelectedImage();
				if (uploadedPath !== false) {
					heroImageFilename = uploadedPath;
					form.setFieldValue('hero_image_filename', uploadedPath);
				}
				// If upload/replace was cancelled (e.g. delete old object failed), keep existing hero_image_filename and still save other fields.
			}

			const payload = {
				...(value.id ? { id: value.id } : {}),
				title: value.title,
				description: value.description,
				content: latestContent,
				topic_id: value.topic_id,
				hero_image_filename: heroImageFilename || undefined,
				is_sponsored: value.is_sponsored,
				is_featured: value.is_featured,
				is_user_published: value.is_user_published,
				is_admin_approved: value.is_admin_approved
			};
			const result = blogPostFormSchema.safeParse(payload);
			if (!result.success) {
				result.error.issues.forEach((issue) => toast.error(issue.message));
				return;
			}
			await onSave(result.data);
		}
	}));

	// Component reference for image upload
	let heroImageUploadRef: SupabaseImageUploadArea | undefined = $state();
	let contentEditorRef: ContentEditor | undefined = $state();
	let hasPendingHeroImageChanges = $derived(() => heroImageUploadRef?.hasSelectedFile?.());

	function handleFormSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		form.handleSubmit();
	}

	function handleDiscard() {
		onDiscard();
	}

	const handleLoadImageForBlogHeroImage = async (databaseName: DatabaseName, imageUrl: string) => {
		return blogHeroImageUploadAreaPresenter.loadImage(databaseName, imageUrl);
	};

	const handleUploadImageForBlogHeroImage = async (databaseName: DatabaseName, imageFile: File, uid: string) => {
		return blogHeroImageUploadAreaPresenter.uploadImage(databaseName, imageFile, uid);
	};

	/** Remove previous hero object from storage before replacing (see MultiImageUpload / listing editor). */
	const deletePreviousHeroInStorage = async (databaseName: DatabaseName, imagePath: string) => {
		const result = await imageRepository.deleteImage(databaseName, imagePath);
		if (!result.success) {
			throw new Error(result.message);
		}
	};
</script>

{#if noPostFound}
	<div class="flex size-full items-center">
		<Alert variant="error" class="mx-auto max-w-md">
			<AlertTitle>Blog post not found</AlertTitle>
			<AlertDescription>
				The blog post you're looking for doesn't exist or you don't have permission to edit it.
			</AlertDescription>
		</Alert>
	</div>
{:else}
	<form onsubmit={handleFormSubmit} class="space-y-8">
		<div class="sticky top-0 z-40 flex items-center justify-end">
			<div class="flex flex-col items-center gap-2">
				<form.Subscribe selector={(state) => ({ isDirty: state.isDirty, values: state.values })}>
					{#snippet children(state)}
						{#if state.isDirty || hasPendingHeroImageChanges()}
							<p class="text-xs text-base-content/70">
								Unsaved changes</p>
						{/if}
						<div class="flex flex-wrap items-center justify-end gap-2 rounded-lg bg-base-200 p-4">
							<Button type="button" variant="outline" disabled={isSubmitting} onclick={handleDiscard}>
								Discard
							</Button>
							<Button type="submit" disabled={(!state.isDirty && !hasPendingHeroImageChanges()) || isSubmitting}>
								{state.values?.id ? 'Update' : 'Create'}
							</Button>
						</div>
					{/snippet}
				</form.Subscribe>
			</div>
		</div>

		{#if isSuperAdmin}
			<section class="space-y-4">
				<div class="mb-4">
					<h3 class="text-xl font-bold text-base-content">
						Admin</h3>
					<p class="text-sm font-medium text-base-content/70">
						Admin-only flags (featured, sponsored, approval).
					</p>
				</div>
				<div class="divider"></div>
				<div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
					<form.Field name="is_admin_approved">
						{#snippet children(field)}
							<div class="flex flex-col gap-2">
								<Field.Label>Admin approved</Field.Label>
								<Field.Description>
									{field.state.value ? 'Post is published (admin approved).' : 'Approve to publish.'}
								</Field.Description>
								<label class="label cursor-pointer gap-2 justify-start">
									<Switch
										checked={field.state.value}
										onblur={field.handleBlur}
										onchange={(e) =>
											field.handleChange((e.currentTarget as HTMLInputElement).checked)}
									/>
									<span class="label-text">{field.state.value ? 'Approved' : 'Not approved'}</span>
								</label>
								<Field.Error errors={field.state.meta.errors as unknown as Array<{ message?: string }>} />
							</div>
						{/snippet}
					</form.Field>
					<form.Field name="is_featured">
						{#snippet children(field)}
							<div class="flex flex-col gap-2">
								<Field.Label>Featured</Field.Label>
								<Field.Description>Show this post as featured.</Field.Description>
								<label class="label cursor-pointer gap-2 justify-start">
									<Switch
										checked={field.state.value}
										onblur={field.handleBlur}
										onchange={(e) =>
											field.handleChange((e.currentTarget as HTMLInputElement).checked)}
									/>
									<span class="label-text">{field.state.value ? 'Yes' : 'No'}</span>
								</label>
								<Field.Error errors={field.state.meta.errors as unknown as Array<{ message?: string }>} />
							</div>
						{/snippet}
					</form.Field>
					<form.Field name="is_sponsored">
						{#snippet children(field)}
							<div class="flex flex-col gap-2">
								<Field.Label>Sponsored</Field.Label>
								<Field.Description>Mark as sponsored content.</Field.Description>
								<label class="label cursor-pointer gap-2 justify-start">
									<Switch
										checked={field.state.value}
										onblur={field.handleBlur}
										onchange={(e) =>
											field.handleChange((e.currentTarget as HTMLInputElement).checked)}
									/>
									<span class="label-text">{field.state.value ? 'Yes' : 'No'}</span>
								</label>
								<Field.Error errors={field.state.meta.errors as unknown as Array<{ message?: string }>} />
							</div>
						{/snippet}
					</form.Field>
				</div>
			</section>
		{/if}

		<section class="space-y-4">
			<div class="mb-4">
				<h3 class="text-xl font-bold text-base-content">
					Publish</h3>
				<form.Subscribe selector={(s) => s.values?.is_user_published}>
					{#snippet children(state)}
						<p class="text-sm font-medium text-base-content/70">
							{state ? 'This post is set as published by the author.' : 'Draft.'}
						</p>
					{/snippet}
				</form.Subscribe>
			</div>
			<div class="divider"></div>
			<div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
				<form.Field name="is_user_published">
					{#snippet children(field)}
						<div class="flex flex-col gap-2">
							<Field.Label>User published</Field.Label>
							<Field.Description>
								{field.state.value ? 'Author marked as published.' : 'Mark as published to submit for approval.'}
							</Field.Description>
							<label class="label cursor-pointer gap-2 justify-start">
								<Switch
									checked={field.state.value}
									onblur={field.handleBlur}
									onchange={(e) =>
										field.handleChange((e.currentTarget as HTMLInputElement).checked)}
								/>
								<span class="label-text">{field.state.value ? 'Published' : 'Draft'}</span>
							</label>
							<Field.Error errors={field.state.meta.errors as unknown as Array<{ message?: string }>} />
						</div>
					{/snippet}
				</form.Field>
			</div>
		</section>

		<section class="space-y-4">
			<div class="mb-4">
				<h3 class="text-xl font-bold text-base-content">
					Blog details</h3>
				<p class="text-sm font-medium text-base-content/70">
					Title, description, content, and topic.</p>
			</div>
			<div class="divider"></div>
			<div class="space-y-6">
				<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
					<form.Field name="title">
						{#snippet children(field)}
							<div class="flex flex-col gap-2">
								<Field.Label>Title</Field.Label>
								<Field.Description>Post title; used to generate the URL slug.</Field.Description>
								<input
									id="blog-title"
									type="text"
									class="input input-bordered w-full"
									placeholder="Enter post title"
									value={field.state.value}
									onblur={field.handleBlur}
									oninput={(e) => field.handleChange(e.currentTarget.value)}
								/>
								<Field.Error errors={field.state.meta.errors as unknown as Array<{ message?: string }>} />
							</div>
						{/snippet}
					</form.Field>
				</div>
				<form.Field name="description">
					{#snippet children(field)}
						<div class="flex flex-col gap-2">
							<Field.Label>Description</Field.Label>
							<Field.Description>Short description or excerpt (e.g. for meta or cards).</Field.Description>
							<Textarea
								id="blog-description"
								class="min-h-24"
								placeholder="Enter description"
								value={field.state.value}
								onblur={field.handleBlur}
								oninput={(e) => field.handleChange(e.currentTarget.value)}
								maxlength={500}
							/>
							<p class="text-xs text-base-content/60">
								{field.state.value.length}/500</p>
							<Field.Error errors={field.state.meta.errors as unknown as Array<{ message?: string }>} />
						</div>
					{/snippet}
				</form.Field>
				<form.Field name="content">
					{#snippet children(field)}
						<div class="flex flex-col gap-2">
							<Field.Label>Content</Field.Label>
							<Field.Description>Main post body. You can use simple HTML for formatting.</Field.Description>
							<ContentEditor
								bind:this={contentEditorRef}
								content={field.state.value}
								onChange={(v) => field.handleChange(v)}
								outputType="html"
								showMenu={true}
								userId={userId}
								placeholder="Enter content (HTML allowed)"
								class="prose-sm min-h-48 font-mono text-sm"
							/>
							<Field.Error errors={field.state.meta.errors as unknown as Array<{ message?: string }>} />
						</div>
					{/snippet}
				</form.Field>
				<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
					<form.Field name="topic_id">
						{#snippet children(field)}
							<div class="flex flex-col gap-2">
								<Field.Label>Topic</Field.Label>
								<Field.Description>Choose the topic for this post.</Field.Description>
								<Select.Root
									type="single"
									value={field.state.value || undefined}
									onValueChange={(v) => field.handleChange(v ?? '')}
								>
									<Select.Trigger class="w-full max-w-md">
										{topicChoices.find((c) => c.value === field.state.value)?.label ?? 'Select topic'}
									</Select.Trigger>
									<Select.Content>
										{#each topicChoices as choice}
											<Select.Item value={choice.value} label={choice.label}>
												{choice.label}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
								<Field.Error errors={field.state.meta.errors as unknown as Array<{ message?: string }>} />
							</div>
						{/snippet}
					</form.Field>
				</div>
			</div>
		</section>

		<section class="space-y-4">
			<div class="mb-4">
				<h3 class="text-xl font-bold text-base-content">
					Visuals</h3>
				<p class="text-sm font-medium text-base-content/70">
					Hero image filename for the post.</p>
			</div>
			<div class="divider"></div>
			<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
				<form.Field name="hero_image_filename">
					{#snippet children(field)}
						<div class="flex flex-col gap-2">
							<Field.Label>Hero image filename</Field.Label>
							<Field.Description>
								Upload a hero image. The storage path is saved on the post when you save.
							</Field.Description>
							<SupabaseImageUploadArea
								bind:this={heroImageUploadRef}
								duid={userId}
								url={field.state.value}
								width={1200}
								height={630}
								aspectRatio="1200/630"
								databaseName="blog_images"
								deletePreviousStorage={deletePreviousHeroInStorage}
								onFormTouch={(url) => field.handleChange(url)}
								uploadAreaVm={blogHeroImageUploadAreaPresenter.uploadAreaVm}
								onLoadImage={handleLoadImageForBlogHeroImage}
								onUploadImage={handleUploadImageForBlogHeroImage}
								onToastMessageChange={(show) => (blogHeroImageUploadAreaPresenter.uploadAreaVm.showToastMessage = show)}
								onReset={() => blogHeroImageUploadAreaPresenter.reset()}
							/>
							<Field.Error errors={field.state.meta.errors as unknown as Array<{ message?: string }>} />
						</div>
					{/snippet}
				</form.Field>
			</div>
		</section>

		<form.Subscribe selector={(s) => s.values?.id}>
			{#snippet children(state)}
				{#if state && slugDisplay}
					<section class="space-y-4">
						<div class="mb-4">
							<h3 class="text-xl font-bold text-base-content">
								Other</h3>
							<p class="text-sm font-medium text-base-content/70">
								Read-only slug for this post.</p>
						</div>
						<div class="divider"></div>
						<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
							<div class="flex flex-col gap-2">
							<Field.Label>Slug</Field.Label>
								<input
									id="blog-slug"
									type="text"
									class="input input-bordered w-full input-disabled"
									value={slugDisplay}
									disabled
									readonly
								/>
							</div>
						</div>
						<input type="hidden" name="id" value={state} />
					</section>
				{/if}
			{/snippet}
		</form.Subscribe>
	</form>
{/if}
