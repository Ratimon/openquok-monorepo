<script lang="ts">
	import type { DockItem } from '$lib/ui/floating-dock/types';

	import { fly } from 'svelte/transition';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import FloatingDockNotificationMobile from '$lib/ui/floating-dock/FloatingDockNotificationMobile.svelte';
	import { icons } from '$data/icons';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		items: DockItem[];
		class?: string;
	};

	let { items, class: className = '' }: Props = $props();

	let open = $state(false);
	let openSublinksFor = $state<string | null>(null);

	function toggleOpen() {
		open = !open;
		if (!open) openSublinksFor = null;
	}

	function hasSublinks(item: DockItem) {
		return Array.isArray(item.sublinks) && item.sublinks.length > 0;
	}
</script>

<div class="relative block md:hidden {className}">
	{#if open}
		<div class="absolute bottom-full mb-2 inset-x-0 flex flex-col gap-2">
			{#each items as item, idx (item.title)}
				<div
					class="flex flex-col items-center gap-1"
					in:fly={{ y: 10, delay: (items.length - idx) * 50 }}
					out:fly={{ y: 10, delay: idx * 50 }}
					style="transition-delay: {idx * 50}ms;"
				>
					{#if hasSublinks(item)}
						<button
							type="button"
							title={item.title}
							aria-label={item.ariaLabel ?? item.title}
							aria-expanded={openSublinksFor === item.title}
							aria-haspopup="true"
							class="flex h-10 w-10 items-center justify-center rounded-full bg-base-200 text-base-content/70"
							onclick={() => (openSublinksFor = openSublinksFor === item.title ? null : item.title)}
						>
							<AbstractIcon
								name={item.iconName}
								width="16"
								height="16"
								class="size-full"
								focusable="false"
							/>
						</button>
						{#if openSublinksFor === item.title && item.sublinks}
							<div
								class="flex flex-col gap-1 py-1 px-2 rounded-xl border border-base-300 bg-base-200 min-w-[140px]"
								transition:fly={{ y: 4, duration: 120 }}
							>
								{#if item.dropdownHeader}
									<div class="px-2 py-1.5 border-b border-base-300 text-sm font-medium text-base-content truncate">
										{item.dropdownHeader}
									</div>
								{/if}
								{#each item.sublinks as sub (sub.label)}
									{#if sub.href != null}
										<a
											href={sub.href}
											onclick={() => {
												openSublinksFor = null;
												open = false;
											}}
											class={cn(
												'flex items-center gap-2 rounded-md py-1.5 px-2 text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-300',
												sub?.customStyle
											)}
										>
											{#if sub.iconName != null}
												<AbstractIcon name={sub.iconName} width="14" height="14" class="shrink-0" focusable="false" />
											{/if}
											{sub.label}
										</a>
									{:else}
										<button
											type="button"
											onclick={() => {
												sub.onclick?.();
												openSublinksFor = null;
											}}
											class={cn(
												'flex w-full items-center gap-2 rounded-md py-1.5 px-2 text-left text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-300',
												sub?.customStyle
											)}
										>
											{#if sub.iconName != null}
												<AbstractIcon name={sub.iconName} width="14" height="14" class="shrink-0" focusable="false" />
											{/if}
											{sub.label}
										</button>
									{/if}
								{/each}
							</div>
						{/if}
					{:else if item.notificationsPopover && item.notificationsPreview}
						<FloatingDockNotificationMobile {item} />
					{:else if item.href != null}
						<a
							href={item.href}
							title={item.title}
							aria-label={item.ariaLabel ?? item.title}
							class="relative flex h-10 w-10 items-center justify-center rounded-full bg-base-200"
						>
							<AbstractIcon
								name={item.iconName}
								width="16"
								height="16"
								class="size-full text-base-content/70"
								focusable="false"
							/>
							{#if item.badge != null && item.badge > 0}
								<span
									class="pointer-events-none absolute -right-1 -top-1 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-none text-primary-content"
									aria-hidden="true"
								>
									{item.badge > 99 ? '99+' : String(item.badge)}
								</span>
							{/if}
						</a>
					{:else}
						<button
							type="button"
							title={item.title}
							aria-label={item.ariaLabel ?? item.title}
							class="flex h-10 w-10 items-center justify-center rounded-full bg-base-200 text-base-content/70"
							onclick={item.onclick}
						>
							<AbstractIcon
								name={item.iconName}
								width="16"
								height="16"
								class="size-full"
								focusable="false"
							/>
						</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
	<button
		type="button"
		class="flex h-10 w-10 items-center justify-center rounded-full bg-base-200 hover:bg-base-300 transition-colors"
		aria-label={open ? 'Close dock' : 'Open dock'}
		onclick={toggleOpen}
	>
		<AbstractIcon
			name={icons.MenuLine.name}
			width="20"
			height="20"
			class="text-base-content/70"
			focusable="false"
		/>
	</button>
</div>