<script lang="ts">
    import type {
		ConnectedIntegrationProgrammerModel,
		GlobalPlugCatalogEntryPm,
		PlugCatalogProviderPm,
		IntegrationPlugRowPm
	} from '$lib/integrations/Integrations.repository.svelte';
    
	import { goto } from '$app/navigation';
	import { route } from '$lib/utils/path';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { integrationsRepository } from '$lib/integrations';
	
	import { getRootPathAccount, getRootPathCalendar } from '$lib/area-protected';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';

	import * as Dialog from '$lib/ui/dialog';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ImageWithFallback from '$lib/ui/media-files/ImageWithFallback.svelte';
	import Switch from '$lib/ui/switch/switch.svelte';

	// /account and /account/calendar (same pattern as account/+layout.svelte)
	const rootPathAccount = getRootPathAccount();
    const accountPath = route(rootPathAccount);
	// const rootPathCalendar = getRootPathCalendar();
	// const calendarPath = route(`${rootPathAccount}/${rootPathCalendar}`);

	function validationToRegExp(s: string | undefined): RegExp | null {
		if (!s) return null;
		const m = s.trim().match(/^\/(.*)\/([a-z]*)$/);
		if (!m) return null;
		try {
			return new RegExp(m[1] ?? '', m[2] || '');
		} catch {
			return null;
		}
	}

	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

	let plugCatalog = $state<PlugCatalogProviderPm[]>([]);
	let channels = $state<ConnectedIntegrationProgrammerModel[]>([]);
	let loading = $state(true);
	let channelIndex = $state(0);
	let plugConfigModalOpen = $state(false);
	/** One optional “new rule” draft form per plug type (catalog method name). */
	let pendingNewForMethod = $state<string | null>(null);

	const supportedChannels = $derived(
		channels.filter((c) =>
			plugCatalog.some((p) => p.identifier === (c.identifier ?? '').toLowerCase())
		)
	);

	const currentChannel = $derived(supportedChannels[channelIndex] ?? null);
	const catalogForCurrent = $derived(
		plugCatalog.find((p) => p.identifier === (currentChannel?.identifier ?? '').toLowerCase()) ?? null
	);

	let savedPlugs = $state<IntegrationPlugRowPm[]>([]);

	async function reloadChannelsAndCatalog() {
		if (!workspaceId) {
			channels = [];
			plugCatalog = [];
			savedPlugs = [];
			loading = false;
			return;
		}
		loading = true;
		try {
			const [cat, list] = await Promise.all([
				integrationsRepository.getPlugCatalog(),
				integrationsRepository.listConnectedIntegrations(workspaceId)
			]);
			plugCatalog = cat;
			channels = list;
			channelIndex = 0;
			plugConfigModalOpen = false;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void workspaceId;
		void reloadChannelsAndCatalog();
	});

	$effect(() => {
		const ch = currentChannel;
		const ws = workspaceId;
		if (!ch || !ws) {
			savedPlugs = [];
			return;
		}
		void integrationsRepository.listIntegrationPlugs(ws, ch.id).then((rows) => {
			savedPlugs = rows;
		});
	});

	function rowsForMethod(methodName: string): IntegrationPlugRowPm[] {
		return savedPlugs.filter((r) => r.plug_function === methodName);
	}

	function parseRowData(row: IntegrationPlugRowPm | undefined): Record<string, string> {
		if (!row?.data) return {};
		try {
			const raw = JSON.parse(row.data) as { name?: string; value?: string }[];
			if (!Array.isArray(raw)) return {};
			return raw.reduce<Record<string, string>>((acc, x) => {
				if (x.name) acc[x.name] = String(x.value ?? '');
				return acc;
			}, {});
		} catch {
			return {};
		}
	}

	async function savePlug(
		def: GlobalPlugCatalogEntryPm,
		values: Record<string, string>,
		plugId?: string
	) {
		if (!workspaceId || !currentChannel) return;
		for (const f of def.fields) {
			const v = (values[f.name] ?? '').trim();
			if (!v.length) {
				toast.error(`Please fill in “${f.description}”.`);
				return;
			}
			const re = validationToRegExp(f.validation);
			if (re && !re.test(v)) {
				toast.error(`Invalid value for “${f.description}”.`);
				return;
			}
		}
		const fields = def.fields.map((f) => ({ name: f.name, value: (values[f.name] ?? '').trim() }));
		const res = await integrationsRepository.upsertIntegrationPlug({
			organizationId: workspaceId,
			integrationId: currentChannel.id,
			func: def.methodName,
			fields,
			...(plugId ? { plugId } : {})
		});
		if (res.ok) {
			toast.success(plugId ? 'Rule updated' : 'Rule saved');
			savedPlugs = await integrationsRepository.listIntegrationPlugs(workspaceId, currentChannel.id);
			if (!plugId && pendingNewForMethod === def.methodName) {
				pendingNewForMethod = null;
			}
		} else {
			toast.error(res.error);
		}
	}

	async function deletePlugRow(row: IntegrationPlugRowPm) {
		if (!workspaceId || !currentChannel) return;
		if (!confirm('Remove this plug rule?')) return;
		const res = await integrationsRepository.deleteIntegrationPlug({
			organizationId: workspaceId,
			plugId: row.id
		});
		if (res.ok) {
			toast.success('Rule removed');
			savedPlugs = await integrationsRepository.listIntegrationPlugs(workspaceId, currentChannel.id);
		} else {
			toast.error(res.error);
		}
	}

	async function togglePlug(row: IntegrationPlugRowPm | undefined, on: boolean) {
		if (!workspaceId || !currentChannel) return;
		const plugId = row?.id;
		if (!plugId) {
			toast.message('Save plug fields first — then you can enable or pause it.');
			return;
		}
		const res = await integrationsRepository.setIntegrationPlugActivated({
			organizationId: workspaceId,
			plugId,
			activated: on
		});
		if (res.ok) {
			toast.success(on ? 'Plug enabled' : 'Plug paused');
			savedPlugs = await integrationsRepository.listIntegrationPlugs(workspaceId, currentChannel.id);
		} else {
			toast.error(res.error);
			savedPlugs = await integrationsRepository.listIntegrationPlugs(workspaceId, currentChannel.id);
		}
	}

	function fieldDefaults(def: GlobalPlugCatalogEntryPm, row: IntegrationPlugRowPm | undefined): Record<string, string> {
		const merged = { ...parseRowData(row) };
		for (const f of def.fields) {
			if (merged[f.name] === undefined) merged[f.name] = '';
		}
		return merged;
	}

	function openPlugsForChannel(index: number) {
		channelIndex = index;
		pendingNewForMethod = null;
		plugConfigModalOpen = true;
	}

	$effect(() => {
		void currentChannel?.id;
		pendingNewForMethod = null;
	});
