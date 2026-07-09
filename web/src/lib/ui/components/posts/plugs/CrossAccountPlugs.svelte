<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { CrossAccountPlugState } from '$lib/posts/utils/createSocialPostProviderSettings';

	type PlugDefinition = {
		identifier: string;
		title: string;
		description: string;
		pickIntegration?: string[];
		fields?: Array<{
			name: string;
			description: string;
			type: string;
			placeholder: string;
		}>;
	};

	type Props = {
		currentChannel: CreateSocialPostChannelViewModel;
		allChannels: CreateSocialPostChannelViewModel[];
		plugs: PlugDefinition[];
		value?: CrossAccountPlugState[];
		disabled?: boolean;
		compact?: boolean;
	};

	let {
		currentChannel,
		allChannels,
		plugs,
		value = $bindable([]),
		disabled = false,
		compact = false
	}: Props = $props();

	const delayOptions = [
		{ label: 'Immediately', ms: 0 },
		{ label: '1 hour', ms: 3600000 },
		{ label: '2 hours', ms: 7200000 },
		{ label: '3 hours', ms: 10800000 },
		{ label: '8 hours', ms: 28800000 },
		{ label: '12 hours', ms: 43200000 },
		{ label: '24 hours', ms: 86400000 }
	] as const;

	function plugState(identifier: string): CrossAccountPlugState {
		return (
			value.find((p) => p.plugName === identifier) ?? {
				plugName: identifier,
				enabled: false,
				delayMs: 0,
				integrationIds: [],
				fields: {}
			}
		);
	}

	function updatePlug(identifier: string, patch: Partial<CrossAccountPlugState>) {
		const current = plugState(identifier);
		const next = { ...current, ...patch, plugName: identifier };
		const rest = value.filter((p) => p.plugName !== identifier);
		value = [...rest, next];
	}

	function eligibleChannels(def: PlugDefinition) {
		const allowed = def.pickIntegration ?? [];
		if (!allowed.length) return [];
		return allChannels.filter(
			(ch) => allowed.includes(ch.identifier) && ch.id !== currentChannel.id
		);
	}
</script>

{#if plugs.length}
	<div class="space-y-4 {compact ? 'mt-4' : 'mt-6'}">
		{#each plugs as def (def.identifier)}
			{@const state = plugState(def.identifier)}
			{@const accounts = eligibleChannels(def)}
			<div class="border-base-300 bg-base-200/30 rounded-lg border p-4">
				<div class="flex items-center justify-between gap-3">
					<div>
						<div class="text-sm font-medium text-base-content/85">{def.title}</div>
						<p class="mt-0.5 text-xs text-base-content/55">{def.description}</p>
					</div>
					<label class="flex items-center gap-2">
						<input
							type="checkbox"
							class="toggle toggle-primary"
							checked={state.enabled}
							disabled={disabled || !accounts.length}
							onchange={(e) =>
								updatePlug(def.identifier, {
									enabled: (e.currentTarget as HTMLInputElement).checked
								})}
						/>
					</label>
				</div>

				<div class="mt-3 space-y-3 {state.enabled ? '' : 'pointer-events-none opacity-40'}">
					{#if !accounts.length}
						<p class="text-xs text-base-content/55">Connect another channel to use this.</p>
					{:else}
						<label class="block">
							<span class="mb-1 block text-xs font-medium text-base-content/70">Delay</span>
							<select
								class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
								value={state.delayMs}
								disabled={disabled}
								onchange={(e) =>
									updatePlug(def.identifier, {
										delayMs: Number((e.currentTarget as HTMLSelectElement).value)
									})}
							>
								{#each delayOptions as opt (opt.ms)}
									<option value={opt.ms}>{opt.label}</option>
								{/each}
							</select>
						</label>

						{#each def.fields ?? [] as field (field.name)}
							<label class="block">
								<span class="mb-1 block text-xs font-medium text-base-content/70">
									{field.description}
								</span>
								{#if field.type === 'textarea'}
									<textarea
										class="border-base-300 bg-base-100 min-h-[72px] w-full rounded-md border px-3 py-2 text-sm"
										placeholder={field.placeholder}
										disabled={disabled}
										value={state.fields[field.name] ?? ''}
										oninput={(e) =>
											updatePlug(def.identifier, {
												fields: {
													...state.fields,
													[field.name]: (e.currentTarget as HTMLTextAreaElement).value
												}
											})}
									></textarea>
								{:else}
									<input
										class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
										placeholder={field.placeholder}
										disabled={disabled}
										value={state.fields[field.name] ?? ''}
										oninput={(e) =>
											updatePlug(def.identifier, {
												fields: {
													...state.fields,
													[field.name]: (e.currentTarget as HTMLInputElement).value
												}
											})}
									/>
								{/if}
							</label>
						{/each}

						<div>
							<div class="mb-2 text-xs font-medium text-base-content/70">Accounts that will engage</div>
							<div class="flex flex-col gap-2">
								{#each accounts as ch (ch.id)}
									<label class="flex items-center gap-2 text-sm text-base-content/80">
										<input
											type="checkbox"
											class="checkbox checkbox-primary checkbox-sm"
											checked={state.integrationIds.includes(ch.id)}
											disabled={disabled}
											onchange={(e) => {
												const checked = (e.currentTarget as HTMLInputElement).checked;
												const ids = new Set(state.integrationIds);
												if (checked) ids.add(ch.id);
												else ids.delete(ch.id);
												updatePlug(def.identifier, { integrationIds: [...ids] });
											}}
										/>
										<span>{ch.name}</span>
									</label>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}
