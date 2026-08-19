<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ComposerGuestLockFooter from '$lib/ui/components/posts/ComposerGuestLockFooter.svelte';
	import ComposerGuestLockToolbar from '$lib/ui/components/posts/ComposerGuestLockToolbar.svelte';
	import PicksSocialsComponent from '$lib/ui/components/posts/PicksSocialsComponent.svelte';
	import SettingsAccordion from '$lib/ui/components/posts/SettingsAccordion.svelte';
	import ShowAllProviders from '$lib/ui/components/posts/providers/ShowAllProviders.svelte';
	import {
		LINKEDIN_LANDING_MOCK_BODY,
		LINKEDIN_LANDING_MOCK_CAROUSEL_BODY,
		LINKEDIN_LANDING_MOCK_CAROUSEL_NAME,
		LINKEDIN_LANDING_MOCK_CHANNEL,
		LINKEDIN_LANDING_MOCK_SCHEDULED_LOCAL
	} from './linkedinLandingMock';

	type Props = {
		isLoggedIn?: boolean;
	};

	let { isLoggedIn }: Props = $props();

	const mockChannels = [LINKEDIN_LANDING_MOCK_CHANNEL];
	const selectedIds = [LINKEDIN_LANDING_MOCK_CHANNEL.id];
	let settingsOpen = $state(true);
	let scheduledLocal = $state(LINKEDIN_LANDING_MOCK_SCHEDULED_LOCAL);
	const providerSettings = {
		linkedin: { postAsImagesCarousel: true, carouselName: LINKEDIN_LANDING_MOCK_CAROUSEL_NAME }
	};

	const previewMetaLabel = $derived.by(() => {
		const ms = Date.parse(scheduledLocal);
		if (!Number.isFinite(ms)) return null;
		return new Date(ms).toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	});

	function noop() {}
</script>

<div class="pointer-events-none select-none bg-base-100 text-base-content">
	<div class="flex items-start justify-between border-b border-base-300 px-4 py-3">
		<div class="text-lg font-semibold">Create Post</div>
		<div class="rounded-md p-2 text-base-content/70">
			<AbstractIcon name={icons.X2.name} class="size-5" width="20" height="20" />
		</div>
	</div>

	<div class="grid grid-cols-1 divide-y divide-base-300 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
		<div class="flex flex-col gap-4 p-4">
			<PicksSocialsComponent
				channels={mockChannels}
				{selectedIds}
				onToggleChannel={noop}
				guestMode={true}
				{isLoggedIn}
			/>

			<div class="text-base-content/70 flex flex-wrap items-center justify-between gap-2 text-xs">
				<span class="inline-flex items-center gap-2 font-medium">
					<span class="bg-primary/70 inline-block h-2 w-2 rounded-full"></span>
					Editing a Specific Network
				</span>
			</div>

			<ComposerGuestLockToolbar {isLoggedIn} showLinkedInCompany={true} />

			<div class="rounded-lg border border-base-300 bg-base-100/30 p-3">
				<label class="mb-2 block text-xs font-medium text-base-content/60" for="landing-mock-linkedin-body">
					Post body
				</label>
				<textarea
					id="landing-mock-linkedin-body"
					readonly
					rows="4"
					class="textarea textarea-bordered w-full resize-none text-sm leading-relaxed"
					value={LINKEDIN_LANDING_MOCK_CAROUSEL_BODY}
				></textarea>
				<p class="mt-2 text-xs text-base-content/50">
					{LINKEDIN_LANDING_MOCK_CAROUSEL_BODY.length} / 3,000
				</p>
			</div>

			<SettingsAccordion
				bind:open={settingsOpen}
				channel={LINKEDIN_LANDING_MOCK_CHANNEL}
				value={providerSettings}
				onChange={noop}
				embedded
			/>
		</div>

		<div class="bg-base-200/20">
			<div class="flex items-center justify-between border-b border-base-300 px-4 py-3">
				<div class="text-base font-medium text-base-content/90">Post Preview</div>
			</div>
			<div class="p-4">
				<ShowAllProviders
					channel={LINKEDIN_LANDING_MOCK_CHANNEL}
					previewText={LINKEDIN_LANDING_MOCK_BODY}
					maximumCharacters={3000}
					{previewMetaLabel}
				/>
			</div>
		</div>
	</div>

	<ComposerGuestLockFooter bind:scheduledLocal {isLoggedIn} />
</div>
