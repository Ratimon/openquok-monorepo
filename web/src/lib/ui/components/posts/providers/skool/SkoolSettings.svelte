<script lang="ts">
	import type { SkoolSelectOption } from '$lib/ui/components/posts/providers/provider.types';

	import { untrack } from 'svelte';

	import { integrationsRepository } from '$lib/integrations';

	const LIVE_INTEGRATION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	const LANDING_MOCK_GROUPS: SkoolSelectOption[] = [
		{ value: 'mock-group-1', label: 'OpenQuok Community' }
	];
	const LANDING_MOCK_LABELS: SkoolSelectOption[] = [
		{ value: 'mock-label-announcements', label: 'Announcements' },
		{ value: 'mock-label-wins', label: 'Wins' }
	];

	type Props = {
		title?: string;
		group?: string;
		groupLabel?: string;
		label?: string;
		labelLabel?: string;
		organizationId?: string | null;
		integrationId?: string;
		disabled?: boolean;
	};

	let {
		title = $bindable(''),
		group = $bindable(''),
		groupLabel = $bindable(''),
		label = $bindable(''),
		labelLabel = $bindable(''),
		organizationId = null,
		integrationId = '',
		disabled = false
	}: Props = $props();

	let groups = $state<SkoolSelectOption[]>([]);
	let labels = $state<SkoolSelectOption[]>([]);
	let labelsLoading = $state(false);

	const canLoadTools = $derived(
		!disabled && Boolean(organizationId) && LIVE_INTEGRATION_ID.test(integrationId)
	);

	const displayGroups = $derived(
		groups.length > 0
			? groups
			: integrationId.startsWith('landing-mock-')
				? LANDING_MOCK_GROUPS
				: []
	);

	const displayLabels = $derived(
		labels.length > 0
			? labels
			: integrationId.startsWith('landing-mock-')
				? LANDING_MOCK_LABELS
				: []
	);

	$effect(() => {
		if (!canLoadTools || !organizationId) return;
		const orgId = organizationId;
		const channelId = integrationId;
		void untrack(() => loadGroups(orgId, channelId));
	});

	$effect(() => {
		if (!canLoadTools || !organizationId || !group.trim()) {
			labels = [];
			return;
		}
		const orgId = organizationId;
		const channelId = integrationId;
		const groupId = group;
		void untrack(() => loadLabels(orgId, channelId, groupId));
	});

	function parseOptions(output: unknown): SkoolSelectOption[] {
		if (!Array.isArray(output)) return [];
		const out: SkoolSelectOption[] = [];
		const seen: Record<string, true> = {};
		for (const item of output) {
			if (!item || typeof item !== 'object') continue;
			const rec = item as { value?: unknown; label?: unknown };
			const labelText =
				typeof rec.label === 'string'
					? rec.label.trim()
					: typeof rec.value === 'string'
						? rec.value.trim()
						: '';
			const value =
				typeof rec.value === 'string' && rec.value.trim() ? rec.value.trim() : labelText;
			if (!value || !labelText) continue;
			if (seen[value]) continue;
			seen[value] = true;
			out.push({ value, label: labelText });
		}
		return out;
	}

	async function loadGroups(orgId: string, channelId: string) {
		const result = await integrationsRepository.triggerIntegrationTool({
			organizationId: orgId,
			integrationId: channelId,
			methodName: 'groups'
		});
		if (result.ok) {
			groups = parseOptions(result.output);
		}
	}

	async function loadLabels(orgId: string, channelId: string, groupId: string) {
		labelsLoading = true;
		try {
			const result = await integrationsRepository.triggerIntegrationTool({
				organizationId: orgId,
				integrationId: channelId,
				methodName: 'label',
				data: { id: groupId }
			});
			if (result.ok) {
				const loaded = parseOptions(result.output).filter((opt) => opt.value !== 'none');
				labels = loaded;
				if (loaded.length === 1 && !label.trim()) {
					label = loaded[0]!.value;
					labelLabel = loaded[0]!.label;
				}
			} else {
				labels = [];
			}
		} finally {
			labelsLoading = false;
		}
	}

	function onGroupChange(event: Event) {
		const raw = (event.currentTarget as HTMLSelectElement).value;
		group = raw;
		const match = displayGroups.find((g) => g.value === raw);
		groupLabel = match?.label ?? '';
		label = '';
		labelLabel = '';
	}

	function onLabelChange(event: Event) {
		const raw = (event.currentTarget as HTMLSelectElement).value;
		label = raw;
		const match = displayLabels.find((l) => l.value === raw);
		labelLabel = match?.label ?? '';
	}
</script>

<div class="space-y-4">
	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="skool-title">Title</label>
		<input
			id="skool-title"
			type="text"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			placeholder="Post title"
			bind:value={title}
			{disabled}
		/>
	</div>

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="skool-group">Group</label>
		<select
			id="skool-group"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
			value={group}
			onchange={onGroupChange}
			{disabled}
		>
			<option value="">Select a group</option>
			{#each displayGroups as opt (opt.value)}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>
		<p class="text-xs text-base-content/50">
			Groups load from your Skool account after you connect the channel.
		</p>
	</div>

	<div class="space-y-1">
		<label class="text-xs font-medium text-base-content/70" for="skool-label">Category</label>
		<select
			id="skool-label"
			class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm disabled:opacity-50"
			value={label}
			onchange={onLabelChange}
			disabled={disabled || !group || labelsLoading}
		>
			<option value="">
				{labelsLoading
					? 'Loading categories…'
					: group
						? displayLabels.length
							? 'Select a category'
							: 'No categories loaded — refresh connection'
						: 'Select a group first'}
			</option>
			{#each displayLabels as opt (opt.value)}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>
	</div>
</div>
