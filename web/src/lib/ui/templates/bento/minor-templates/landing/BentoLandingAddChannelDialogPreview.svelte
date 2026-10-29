<script lang="ts">
	import { socialProviderIcon } from '$data/social-providers';

	import DirectoryAddChannelTileIcon from '$lib/ui/components/auto-launch/DirectoryAddChannelTileIcon.svelte';
	import {
		LANDING_ADD_CHANNEL_DIALOG_DIRECTORY_TILES,
		LANDING_ADD_CHANNEL_DIALOG_SOCIAL_PROVIDERS
	} from '$lib/ui/templates/bento/minor-templates/landing/landingAddChannelDialogMock';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	import { cn } from '$lib/ui/helpers/common';

	type AddChannelCategoryFilter = 'all' | 'social' | 'directory';

	let channelCategoryFilter = $state<AddChannelCategoryFilter>('all');

	const showSocialProviders = $derived(
		channelCategoryFilter === 'all' || channelCategoryFilter === 'social'
	);
	const showDirectoryTiles = $derived(
		channelCategoryFilter === 'all' || channelCategoryFilter === 'directory'
	);

	const categoryFilterButtonClass = (active: boolean) =>
		`inline-flex flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none ${
			active
				? 'bg-base-100 font-semibold text-base-content shadow-sm'
				: 'text-base-content/65 hover:bg-base-content/10 hover:text-base-content'
		}`;

	const providerTileClass = (extensionConnect: boolean | undefined) =>
		cn(
			'pointer-events-none group relative flex min-h-[5.5rem] w-full min-w-0 max-w-none flex-col items-stretch justify-start gap-1.5 overflow-visible rounded-xl border bg-base-100 px-2 py-2 text-center whitespace-normal',
			extensionConnect
				? 'border-primary/50 ring-1 ring-primary/25'
				: 'border-base-300'
		);
</script>

<div class="flex size-full min-h-0 select-none flex-col bg-base-100 text-base-content">
	<div class="pointer-events-none relative border-b border-base-300 px-4 pb-2 pt-3 sm:px-6">
		<p class="text-lg font-semibold sm:text-xl">Add Channel</p>
		<p class="mt-0.5 text-sm text-base-content/70">Click a channel to connect it.</p>
	</div>

	<div class="pointer-events-auto px-4 pb-3 pt-1 sm:px-6">
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

	<div class="pointer-events-none min-h-0 flex-1 overflow-hidden px-4 pb-3 pt-1 sm:px-6">
		<div
			class="grid grid-cols-2 gap-2 justify-items-stretch justify-center sm:grid-cols-3 sm:gap-[10px] md:grid-cols-5"
		>
			{#if showSocialProviders}
				{#each LANDING_ADD_CHANNEL_DIALOG_SOCIAL_PROVIDERS as p (p.identifier)}
					<div class={providerTileClass(p.extensionConnect)}>
						<div class="mx-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-base-200">
							<AbstractIcon
								name={socialProviderIcon(p.identifier)}
								class="h-6 w-6"
								width="24"
								height="24"
								focusable="false"
							/>
						</div>
						<div
							class="min-w-0 w-full shrink text-balance break-words text-sm font-medium leading-snug text-base-content"
						>
							{p.name}
						</div>
						{#if p.extensionConnect}
							<span
								class="absolute right-2 top-2 rounded-md border border-base-300 bg-base-200 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-base-content/80"
							>
								Extension
							</span>
						{/if}
					</div>
				{/each}
			{/if}
			{#if showDirectoryTiles}
				{#each LANDING_ADD_CHANNEL_DIALOG_DIRECTORY_TILES as tile (tile.siteKey)}
					<div
						class="group relative flex min-h-[5.5rem] w-full min-w-0 max-w-none flex-col items-stretch justify-start gap-1.5 overflow-visible rounded-xl border border-base-300 bg-base-100 px-2 py-2 text-center whitespace-normal"
					>
						<div class="mx-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-base-200">
							<DirectoryAddChannelTileIcon tile={tile} showLogo={true} onLogoError={() => {}} />
						</div>
						<div
							class="min-w-0 w-full shrink text-balance break-words text-sm font-medium leading-snug text-base-content"
						>
							{tile.label}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<div class="pointer-events-none mt-auto border-t border-base-300 px-4 py-3 sm:px-6">
		<p class="text-xs leading-relaxed text-base-content/70 sm:text-sm">
			By connecting a channel, you agree to our Terms and Privacy Policy. Browser-extension channels
			use your existing platform login in Chrome.
		</p>
	</div>
</div>
