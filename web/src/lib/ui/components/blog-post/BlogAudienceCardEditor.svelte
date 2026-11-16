<script lang="ts">
	import type { BlogAudienceCardPresetId, BlogSeoAudienceCard } from '$lib/blogs/blog.types';

	import {
		BLOG_AUDIENCE_CARD_PRESETS,
		getBlogAudienceCardPreset
	} from '$lib/blogs/constants/blogAudienceCardPresets';

	import * as Field from '$lib/ui/field';
	import * as Select from '$lib/ui/select';
	import { Textarea } from '$lib/ui/textarea';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		value: BlogSeoAudienceCard | null;
		onChange: (next: BlogSeoAudienceCard | null) => void;
	};

	let { value, onChange }: Props = $props();

	const enabled = $derived(value != null);

	function emptyCard(preset: BlogAudienceCardPresetId = 'developer'): BlogSeoAudienceCard {
		const row = getBlogAudienceCardPreset(preset);
		return {
			preset,
			title: row.defaultTitle,
			description: row.defaultDescription,
			audience_type: null
		};
	}

	function updateCard(patch: Partial<BlogSeoAudienceCard>) {
		if (!value) return;
		onChange({ ...value, ...patch });
	}

	function applyPreset(preset: BlogAudienceCardPresetId) {
		const row = getBlogAudienceCardPreset(preset);
		const current = value ?? emptyCard(preset);
		onChange({
			...current,
			preset,
			title: row.defaultTitle || current.title,
			description: row.defaultDescription || current.description
		});
	}
</script>

<div class="rounded-lg border border-base-300 p-4 space-y-4">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div>
			<Field.Label>Audience card (optional)</Field.Label>
			<Field.Description>
				Shown below the hero image with “This blog is for …”. Drives Schema.org Audience JSON-LD (like
				channel landings).
			</Field.Description>
		</div>
		<Button
			type="button"
			variant={enabled ? 'outline' : 'primary'}
			size="sm"
			onclick={() => onChange(enabled ? null : emptyCard('developer'))}
		>
			{enabled ? 'Remove audience card' : 'Add audience card'}
		</Button>
	</div>

	{#if enabled && value}
		<div class="grid gap-4 md:grid-cols-2">
			<div class="flex flex-col gap-2">
				<Field.Label>Preset</Field.Label>
				<Select.Root
					type="single"
					value={value.preset ?? 'custom'}
					onValueChange={(next) => {
						if (!next) return;
						applyPreset(next as BlogAudienceCardPresetId);
					}}
				>
					<Select.Trigger class="w-full">
						{BLOG_AUDIENCE_CARD_PRESETS.find((row) => row.id === (value.preset ?? 'custom'))?.label ??
							'Custom'}
					</Select.Trigger>
					<Select.Content>
						{#each BLOG_AUDIENCE_CARD_PRESETS as row (row.id)}
							<Select.Item value={row.id} label={row.label} />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex flex-col gap-2">
				<Field.Label>Schema.org audienceType (optional)</Field.Label>
				<input
					type="text"
					class="input input-bordered w-full"
					placeholder="Defaults from card title when empty"
					value={value.audience_type ?? ''}
					maxlength={200}
					oninput={(e) =>
						updateCard({ audience_type: e.currentTarget.value.trim() || null })}
				/>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<Field.Label>Card title</Field.Label>
			<input
				type="text"
				class="input input-bordered w-full"
				placeholder="e.g. Developers"
				value={value.title}
				maxlength={120}
				oninput={(e) => updateCard({ title: e.currentTarget.value })}
			/>
		</div>
		<div class="flex flex-col gap-2">
			<Field.Label>Card description</Field.Label>
			<Textarea
				class="min-h-24"
				placeholder="Who should read this post?"
				value={value.description}
				oninput={(e) => updateCard({ description: e.currentTarget.value })}
			/>
		</div>
	{/if}
</div>