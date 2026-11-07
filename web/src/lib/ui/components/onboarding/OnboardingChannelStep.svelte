<script lang="ts">
	import type { IntegrationCatalogItemProgrammerModel } from '$lib/integrations/Integrations.repository.svelte';
	import type { DirectoryAddChannelTileVm } from '$lib/auto-launch/buildDirectoryAddChannelTiles';

	import { cn } from '$lib/ui/helpers/common';
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import DirectoryAddChannelTileIcon from '$lib/ui/components/auto-launch/DirectoryAddChannelTileIcon.svelte';
	import * as Tooltip from '$lib/ui/tooltip';

	type AddChannelCategoryFilter = 'all' | 'directory' | 'social';

	type Props = {
		providers: IntegrationCatalogItemProgrammerModel[];
		directoryTiles: DirectoryAddChannelTileVm[];
		loading: boolean;
		onPickProvider: (identifier: string) => void;
		onPickDirectoryTile: (tile: DirectoryAddChannelTileVm) => void;
	};

	let {
		providers,
		directoryTiles,
		loading,
		onPickProvider,
		onPickDirectoryTile
	}: Props = $props();

	let channelCategoryFilter = $state<AddChannelCategoryFilter>('all');
	let directoryLogoFailedBySiteKey = $state<Record<string, boolean>>({});

	function categoryFilterButtonClass(active: boolean): string {
		return `inline-flex flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none ${
			active
				? 'bg-base-100 font-semibold text-base-content shadow-sm'
				: 'text-base-content/65 hover:bg-base-content/10 hover:text-base-content'
		}`;
	}

	function directoryTileShowsLogo(tile: DirectoryAddChannelTileVm): boolean {
		return Boolean(tile.logoUrl) && !directoryLogoFailedBySiteKey[tile.siteKey];
	}
</script>

<div class="px-6 py-6">
	<p class="mb-4 text-sm text-base-content/70">Click a channel to add it.</p>
	{#if loading}
		<div class="flex items-center gap-2 py-10 text-base-content/70">
			<AbstractIcon
				name={icons.LoaderCircle.name}
				class="h-4 w-4 animate-spin"
				width="16"
				height="16"
			/>
			Loading providers…
		</div>
	{:else}
		{@const showDirectoryTiles =
			directoryTiles.length > 0 &&
			(channelCategoryFilter === 'all' || channelCategoryFilter === 'directory')}
		{@const showSocialProviders =
			providers.length > 0 && (channelCategoryFilter === 'all' || channelCategoryFilter === 'social')}
		{@const hasAnyChannelOption = directoryTiles.length > 0 || providers.length > 0}
		{#if !hasAnyChannelOption}
			<div class="py-10 text-sm text-base-content/70">No providers available right now.</div>
		{:else}
			{#if directoryTiles.length > 0 && providers.length > 0}
				<div class="mb-4">
					<div
						class="grid w-full max-w-2xl grid-cols-3 gap-1 rounded-lg bg-base-200 p-1 sm:inline-flex sm:w-auto sm:max-w-none sm:grid-cols-none"
						role="group"
						aria-label="Channel category"
					>
						<button
							type="button"
							class={categoryFilterButtonClass(channelCategoryFilter === 'all')}
							aria-pressed={channelCategoryFilter === 'all'}
							onclick={() => (channelCategoryFilter = 'all')}
						>
							All
						</button>
						<button
							type="button"
							class={categoryFilterButtonClass(channelCategoryFilter === 'social')}
							aria-pressed={channelCategoryFilter === 'social'}
							onclick={() => (channelCategoryFilter = 'social')}
						>
							Social platforms
						</button>
						<button
							type="button"
							class={categoryFilterButtonClass(channelCategoryFilter === 'directory')}
							aria-pressed={channelCategoryFilter === 'directory'}
							onclick={() => (channelCategoryFilter = 'directory')}
						>
							Directory launches
						</button>
					</div>
				</div>
			{/if}
			{#if !showDirectoryTiles && !showSocialProviders}
				<p class="py-6 text-center text-sm text-base-content/70">
					{channelCategoryFilter === 'directory'
						? 'No directory launches to show.'
						: 'No social platforms to show.'}
				</p>
			{:else}
				<div
					class={cn(
						'grid gap-2 justify-items-stretch justify-center sm:gap-[10px]',
						'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9'
					)}
				>
					{#if showSocialProviders}
						{#each providers as p (p.identifier)}
							<button
								type="button"
								class="group relative flex min-h-[5.5rem] w-full min-w-0 max-w-none flex-col items-stretch justify-start gap-1.5 overflow-visible rounded-xl border border-base-300 bg-base-100 px-2 py-2 text-center whitespace-normal hover:bg-base-200"
								onclick={() => onPickProvider(p.identifier)}
							>
								<div
									class="mx-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-base-200"
								>
									<AbstractIcon
										name={socialProviderIcon(p.identifier)}
										class="h-6 w-6"
										width="24"
										height="24"
									/>
								</div>
								<div
									class="min-w-0 w-full shrink text-balance break-words text-sm font-medium leading-snug text-base-content"
								>
									{p.name ?? p.identifier}
								</div>
								{#if p.toolTip}
									<Tooltip.Root>
										<Tooltip.Trigger>
											{#snippet child({ props: tipProps })}
												{@const { class: tipClass, ...tipRest } = tipProps}
												<span
													{...tipRest}
													class={`absolute right-2 top-2 ${String(tipClass ?? '')} text-base-content/70 group-hover:text-base-content`}
													aria-label="More info"
												>
													<AbstractIcon
														name={icons.FileQuestionMark.name}
														class="h-4 w-4"
														width="16"
														height="16"
													/>
												</span>
											{/snippet}
										</Tooltip.Trigger>
										<Tooltip.Content side="top">{p.toolTip}</Tooltip.Content>
									</Tooltip.Root>
								{/if}
							</button>
						{/each}
					{/if}
					{#if showDirectoryTiles}
						{#each directoryTiles as tile (tile.siteKey)}
							<button
								type="button"
								class="group relative flex min-h-[5.5rem] w-full min-w-0 max-w-none flex-col items-stretch justify-start gap-1.5 overflow-visible rounded-xl border border-base-300 bg-base-100 px-2 py-2 text-center whitespace-normal hover:bg-base-200"
								onclick={() => onPickDirectoryTile(tile)}
							>
								<div
									class="mx-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-base-200"
								>
									<DirectoryAddChannelTileIcon
										{tile}
										showLogo={directoryTileShowsLogo(tile)}
										onLogoError={() => {
											directoryLogoFailedBySiteKey = {
												...directoryLogoFailedBySiteKey,
												[tile.siteKey]: true
											};
										}}
									/>
								</div>
								<div
									class="min-w-0 w-full shrink text-balance break-words text-sm font-medium leading-snug text-base-content"
								>
									{tile.label}
								</div>
							</button>
						{/each}
					{/if}
				</div>
			{/if}
		{/if}
	{/if}
</div>
