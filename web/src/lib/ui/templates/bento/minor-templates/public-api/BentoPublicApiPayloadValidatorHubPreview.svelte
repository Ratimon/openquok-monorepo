<script lang="ts">
	import type { PublicApiHubStaticExample, PublicApiPlatformSlug } from '$lib/content/constants/apis/types';

	import { icons } from '$data/icons';

	import {
		buildPayloadWizardMockChannels,
		defaultPayloadWizardGuestSelectedIntegrationIds,
		payloadWizardMockIntegrationId
	} from '$lib/posts/utils/buildPayloadWizardMockChannels';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicApiJsonPayloadBlock from '$lib/ui/templates/api-marketing/PublicApiJsonPayloadBlock.svelte';
	import PicksSocialsComponent from '$lib/ui/components/posts/PicksSocialsComponent.svelte';

	type ParsedRequestPreview = {
		body: string;
		mediaLabel: string | null;
	};

	type Props = {
		staticExample: PublicApiHubStaticExample;
		platformSlug?: PublicApiPlatformSlug | null;
		isLoggedIn?: boolean;
	};

	let { staticExample, platformSlug = null, isLoggedIn }: Props = $props();

	const mockChannels = buildPayloadWizardMockChannels();
	const selectedIds = $derived.by(() => {
		if (platformSlug) {
			return [payloadWizardMockIntegrationId(platformSlug)];
		}
		return defaultPayloadWizardGuestSelectedIntegrationIds(mockChannels);
	});

	const parsedPreview = $derived.by((): ParsedRequestPreview => {
		try {
			const parsed = JSON.parse(staticExample.requestJson) as {
				body?: unknown;
				media?: Array<{ path?: string; alt?: string }>;
			};
			const body = typeof parsed.body === 'string' ? parsed.body : '';
			const mediaItems = Array.isArray(parsed.media) ? parsed.media : [];
			let mediaLabel: string | null = null;

			if (mediaItems.length === 1) {
				const item = mediaItems[0];
				const path = typeof item?.path === 'string' ? item.path : '';
				const fileName = path.split('/').pop()?.trim();
				mediaLabel = fileName ? `Media: ${fileName}` : '1 attachment';
			} else if (mediaItems.length > 1) {
				mediaLabel = `${mediaItems.length} attachments`;
			}

			return { body, mediaLabel };
		} catch {
			return { body: '', mediaLabel: null };
		}
	});

	function noop() {}
</script>

<div class="pointer-events-none select-none bg-base-100 text-base-content">
	<div class="flex items-start justify-between border-b border-base-300 px-4 py-3">
		<div class="text-lg font-semibold">Payload preview</div>
		<div class="rounded-md p-2 text-base-content/70">
			<AbstractIcon name={icons.X2.name} class="size-5" width="20" height="20" />
		</div>
	</div>

	<div class="space-y-4 p-4">
		<div class="space-y-2">
			<h3 class="text-sm font-semibold text-base-content/90">Sample channels</h3>
			<PicksSocialsComponent
				channels={mockChannels}
				{selectedIds}
				onToggleChannel={noop}
				guestMode={true}
				hideGuestHelper={true}
				{isLoggedIn}
			/>
		</div>

		<div class="rounded-lg border border-base-300 bg-base-100/30 p-3">
			<label class="mb-2 block text-xs font-medium text-base-content/60" for="payload-validator-mock-body">
				Post body
			</label>
			<textarea
				id="payload-validator-mock-body"
				readonly
				rows="3"
				class="textarea textarea-bordered w-full resize-none text-sm leading-relaxed"
				value={parsedPreview.body}
			></textarea>
			{#if parsedPreview.mediaLabel}
				<div class="mt-2">
					<span class="badge badge-outline gap-1 border-base-300 bg-base-200/40 text-xs font-medium">
						<AbstractIcon name={icons.Image.name} class="size-3.5" width="14" height="14" />
						{parsedPreview.mediaLabel}
					</span>
				</div>
			{/if}
		</div>

		<div class="rounded-lg border border-primary/20 bg-primary/5 p-3">
			<p class="text-xs font-medium tracking-wide text-primary/80 uppercase">Endpoint</p>
			<p class="mt-2 font-mono text-sm text-primary">{staticExample.endpoint}</p>
		</div>

		<div class="pointer-events-auto">
			<PublicApiJsonPayloadBlock json={staticExample.requestJson} />
		</div>
	</div>
</div>
