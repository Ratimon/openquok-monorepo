<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import DatePicker from '$lib/ui/components/posts/DatePicker.svelte';
	import PicksSocialsComponent from '$lib/ui/components/posts/PicksSocialsComponent.svelte';
	import ShowAllProviders from '$lib/ui/components/posts/providers/ShowAllProviders.svelte';
	import { getDateMetricUsStyle, newDayjs } from '$lib/utils/postingSchedulePreferences';
	import {
		FACEBOOK_LANDING_MOCK_BODY,
		FACEBOOK_LANDING_MOCK_CHANNEL,
		FACEBOOK_LANDING_MOCK_SCHEDULED_LOCAL
	} from './facebookLandingMock';

	const mockChannels = [FACEBOOK_LANDING_MOCK_CHANNEL];
	const selectedIds = [FACEBOOK_LANDING_MOCK_CHANNEL.id];
	let scheduledLocal = $state(FACEBOOK_LANDING_MOCK_SCHEDULED_LOCAL);

	const previewMetaLabel = $derived.by(() => {
		const d = newDayjs(scheduledLocal);
		if (!d.isValid()) return null;
		return getDateMetricUsStyle()
			? d.format('MM/DD/YYYY hh:mm A')
			: d.format('DD/MM/YYYY HH:mm');
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
			/>

			<div class="rounded-lg border border-base-300 bg-base-100/30 p-3">
				<label class="mb-2 block text-xs font-medium text-base-content/60" for="landing-mock-post-body">
					Post body
				</label>
				<textarea
					id="landing-mock-post-body"
					readonly
					rows="4"
					class="textarea textarea-bordered w-full resize-none text-sm leading-relaxed"
					value={FACEBOOK_LANDING_MOCK_BODY}
				></textarea>
				<p class="mt-2 text-xs text-base-content/50">
					{FACEBOOK_LANDING_MOCK_BODY.length} / 63,206
				</p>
			</div>
		</div>

		<div class="bg-base-200/20">
			<div class="flex items-center justify-between border-b border-base-300 px-4 py-3">
				<div class="text-base font-medium text-base-content/90">Post Preview</div>
			</div>
			<div class="p-4">
				<ShowAllProviders
					channel={FACEBOOK_LANDING_MOCK_CHANNEL}
					previewText={FACEBOOK_LANDING_MOCK_BODY}
					maximumCharacters={63_206}
					{previewMetaLabel}
				/>
			</div>
		</div>
	</div>

	<div
		class="flex flex-col gap-3 border-t border-base-300 bg-base-100/95 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end"
	>
		<DatePicker bind:value={scheduledLocal} disabled />
		<Button type="button" variant="secondary" disabled>Save as draft</Button>
		<Button type="button" variant="primary" disabled>Schedule Post</Button>
	</div>
</div>
