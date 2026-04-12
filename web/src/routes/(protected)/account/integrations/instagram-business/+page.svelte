<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount } from '$lib/area-protected';
	import { INSTAGRAM_BUSINESS_PICKER_SESSION_KEY, integrationsRepository } from '$lib/integrations';
	import { toast } from '$lib/ui/sonner';
	import { absoluteUrl, route } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import { ImageWithFallback } from '$lib/ui/images';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const accountRoot = route(getRootPathAccount());

	const organizationId = $derived(page.url.searchParams.get('organizationId') ?? '');
	const integrationId = $derived(page.url.searchParams.get('integrationId') ?? '');
	const returnTo = $derived(page.url.searchParams.get('returnTo') ?? accountRoot);

	type AccountRow = { id: string; pageId: string; name: string; pictureUrl: string };

	let loading = $state(true);
	let accounts = $state<AccountRow[]>([]);
	let submittingId = $state<string | null>(null);
	let loadError = $state<string | null>(null);

	function readPagesFromConnectSession(): AccountRow[] | null {
		if (typeof sessionStorage === 'undefined') return null;
		const raw = sessionStorage.getItem(INSTAGRAM_BUSINESS_PICKER_SESSION_KEY);
		if (!raw) return null;
		try {
			const parsed = JSON.parse(raw) as { integrationId?: string; pages?: unknown };
			if (parsed.integrationId !== integrationId || !Array.isArray(parsed.pages)) return null;
			sessionStorage.removeItem(INSTAGRAM_BUSINESS_PICKER_SESSION_KEY);
			const rows: AccountRow[] = [];
			for (const item of parsed.pages) {
				if (
					item &&
					typeof item === 'object' &&
					'id' in item &&
					'pageId' in item &&
					'name' in item &&
					'pictureUrl' in item
				) {
					const r = item as Record<string, unknown>;
					rows.push({
						id: String(r.id),
						pageId: String(r.pageId),
						name: String(r.name),
						pictureUrl: String(r.pictureUrl)
					});
				}
			}
			return rows;
		} catch {
			return null;
		}
	}

	$effect(() => {
		void (async () => {
			if (!organizationId || !integrationId) {
				loadError = 'Missing workspace or channel. Return to your account and try again.';
				loading = false;
				return;
			}
			loading = true;
			loadError = null;
			try {
				const fromSession = readPagesFromConnectSession();
				if (fromSession !== null) {
					accounts = fromSession;
					if (fromSession.length === 0) {
						loadError =
							'No Instagram professional accounts were found. Link Instagram to a Facebook Page in Meta, then try again.';
					}
					return;
				}
				loadError =
					'Account list was not found (e.g. you opened this page in a new tab). Go back to Integrations and run the Instagram (Business) connection again.';
				accounts = [];
			} finally {
				loading = false;
			}
		})();
	});

	async function selectAccount(igId: string) {
		if (!organizationId || !integrationId) return;
		const row = accounts.find((a) => a.id === igId);
		if (!row?.pageId) {
			toast.error('Could not resolve this account.');
			return;
		}
		submittingId = igId;
		try {
			const r = await integrationsRepository.saveProviderPage({
				organizationId,
				integrationId,
				pageId: row.pageId,
				id: row.id
			});
			if (!r.ok) {
				toast.error(r.error);
				return;
			}
			toast.success('Instagram channel connected.');
			await goto(absoluteUrl(returnTo), { replaceState: true });
		} catch {
			toast.error('Could not complete setup.');
		} finally {
			submittingId = null;
		}
	}
</script>

<svelte:head>
	<title>Choose Instagram account</title>
</svelte:head>

<div class="mx-auto max-w-lg px-4 py-10">
	<h1 class="text-xl font-semibold text-base-content">Choose an Instagram account</h1>
	<p class="mt-2 text-sm text-base-content/70">
		Select the professional Instagram account linked to your Facebook Page. You can change this later by removing
		and re-adding the channel.
	</p>

	{#if loading}
		<p class="mt-8 flex items-center gap-2 text-sm text-base-content/70">
			<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
			Loading accounts…
		</p>
	{:else if loadError}
		<p class="mt-6 text-sm text-error">{loadError}</p>
		<Button class="mt-4" href={absoluteUrl(returnTo)} variant="outline">Back</Button>
	{:else}
		<ul class="mt-6 flex flex-col gap-2">
			{#each accounts as a (a.id)}
				<li>
					<button
						type="button"
						class="flex w-full items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-3 text-start hover:bg-base-200 disabled:opacity-60"
						disabled={submittingId !== null}
						onclick={() => selectAccount(a.id)}
					>
						<div class="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-base-200">
							<ImageWithFallback
								src={a.pictureUrl?.trim() || null}
								alt=""
								class="h-full w-full object-cover"
								fallbackIcon={icons.Instagram.name}
							/>
						</div>
						<span class="min-w-0 flex-1 truncate font-medium text-base-content">{a.name}</span>
						{#if submittingId === a.id}
							<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 shrink-0 animate-spin" width="16" height="16" />
						{/if}
					</button>
				</li>
			{/each}
		</ul>
		<Button class="mt-6" href={absoluteUrl(returnTo)} variant="ghost">Cancel</Button>
	{/if}
</div>
