<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	/** Keep in sync with `extension/src/social/contextMenu.ts` titles. */
	const SOCIAL_CONTEXT_MENU_TITLE = 'Schedule with OpenQuok';
	const DIRECTORY_CONTEXT_MENU_TITLE = 'Auto fill Directory with OpenQuok';

	const menuShell =
		'min-w-[11.5rem] overflow-hidden rounded-lg border border-white/10 bg-[rgb(40,40,40)]/92 py-1 text-[13px] leading-snug text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl';
	const menuRow = 'px-3.5 py-[0.35rem] text-white/90';
	const menuRowMuted = 'px-3.5 py-[0.35rem] text-white/35';
	const menuDivider = 'my-1 h-px bg-white/12';
</script>

<div
	class="pointer-events-none flex h-full min-h-full select-none flex-col bg-[#fafafa] text-[#1a1a1a]"
>
	<header class="border-b border-black/8 bg-white px-5 py-3">
		<div class="flex items-center gap-2 text-[0.65rem] text-black/45">
			<span class="size-2 rounded-full bg-black/15"></span>
			<span>Product updates · OpenQuok blog</span>
		</div>
		<h1 class="mt-2 text-base font-semibold tracking-tight sm:text-lg">
			What to ship before your launch week
		</h1>
	</header>

	<article class="relative flex-1 px-5 py-4">
		<p class="max-w-md text-sm leading-relaxed text-black/70">
			Teams lose momentum when scheduling lives in another tab.
			<span class="rounded-sm bg-[#007AFF]/25 px-0.5 ring-1 ring-[#007AFF]/50">
				Capture the line you are reading
			</span>
			and turn it into a post without retyping the whole article.
		</p>

		<div
			class="absolute left-6 top-[4.25rem] z-10 flex items-start font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"
			role="presentation"
		>
			<div class="{menuShell} shrink-0">
				<div class={menuRowMuted}>Back</div>
				<div class={menuRowMuted}>Forward</div>
				<div class={menuRowMuted}>Reload</div>
				<div class={menuDivider}></div>
				<div
					class="flex items-center justify-between gap-3 bg-[#007AFF] py-[0.35rem] pr-2.5 pl-3.5 text-white"
				>
					<span class="flex min-w-0 items-center gap-2">
						<AbstractIcon
							name={icons.OpenQuok.name}
							class="size-4 shrink-0 rounded-[4px]"
							width="16"
							height="16"
							focusable="false"
						/>
						<span class="truncate font-normal">OpenQuok</span>
					</span>
					<span class="text-[15px] text-white/90" aria-hidden="true">›</span>
				</div>
				<div class={menuDivider}></div>
				<div class={menuRowMuted}>Inspect</div>
			</div>

			<div class="{menuShell} -ml-0.5 min-w-[15.5rem] shrink-0">
				<div class={menuRow}>{SOCIAL_CONTEXT_MENU_TITLE}</div>
				<div class={menuRow}>{DIRECTORY_CONTEXT_MENU_TITLE}</div>
			</div>
		</div>
	</article>
</div>
