<script lang="ts">
	import type { IconName } from '$data/icons';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { cn } from '$lib/ui/helpers/common';

	type ChecklistItem = {
		id: string;
		label: string;
		done: boolean;
		actionLabel?: string;
		onAction?: () => void;
		disabled?: boolean;
	};

	type ResourceLink = {
		label: string;
		description?: string;
		iconName: IconName;
		href?: string;
		onClick?: () => void;
		external?: boolean;
	};

	type Props = {
		onDismiss: () => void;
		checklistItems: ChecklistItem[];
		automationLinks: ResourceLink[];
		exploreLinks: ResourceLink[];
	};

	let { onDismiss, checklistItems, automationLinks, exploreLinks }: Props = $props();
</script>

<section class="mb-6 overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
	<header
		class="flex flex-col gap-3 border-b border-base-300 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
	>
		<div>
			<h2 class="text-lg font-semibold text-base-content">Getting started</h2>
			<p class="mt-0.5 text-sm text-base-content/65">
				Set up your workspace, schedule posts, and connect agents.
			</p>
		</div>
		<Button type="button" variant="ghost" size="sm" class="shrink-0 self-start" onclick={onDismiss}>
			Don't show this
		</Button>
	</header>

	<div class="grid divide-y divide-base-300 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
		<div class="px-5 py-5">
			<h3 class="text-sm font-semibold text-base-content">Welcome to OpenQuok!</h3>
			<p class="mt-1 text-sm text-base-content/65">
				Complete these steps to get your workspace ready.
			</p>
			<ul class="mt-4 space-y-3">
				{#each checklistItems as item (item.id)}
					<li class="flex items-center justify-between gap-3">
						<div class="flex min-w-0 items-center gap-3">
							<span
								class={cn(
									'flex size-5 shrink-0 items-center justify-center rounded-full border',
									item.done
										? 'border-success/40 bg-success/15 text-success'
										: 'border-base-content/20 bg-base-200/50 text-base-content/30'
								)}
								aria-hidden="true"
							>
								{#if item.done}
									<AbstractIcon name={icons.Check.name} class="size-3" width="12" height="12" />
								{/if}
							</span>
							<span
								class={cn(
									'text-sm',
									item.done ? 'text-base-content/50 line-through' : 'text-base-content'
								)}
							>
								{item.label}
							</span>
						</div>
						{#if !item.done && item.actionLabel && item.onAction}
							<Button
								type="button"
								variant="outline"
								size="sm"
								class="shrink-0"
								disabled={item.disabled}
								onclick={item.onAction}
							>
								{item.actionLabel}
							</Button>
						{/if}
					</li>
				{/each}
			</ul>
		</div>

		<div class="px-5 py-5">
			<h3 class="text-sm font-semibold text-base-content">Automate with agents &amp; CLI</h3>
			<p class="mt-1 text-sm text-base-content/65">Connect OpenClaw or Hermes and use the CLI.</p>
			<ul class="mt-4 space-y-1">
				{#each automationLinks as link (link.label)}
					<li>
						{#if link.onClick}
							<button
								type="button"
								class="flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-base-200/70"
								onclick={link.onClick}
							>
								<span
									class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
								>
									<AbstractIcon name={link.iconName} class="size-4" width="16" height="16" />
								</span>
								<span class="min-w-0">
									<span class="block text-sm font-medium text-base-content">{link.label}</span>
									{#if link.description}
										<span class="mt-0.5 block text-xs text-base-content/60">{link.description}</span>
									{/if}
								</span>
							</button>
						{:else if link.href}
							<a
								href={link.href}
								class="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-base-200/70"
								{...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
							>
								<span
									class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
								>
									<AbstractIcon name={link.iconName} class="size-4" width="16" height="16" />
								</span>
								<span class="min-w-0">
									<span class="block text-sm font-medium text-base-content">{link.label}</span>
									{#if link.description}
										<span class="mt-0.5 block text-xs text-base-content/60">{link.description}</span>
									{/if}
								</span>
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		</div>

		<div class="px-5 py-5">
			<h3 class="text-sm font-semibold text-base-content">Explore the dashboard</h3>
			<p class="mt-1 text-sm text-base-content/65">Calendar, plugs, templates, and more.</p>
			<ul class="mt-4 space-y-1">
				{#each exploreLinks as link (link.href)}
					<li>
						<a
							href={link.href}
							class="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-base-200/70"
						>
							<span
								class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-base-200 text-base-content/75"
							>
								<AbstractIcon name={link.iconName} class="size-4" width="16" height="16" />
							</span>
							<span class="min-w-0">
								<span class="block text-sm font-medium text-base-content">{link.label}</span>
								{#if link.description}
									<span class="mt-0.5 block text-xs text-base-content/60">{link.description}</span>
								{/if}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
