<script lang="ts">
	import { icons } from '$data/icons';

	import * as Tabs from '$lib/ui/tabs';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import {
		LANDING_DIRECTORY_MOCK_DESTINATIONS,
		LANDING_DIRECTORY_MOCK_INCOMPLETE_DESTINATIONS,
		LANDING_DIRECTORY_MOCK_INCOMPLETE_FIELDS,
		LANDING_DIRECTORY_MOCK_INCOMPLETE_PROFILE,
		LANDING_DIRECTORY_MOCK_PROFILE
	} from '$lib/ui/templates/bento/minor-templates/landing/landingDirectoryProfileMock';

	type ProfileCaseTab = 'incomplete' | 'ready';

	type Props = {
		initialTab?: ProfileCaseTab;
		showTabs?: boolean;
	};

	let { initialTab = 'incomplete', showTabs = true }: Props = $props();

	let activeTab = $state<ProfileCaseTab>('incomplete');

	$effect(() => {
		activeTab = initialTab;
	});

	function destinationIsReady(panelReady: boolean, destination: { readyDespiteIncompleteProfile?: boolean }) {
		return panelReady || Boolean(destination.readyDespiteIncompleteProfile);
	}

	const tabTriggerClass =
		'inline-flex h-auto min-h-0 flex-1 items-center justify-center gap-2 rounded-lg border-0 !border-b-0 bg-transparent px-3 py-2.5 text-sm font-semibold text-base-content/75 transition-colors hover:bg-base-content/10 hover:text-base-content sm:flex-none [&.tab-active]:bg-primary [&.tab-active]:text-primary-content [&.tab-active]:shadow-md';

</script>

<div class="select-none bg-base-100 text-base-content">
	<Tabs.Root bind:value={activeTab} class="w-full">
		{#if showTabs}
			<div class="border-b border-base-300 px-3 py-2">
				<Tabs.List
					class="inline-flex w-full max-w-full flex-wrap gap-1 rounded-xl border-2 border-base-content/15 bg-base-200/60 p-1 shadow-sm !border-solid"
					aria-label="Profile readiness examples"
				>
					<Tabs.Trigger value="incomplete" class={tabTriggerClass}>Missing fields</Tabs.Trigger>
					<Tabs.Trigger value="ready" class={tabTriggerClass}>Ready to autofill</Tabs.Trigger>
				</Tabs.List>
			</div>
		{/if}

		<Tabs.Content value="incomplete" class="mt-0">
			{@render profilePanel(false)}
		</Tabs.Content>
		<Tabs.Content value="ready" class="mt-0">
			{@render profilePanel(true)}
		</Tabs.Content>
	</Tabs.Root>
</div>

{#snippet profilePanel(ready: boolean)}
	<div class="space-y-5 p-4 sm:p-5">
		<div class="border-b border-base-300/80 pb-3">
			<p class="text-xs font-medium tracking-wide text-base-content/50 uppercase">My Products</p>
			<p class="mt-1 text-sm font-semibold text-base-content">Business profile</p>
		</div>

		<article
			class="rounded-xl border p-4 shadow-sm {ready
				? 'border-base-300 bg-base-200/40'
				: 'border-warning/35 bg-warning/5'}"
		>
			<div class="flex items-start gap-3">
				<div
					class="grid size-12 shrink-0 place-items-center rounded-xl border text-lg font-semibold {ready
						? 'border-base-300/80 bg-primary/15 text-primary'
						: 'border-dashed border-base-content/25 bg-base-200/80 text-base-content/40'}"
					aria-hidden="true"
				>
					{#if ready}
						{LANDING_DIRECTORY_MOCK_PROFILE.name.trim().slice(0, 1).toUpperCase()}
					{:else}
						?
					{/if}
				</div>
				<div class="min-w-0 flex-1">
					{#if ready}
						<p class="font-semibold text-base-content">{LANDING_DIRECTORY_MOCK_PROFILE.name}</p>
						<p class="mt-0.5 text-sm text-base-content/75">
							{LANDING_DIRECTORY_MOCK_PROFILE.tagline}
						</p>
						<p class="mt-2 line-clamp-2 text-xs leading-relaxed text-base-content/60">
							{LANDING_DIRECTORY_MOCK_PROFILE.description}
						</p>
					{:else}
						<p class="font-semibold text-base-content">{LANDING_DIRECTORY_MOCK_INCOMPLETE_PROFILE.name}</p>
						<p class="mt-2 text-xs font-medium text-warning">3 required fields still empty</p>
						<ul class="mt-3 space-y-1.5">
							{#each LANDING_DIRECTORY_MOCK_INCOMPLETE_FIELDS as field (field.label)}
								<li class="flex items-center justify-between gap-2 text-xs">
									<span class="text-base-content/75">{field.label}</span>
									{#if field.state === 'missing'}
										<span class="badge badge-warning badge-outline text-[0.6rem]">Missing</span>
									{:else}
										<span class="badge badge-ghost text-[0.6rem]">{field.value}</span>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		</article>

		<div>
			<p class="text-xs font-medium tracking-wide text-base-content/50 uppercase">
				Launch destinations
			</p>
			<ul class="mt-3 space-y-2">
				{#each (ready ? LANDING_DIRECTORY_MOCK_DESTINATIONS : LANDING_DIRECTORY_MOCK_INCOMPLETE_DESTINATIONS) as destination (destination.id)}
					<li
						class="flex items-center justify-between gap-3 rounded-xl border border-base-300/90 bg-base-100 px-3 py-2.5"
					>
						<span class="flex min-w-0 items-center gap-2.5 text-sm font-medium text-base-content">
							<AbstractIcon
								name={destination.iconName}
								class="size-7 shrink-0"
								width="28"
								height="28"
								aria-hidden="true"
							/>
							{destination.label}
						</span>
						<span
							class="badge shrink-0 text-[0.65rem] font-semibold {destinationIsReady(
								ready,
								destination
							)
								? 'badge-success badge-outline'
								: 'badge-warning badge-outline'}"
						>
							{destination.statusLabel}
						</span>
					</li>
				{/each}
			</ul>
		</div>

		<p class="flex items-center justify-center gap-2 text-center text-xs text-base-content/55">
			<AbstractIcon
				name={icons.ArrowDown.name}
				class="size-3.5 shrink-0 opacity-70"
				width="14"
				height="14"
				aria-hidden="true"
			/>
			{ready
				? 'Extension autofills each directory form from this profile'
				: 'Each directory checks its own required fields — finish gaps before PeerPush'}
		</p>
	</div>
{/snippet}
