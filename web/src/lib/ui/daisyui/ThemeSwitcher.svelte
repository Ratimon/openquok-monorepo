<script lang="ts" module>
	export const THEME_STORAGE_KEY = 'theme';
	export const THEME_USER_SET_KEY = 'theme_user_set';

	/**
	 * Ensures a default theme is applied unless the user explicitly chose one.
	 * Intended to be called onMount from layouts (client-only).
	 */
	export function ensureDefaultTheme(defaultTheme: 'forest' | 'light' = 'forest') {
		if (typeof document === 'undefined') return;
		try {
			const userSet = localStorage.getItem(THEME_USER_SET_KEY) === 'true';
			if (!userSet) {
				document.documentElement.setAttribute('data-theme', defaultTheme);
				localStorage.setItem(THEME_STORAGE_KEY, defaultTheme);
			}
		} catch {
			document.documentElement.setAttribute('data-theme', defaultTheme);
		}
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	const THEMES = ['forest', 'light'] as const;
	const STORAGE_KEY = THEME_STORAGE_KEY;
	const USER_SET_KEY = THEME_USER_SET_KEY;

	type Props = {
		/** 'dock' = compact for use inside floating dock (same icon size as other dock items) */
		variant?: 'default' | 'dock';
	};

	let { variant = 'default' }: Props = $props();

	const iconClass = $derived(variant === 'dock' ? 'size-5' : 'w-6 h-6');
	const buttonClass = $derived(
		variant === 'dock'
			? 'absolute inset-0 w-full h-full rounded-full min-w-0 min-h-0 p-0 flex items-center justify-center text-base-content/70 hover:text-base-content transition-colors'
			: 'p-2 rounded-md text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors'
	);

	function getNextTheme(current: string): string {
		const i = THEMES.indexOf(current as (typeof THEMES)[number]);
		return THEMES[(i + 1) % THEMES.length];
	}

	function applyTheme(theme: string) {
		if (typeof document === 'undefined') return;
		document.documentElement.setAttribute('data-theme', theme);
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch {}
	}

	onMount(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			const userSet = localStorage.getItem(USER_SET_KEY) === 'true';
			// Only auto-apply stored theme if the user explicitly chose it before.
			if (userSet && stored && THEMES.includes(stored as (typeof THEMES)[number])) {
				applyTheme(stored);
			}
		} catch {}
	});

	function handleClick() {
		const current = document.documentElement.getAttribute('data-theme') ?? THEMES[0];
		try {
			localStorage.setItem(USER_SET_KEY, 'true');
		} catch {}
		applyTheme(getNextTheme(current));
	}
</script>

<button
	id="theme-switcher"
	type="button"
	onclick={handleClick}
	aria-label="Switch theme (forest, light)"
	class={buttonClass}
>
	<!-- moon -->
	<svg class={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width={2}
			d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
		/>
	</svg>

	<!-- sun -->
	<svg class={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width={2}
			d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
		/>
	</svg>
</button>

<style>
	/* Show icon for the *next* theme:
	   - forest (current) => show sun (switch to light)
	   - light (current) => show moon (switch to forest) */
	:global(html[data-theme='forest']) #theme-switcher > svg:first-of-type {
		display: none;
	}
	:global(html[data-theme='forest']) #theme-switcher > svg:last-of-type {
		display: inline-block;
	}
	:global(html[data-theme='light']) #theme-switcher > svg:first-of-type {
		display: inline-block;
	}
	:global(html[data-theme='light']) #theme-switcher > svg:last-of-type {
		display: none;
	}
</style>