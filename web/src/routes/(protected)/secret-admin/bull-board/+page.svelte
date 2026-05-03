<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
	import { authenticationRepository } from '$lib/user-auth';
	import { normalizeApiBaseUrl } from '$lib/utils/path';

	type Props = { data: { isSuperAdmin?: boolean } };

	let { data }: Props = $props();
	let isSuperAdmin = $derived(data.isSuperAdmin ?? false);

	/** Public Bull Board path (must match API `BULL_BOARD_PATH` under the API prefix). */
	const defaultBullBoardPath = '/api/v1/admin-queues';
	/** One-shot cookie session so `<script src>`/Bull's own `fetch` include auth (browsers do not add Bearer to those). */
	const bullBoardSessionPath = '/api/v1/admin/bull-board/session';
	const envBullBoardPath =
		typeof import.meta !== 'undefined' && import.meta.env?.VITE_BULL_BOARD_PATH !== undefined
			? String(import.meta.env.VITE_BULL_BOARD_PATH)
			: typeof process !== 'undefined' && process.env?.VITE_BULL_BOARD_PATH !== undefined
				? String(process.env.VITE_BULL_BOARD_PATH)
				: '';
	const configuredBoardPath = (envBullBoardPath || defaultBullBoardPath).trim() || defaultBullBoardPath;

	let iframeUrl = $state<string | null>(null);
	let loadState = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');
	let loadError = $state<string | null>(null);

	function originBaseForApiRequests(): string {
		const apiBase = normalizeApiBaseUrl(String(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default ?? ''));
		if (apiBase) {
			return apiBase;
		}
		if (typeof window === 'undefined') {
			return '';
		}
		return window.location.origin;
	}

	/**
	 * Session + iframe must be same-origin in dev (Vite → `/api` proxy) so the HttpOnly cookie from
	 * `POST /admin/bull-board/session` is stored and sent; cross-origin `POST` to another host with
	 * `SameSite=Lax` is often not stored by browsers, so the iframe would GET without the cookie.
	 */
	function originForBullBoardPage(): string {
		if (import.meta.env.DEV && typeof window !== 'undefined') {
			return window.location.origin;
		}
		return originBaseForApiRequests();
	}

	function toAbsolutePath(path: string): string {
		const p = path.startsWith('/') ? path : `/${path}`;
		const base = originForBullBoardPage();
		if (!base) {
			return p;
		}
		return new URL(p, `${base}/`).href;
	}

	function resolveBullBoardUrl(): string {
		return toAbsolutePath(configuredBoardPath);
	}

	function resolveSessionUrl(suffix: '' | 'clear' = ''): string {
		const path = suffix === 'clear' ? `${bullBoardSessionPath}/clear` : bullBoardSessionPath;
		return toAbsolutePath(path);
	}

	async function clearBullBoardSession() {
		const token = authenticationRepository.getToken();
		if (!token) {
			return;
		}
		try {
			await fetch(resolveSessionUrl('clear'), {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				credentials: 'include'
			});
		} catch {
			// best-effort
		}
	}

	async function loadBoard() {
		loadState = 'loading';
		loadError = null;
		iframeUrl = null;

		const token = authenticationRepository.getToken();
		if (!token) {
			loadState = 'error';
			loadError = 'No access token found. Sign in again, then return here.';
			return;
		}

		const sessionRes = await fetch(resolveSessionUrl(''), {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			credentials: 'include'
		});
		if (!sessionRes.ok) {
			loadState = 'error';
			loadError = `Failed to start Bull Board session (${sessionRes.status} ${sessionRes.statusText}). Is BULL_BOARD_ENABLED=true, and is your user a super admin?`;
			return;
		}

		iframeUrl = resolveBullBoardUrl();
		loadState = 'ready';
	}

	onMount(() => {
		void loadBoard();
	});

	onDestroy(() => {
		void clearBullBoardSession();
	});
</script>

<div class="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col min-h-0 flex-1 gap-3">
	<div>
		<h1 class="text-xl font-semibold text-base-content">
			Queue dashboard</h1>
		<p class="text-sm text-base-content/70 mt-1">
			Bull Board is loaded in an iframe. The API stores a short-lived, path-scoped HttpOnly cookie (via
			<code class="text-xs">POST {bullBoardSessionPath}</code>) so the dashboard’s static assets and own API calls
			can authenticate. Your Bearer token in localStorage cannot be attached to subresource requests on its own.
		</p>
		<p class="text-xs text-base-content/50 mt-2">
			In local dev, use the Vite proxy (omit <code class="text-xs">VITE_API_BASE_URL</code> or point it at
			this site) so session + iframe are same-origin. Optional: <code class="text-xs"
				>VITE_BULL_BOARD_PATH</code> if the board path differs from <code class="text-xs"
				>/api/v1/admin-queues</code>.
		</p>
	</div>

	{#if !isSuperAdmin}
		<div class="alert alert-warning text-sm">
			Super admin only.</div>
	{/if}

	{#if loadState === 'loading' || loadState === 'idle'}
		<div class="text-sm text-base-content/70">
			Loading…</div>
	{/if}

	{#if loadState === 'error' && loadError}
		<div class="alert alert-error text-sm whitespace-pre-wrap">
			{loadError}</div>
		<button type="button" class="btn btn-sm btn-primary w-fit" onclick={() => void loadBoard()}>
			Retry</button>
	{/if}

	{#if iframeUrl}
		<iframe title="Bull Board" class="w-full flex-1 min-h-[70vh] border border-base-300 rounded-box bg-base-100" src={iframeUrl}></iframe>
	{/if}
</div>
