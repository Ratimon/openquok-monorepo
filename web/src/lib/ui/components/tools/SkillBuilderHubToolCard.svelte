<script lang="ts">
	import type { SkillBuilderChannelHubLinkViewModel } from '$lib/skill-builder/skillBuilder.types';

	import { icons } from '$data/icons';
	import { url } from '$lib/utils/path';

	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		title: string;
		description: string;
		badge?: string;
		genericHref: string;
		channelLinks: SkillBuilderChannelHubLinkViewModel[];
	};

	let { title, description, badge, genericHref, channelLinks }: Props = $props();

	let open = $state(false);
	let cardEl = $state<HTMLDivElement | undefined>();
	let menuWidth = $state<number | undefined>();

	function syncMenuWidth(nextOpen: boolean) {
		open = nextOpen;
		if (nextOpen && cardEl) {
			menuWidth = cardEl.getBoundingClientRect().width;
		}
	}

	function handleNavigate() {
		open = false;
	}
</script>

<li class="h-full">
	<div
		bind:this={cardEl}
		class="flex h-full flex-col rounded-2xl border border-base-content/10 p-6 transition hover:border-primary/40 hover:shadow-md"
	>
		{#if badge}
			<span class="badge badge-primary badge-outline badge-sm w-fit">
				{badge}
			</span>
		{/if}
		<h2 class="mt-2 text-xl font-semibold text-base-content">
			{title}
		</h2>
		<p class="mt-2 flex-1 text-sm text-base-content/70">
			{description}
		</p>
		<div class="mt-4 flex items-center justify-between gap-2">
			<a
				class="text-sm font-medium text-primary hover:underline"
				href={genericHref}
				onclick={handleNavigate}
			>
				Open tool →
			</a>
			<DropdownMenu.Root open={open} onOpenChange={syncMenuWidth}>
				<DropdownMenu.Trigger
					type="button"
					class="btn btn-ghost btn-sm group inline-flex items-center gap-1 px-2"
					aria-haspopup="menu"
					aria-label="Choose a channel-specific Skill Builder"
				>
					<span class="text-xs font-medium text-base-content/70">By channel</span>
					<AbstractIcon
						name={icons.ChevronDown.name}
						width="16"
						height="16"
						class="size-4 shrink-0 opacity-70 transition-transform group-data-[state=open]:rotate-180"
						focusable="false"
					/>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					align="end"
					sideOffset={10}
					style={menuWidth ? `width: ${menuWidth}px` : undefined}
					class="rounded-2xl border border-base-content/10 bg-base-200 p-2 shadow-xl"
				>
					<div
						class="flex max-h-[min(60vh,16rem)] flex-col gap-0.5 overflow-y-auto"
						aria-label="Skill Builder channels"
					>
						{#each channelLinks as channel (channel.slug)}
							<a
								href={url(channel.href)}
								onclick={handleNavigate}
								class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium text-base-content transition-colors hover:bg-base-100/80 hover:text-primary"
							>
								<span
									class="grid size-7 shrink-0 place-items-center rounded-md border border-white/10 bg-base-100/80"
									aria-hidden="true"
								>
									<AbstractIcon
										name={channel.icon}
										width="16"
										height="16"
										class="size-4"
										focusable="false"
									/>
								</span>
								<span class="truncate">{channel.platformLabel}</span>
							</a>
						{/each}
					</div>
					<div class="mt-1 border-t border-base-content/10 pt-1">
						<a
							href={genericHref}
							onclick={handleNavigate}
							class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium text-base-content transition-colors hover:bg-base-100/80 hover:text-primary"
						>
							<span
								class="grid size-7 shrink-0 place-items-center rounded-md border border-white/10 bg-base-100/80"
								aria-hidden="true"
							>
								<AbstractIcon
									name={icons.LayoutTemplate.name}
									width="16"
									height="16"
									class="size-4"
									focusable="false"
								/>
							</span>
							<span class="truncate">For all</span>
						</a>
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</li>