</script>

<svelte:head>
	<title>
        Plugs — OpenQuok
    </title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8">
	<div class="mb-8 flex flex-wrap items-center gap-3">
		<AbstractIcon name={icons.Sparkles.name} class="size-8 text-primary" width="32" height="32" />
		<div>
			<h1 class="text-2xl font-semibold tracking-tight text-base-content">
                Plugs
            </h1>
			<p class="text-sm text-base-content/65">
				Auto-reply when a Threads post reaches N like. Auto replies can also be configured per post under Threads settings when scheduling a post but from the same account as the main post only.
			</p>
		</div>
	</div>

	{#if loading}
		<p class="text-sm text-base-content/60">
            Loading…
        </p>
	{:else if !workspaceId}
		<p class="text-sm text-base-content/60">
            Select a workspace to manage plugs.
        </p>
	{:else if !supportedChannels.length}
		<div class="rounded-xl border border-base-300 bg-base-200/20 p-8 text-center">
			<p class="text-base-content/75">
                No channels with plug support yet. Connect Threads to get started.
            </p>
			<Button class="mt-4" variant="outline" onclick={() => void goto(accountPath)}>
				Go to Dashboard
			</Button>
		</div>
	{:else}
		<div class="max-w-xl space-y-3">
			<div class="text-xs font-semibold uppercase tracking-wide text-base-content/50">Channels</div>
			<p class="text-sm text-base-content/60">Choose a channel to open plug settings.</p>
			<ul class="space-y-2">
				{#each supportedChannels as ch, i (ch.id)}
					<li>
						<button
							type="button"
							class="border-base-300 hover:bg-base-200/60 flex w-full items-center gap-3 rounded-xl border bg-base-100 px-3 py-2.5 text-left text-sm transition-colors {plugConfigModalOpen &&
							channelIndex === i
								? 'ring-2 ring-base-content/20 bg-base-200/35'
								: ''}"
							onclick={() => openPlugsForChannel(i)}
						>
							<div class="relative h-11 w-11 shrink-0">
								<ImageWithFallback
									src={ch.picture ?? ''}
									alt=""
									fallbackIcon={icons.User1.name}
									class="border-base-300 h-11 w-11 rounded-full border object-cover"
								/>
								<span
									class="border-base-300 bg-base-100 absolute -right-0.5 -bottom-0.5 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm ring-2 ring-base-100"
									aria-hidden="true"
								>
									<AbstractIcon
										name={socialProviderIcon(ch.identifier)}
										class="text-base-content size-3.5"
										width="14"
										height="14"
									/>
								</span>
							</div>
							<span class="truncate font-medium text-base-content">{ch.name}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>

		<Dialog.Root bind:open={plugConfigModalOpen}>
			<Dialog.Content class="max-h-[min(90vh,720px)] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-2xl">
				{#if currentChannel && catalogForCurrent}
					<Dialog.Header>
						<Dialog.Title class="text-lg">Plugs — {currentChannel.name}</Dialog.Title>
						<Dialog.Description class="text-base-content/65">
							Global plugs run on a schedule after each publish (see timing under each plug).
						</Dialog.Description>
					</Dialog.Header>

					<div class="mt-4 flex items-center gap-3 border-b border-base-300 pb-4">
						<div class="relative h-12 w-12 shrink-0">
							<ImageWithFallback
								src={currentChannel.picture ?? ''}
								alt=""
								fallbackIcon={icons.User1.name}
								class="border-base-300 h-12 w-12 rounded-full border object-cover"
							/>
							<span
								class="border-base-300 bg-base-100 absolute -right-0.5 -bottom-0.5 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm ring-2 ring-base-100"
								aria-hidden="true"
							>
								<AbstractIcon
									name={socialProviderIcon(currentChannel.identifier)}
									class="text-base-content size-3.5"
									width="14"
									height="14"
								/>
							</span>
						</div>
						<div class="min-w-0">
							<div class="truncate font-medium text-base-content">{currentChannel.name}</div>
							<div class="text-xs capitalize text-base-content/55">{currentChannel.identifier}</div>
						</div>
					</div>

					<div class="mt-6 space-y-6">
						{#each catalogForCurrent.plugs as def (def.methodName)}
							<div class="rounded-xl border border-base-300 bg-base-200/20 p-5 shadow-sm">
								<div class="mb-4">
									<h2 class="text-lg font-semibold">{def.title}</h2>
									<p class="mt-1 text-sm text-base-content/65">{def.description}</p>
									<p class="mt-2 text-xs text-base-content/45">
										Checks every {Math.round(def.runEveryMilliseconds / 3600000)}h · up to {def.totalRuns}{' '}
										run{def.totalRuns === 1 ? '' : 's'}
									</p>
								</div>

								{#each rowsForMethod(def.methodName) as row (row.id)}
									{@const values = fieldDefaults(def, row)}
									<div class="border-base-300 bg-base-100/40 mt-4 rounded-lg border p-4">
										<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
											<span class="text-xs font-medium uppercase tracking-wide text-base-content/45">Rule</span>
											<div class="flex flex-wrap items-center gap-2">
												<label class="flex cursor-pointer items-center gap-2">
													<span class="text-xs text-base-content/55">Active</span>
													<Switch
														checked={row.activated === true}
														onchange={(e) => void togglePlug(row, e.currentTarget.checked)}
													/>
												</label>
												<Button
													type="button"
													variant="outline"
													class="text-xs"
													onclick={() => void deletePlugRow(row)}
												>
													Remove
												</Button>
											</div>
										</div>
										<form
											class="space-y-4"
											onsubmit={(e) => {
												e.preventDefault();
												const fd = new FormData(e.currentTarget);
												const next: Record<string, string> = {};
												for (const f of def.fields) {
													next[f.name] = String(fd.get(f.name) ?? '');
												}
												void savePlug(def, next, row.id);
											}}
										>
											{#each def.fields as f (f.name)}
												<label class="block">
													<span class="mb-1 block text-xs font-medium text-base-content/70">{f.description}</span>
													{#if f.type === 'richtext'}
														<textarea
															name={f.name}
															rows={4}
															class="border-base-300 bg-base-100 text-base-content w-full rounded-md border px-3 py-2 text-sm"
															placeholder={f.placeholder}
															value={values[f.name] ?? ''}
														></textarea>
													{:else}
														<input
															name={f.name}
															type={f.type === 'number' ? 'number' : 'text'}
															class="border-base-300 bg-base-100 text-base-content w-full rounded-md border px-3 py-2 text-sm"
															placeholder={f.placeholder}
															value={values[f.name] ?? ''}
														/>
													{/if}
												</label>
											{/each}
											<div class="flex justify-end">
												<Button type="submit" variant="primary">Save changes</Button>
											</div>
										</form>
									</div>
								{/each}

								{#if pendingNewForMethod === def.methodName}
									{@const draftValues = fieldDefaults(def, undefined)}
									<div class="border-base-300 bg-base-100/30 mt-4 rounded-lg border border-dashed p-4">
										<div class="mb-3 text-xs font-medium text-base-content/55">New rule</div>
										<form
											class="space-y-4"
											onsubmit={(e) => {
												e.preventDefault();
												const fd = new FormData(e.currentTarget);
												const next: Record<string, string> = {};
												for (const f of def.fields) {
													next[f.name] = String(fd.get(f.name) ?? '');
												}
												void savePlug(def, next);
											}}
										>
											{#each def.fields as f (f.name)}
												<label class="block">
													<span class="mb-1 block text-xs font-medium text-base-content/70">{f.description}</span>
													{#if f.type === 'richtext'}
														<textarea
															name={f.name}
															rows={4}
															class="border-base-300 bg-base-100 text-base-content w-full rounded-md border px-3 py-2 text-sm"
															placeholder={f.placeholder}
															value={draftValues[f.name] ?? ''}
														></textarea>
													{:else}
														<input
															name={f.name}
															type={f.type === 'number' ? 'number' : 'text'}
															class="border-base-300 bg-base-100 text-base-content w-full rounded-md border px-3 py-2 text-sm"
															placeholder={f.placeholder}
															value={draftValues[f.name] ?? ''}
														/>
													{/if}
												</label>
											{/each}
											<div class="flex flex-wrap justify-end gap-2">
												<Button
													type="button"
													variant="outline"
													onclick={() => {
														pendingNewForMethod = null;
													}}
												>
													Cancel
												</Button>
												<Button type="submit" variant="primary">Save rule</Button>
											</div>
										</form>
									</div>
								{/if}

								<Button
									type="button"
									variant="outline"
									class="mt-4 w-full sm:w-auto"
									disabled={pendingNewForMethod === def.methodName}
									onclick={() => {
										pendingNewForMethod = def.methodName;
									}}
								>
									Add rule
								</Button>
							</div>
						{/each}
					</div>
				{/if}
			</Dialog.Content>
		</Dialog.Root>
	{/if}
</div>
