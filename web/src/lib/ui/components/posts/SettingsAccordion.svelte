<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type {
		TiktokContentPostingMethod,
		TiktokPrivacyLevel,
		YoutubeTagOption
	} from '$lib/ui/components/posts/providers/provider.types';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Accordion from '$lib/ui/accordion';

	import ThreadFinisher from '$lib/ui/components/posts/thread/ThreadFinisher.svelte';
	import SameAccountEngagementPlug from '$lib/ui/components/posts/thread/SameAccountEngagementPlug.svelte';
	import InstagramCollaborators from '$lib/ui/components/posts/providers/instagram/InstagramCollaborators.svelte';
	import FacebookSettings from '$lib/ui/components/posts/providers/facebook/FacebookSettings.svelte';
	import LinkedInSettings from '$lib/ui/components/posts/providers/linkedin/LinkedInSettings.svelte';
	import LinkedInCrossAccountPlugs, {
		type LinkedInCrossAccountPlugState
	} from '$lib/ui/components/posts/providers/linkedin/LinkedInCrossAccountPlugs.svelte';
	import { integrationsRepository } from '$lib/integrations';
	import YoutubeSettings from '$lib/ui/components/posts/providers/youtube/YoutubeSettings.svelte';
	import TiktokSettings from '$lib/ui/components/posts/providers/tiktok/TiktokSettings.svelte';

	type ProviderSettings = {
		threads: {
			enabled: boolean;
			message: string;
			internalEngagementPlug: {
				enabled: boolean;
				delaySeconds: number;
				message: string;
				plugName: string;
				integrationId: string;
			};
		};
		instagram: {
			postType: 'post' | 'story';
			collaborators: string[];
			trialReel: boolean;
			graduationStrategy: 'MANUAL' | 'SS_PERFORMANCE';
		};
		facebook: {
			url?: string;
		};
		youtube: {
			title: string;
			type: 'public' | 'private' | 'unlisted';
			selfDeclaredMadeForKids: 'yes' | 'no';
			tags: YoutubeTagOption[];
			thumbnail?: { path: string };
		};
		tiktok: {
			privacy_level: TiktokPrivacyLevel;
			content_posting_method: TiktokContentPostingMethod;
			title: string;
			duet: boolean;
			stitch: boolean;
			comment: boolean;
			autoAddMusic: boolean;
			brand_content_toggle: boolean;
			brand_organic_toggle: boolean;
			video_made_with_ai: boolean;
		};
		linkedin: {
			postAsImagesCarousel: boolean;
			carouselName?: string;
			crossAccountPlugs?: LinkedInCrossAccountPlugState[];
		};
	};

	type Props = {
		open?: boolean;
		channel: CreateSocialPostChannelViewModel;
		allChannels?: CreateSocialPostChannelViewModel[];
		value?: Partial<ProviderSettings>;
		onChange: (next: Partial<ProviderSettings>) => void;
		organizationId?: string | null;
		uploadUid?: string;
		disabled?: boolean;
		/** When true, render the open panel inline (for landing previews) instead of a fixed overlay. */
		embedded?: boolean;
		/** Shorter nested editors for landing previews. */
		compactEditors?: boolean;
	};

	let {
		open = $bindable(false),
		channel,
		allChannels = [],
		value = {},
		onChange,
		organizationId = null,
		uploadUid = '',
		disabled = false,
		embedded = false,
		compactEditors = false
	}: Props = $props();

	const identifier = $derived((channel.identifier ?? '').toLowerCase());
	const title = $derived(`${channel.name} Settings`);

	let threadsEnabled = $state(false);
	let threadsMessage = $state("That's a wrap!");
	let igPlugEnabled = $state(false);
	let igPlugDelaySeconds = $state(120);
	let igPlugMessage = $state('');

	let igPostType = $state<'post' | 'story'>('post');
	let igCollaborators = $state<string[]>([]);
	let igTrialReel = $state(false);
	let igGraduationStrategy = $state<'MANUAL' | 'SS_PERFORMANCE'>('MANUAL');

	let fbUrl = $state('');

	let ytTitle = $state('');
	let ytType = $state<'public' | 'private' | 'unlisted'>('public');
	let ytMadeForKids = $state<'yes' | 'no'>('no');
	let ytTags = $state<YoutubeTagOption[]>([]);
	let ytThumbnail = $state<{ path: string } | undefined>(undefined);

	let ttPrivacyLevel = $state<TiktokPrivacyLevel>('PUBLIC_TO_EVERYONE');
	let ttPostingMethod = $state<TiktokContentPostingMethod>('DIRECT_POST');
	let ttTitle = $state('');
	let ttDuet = $state(true);
	let ttStitch = $state(true);
	let ttComment = $state(true);
	let ttAutoAddMusic = $state(false);
	let ttBrandContent = $state(false);
	let ttBrandOrganic = $state(false);
	let ttVideoMadeWithAi = $state(false);

	let liCarousel = $state(false);
	let liCarouselName = $state('');
	let liCrossAccountPlugs = $state<LinkedInCrossAccountPlugState[]>([]);
	let linkedInPlugDefs = $state<
		Array<{
			identifier: string;
			title: string;
			description: string;
			pickIntegration?: string[];
			fields?: Array<{
				name: string;
				description: string;
				type: string;
				placeholder: string;
			}>;
		}>
	>([]);

	$effect(() => {
		const id = identifier;
		const orgId = organizationId;
		if ((id !== 'linkedin' && id !== 'linkedin-page') || !orgId) {
			linkedInPlugDefs = [];
			return;
		}
		void integrationsRepository.getInternalPlugDefinitions(orgId, 'linkedin').then((defs) => {
			linkedInPlugDefs = defs.filter((d) => (d.pickIntegration?.length ?? 0) > 0);
		});
	});

	// Pull values from the passed value object.
	$effect(() => {
		const s = value as Partial<ProviderSettings>;
		if (s.threads) {
			threadsEnabled = s.threads.enabled;
			threadsMessage = s.threads.message;
			const ig = s.threads.internalEngagementPlug;
			if (ig && typeof ig === 'object') {
				igPlugEnabled = ig.enabled === true;
				igPlugDelaySeconds =
					typeof ig.delaySeconds === 'number' && Number.isFinite(ig.delaySeconds) ? ig.delaySeconds : 120;
				igPlugMessage = typeof ig.message === 'string' ? ig.message : '';
			} else {
				igPlugEnabled = false;
				igPlugDelaySeconds = 120;
				igPlugMessage = '';
			}
		}
		if (s.instagram) {
			const pt = (s.instagram as any).postType;
			igPostType = pt === 'story' ? 'story' : 'post';
			igCollaborators = Array.isArray(s.instagram.collaborators)
				? s.instagram.collaborators
				: typeof (s.instagram as any).collaborators === 'string'
					? (s.instagram as any).collaborators
							.split(',')
							.map((x: string) => x.trim())
							.filter(Boolean)
					: [];
			igTrialReel = s.instagram.trialReel === true;
			const gs = (s.instagram as { graduationStrategy?: unknown }).graduationStrategy;
			igGraduationStrategy = gs === 'SS_PERFORMANCE' ? 'SS_PERFORMANCE' : 'MANUAL';
		}
		if (s.facebook && typeof s.facebook === 'object') {
			fbUrl = typeof s.facebook.url === 'string' ? s.facebook.url : '';
		} else if (typeof (s as { url?: unknown }).url === 'string') {
			fbUrl = (s as { url: string }).url;
		} else {
			fbUrl = '';
		}
		if (s.youtube && typeof s.youtube === 'object') {
			ytTitle = typeof s.youtube.title === 'string' ? s.youtube.title : '';
			const pt = s.youtube.type;
			ytType = pt === 'private' || pt === 'unlisted' ? pt : 'public';
			ytMadeForKids = s.youtube.selfDeclaredMadeForKids === 'yes' ? 'yes' : 'no';
			ytTags = Array.isArray(s.youtube.tags) ? s.youtube.tags : [];
			ytThumbnail =
				s.youtube.thumbnail &&
				typeof s.youtube.thumbnail === 'object' &&
				typeof s.youtube.thumbnail.path === 'string'
					? { path: s.youtube.thumbnail.path }
					: undefined;
		} else {
			ytTitle = typeof (s as { title?: unknown }).title === 'string' ? (s as { title: string }).title : '';
			const flatType = (s as { type?: unknown }).type;
			ytType =
				flatType === 'private' || flatType === 'unlisted' || flatType === 'public' ? flatType : 'public';
			const flatKids = (s as { selfDeclaredMadeForKids?: unknown }).selfDeclaredMadeForKids;
			ytMadeForKids = flatKids === 'yes' ? 'yes' : 'no';
			ytTags = Array.isArray((s as { tags?: unknown }).tags)
				? ((s as { tags: YoutubeTagOption[] }).tags ?? [])
				: [];
			const flatThumb = (s as { thumbnail?: { path?: string } }).thumbnail;
			ytThumbnail =
				flatThumb && typeof flatThumb.path === 'string' ? { path: flatThumb.path } : undefined;
		}
		if (s.tiktok && typeof s.tiktok === 'object') {
			const pl = s.tiktok.privacy_level;
			ttPrivacyLevel =
				pl === 'MUTUAL_FOLLOW_FRIENDS' || pl === 'FOLLOWER_OF_CREATOR' || pl === 'SELF_ONLY'
					? pl
					: 'PUBLIC_TO_EVERYONE';
			const pm = s.tiktok.content_posting_method;
			ttPostingMethod = pm === 'UPLOAD' ? 'UPLOAD' : 'DIRECT_POST';
			ttTitle = typeof s.tiktok.title === 'string' ? s.tiktok.title : '';
			ttDuet = s.tiktok.duet !== false;
			ttStitch = s.tiktok.stitch !== false;
			ttComment = s.tiktok.comment !== false;
			ttAutoAddMusic = s.tiktok.autoAddMusic === true;
			ttBrandContent = s.tiktok.brand_content_toggle === true;
			ttBrandOrganic = s.tiktok.brand_organic_toggle === true;
			ttVideoMadeWithAi = s.tiktok.video_made_with_ai === true;
		} else {
			const flat = s as Record<string, unknown>;
			const pl = flat.privacy_level ?? flat.privacyLevel;
			ttPrivacyLevel =
				pl === 'MUTUAL_FOLLOW_FRIENDS' || pl === 'FOLLOWER_OF_CREATOR' || pl === 'SELF_ONLY'
					? pl
					: 'PUBLIC_TO_EVERYONE';
			const pm = flat.content_posting_method ?? flat.contentPostingMethod;
			ttPostingMethod = pm === 'UPLOAD' || pm === 'MEDIA_UPLOAD' ? 'UPLOAD' : 'DIRECT_POST';
			ttTitle = typeof flat.title === 'string' ? flat.title : '';
			ttDuet = flat.duet !== false;
			ttStitch = flat.stitch !== false;
			ttComment = flat.comment !== false;
			ttAutoAddMusic = flat.autoAddMusic === true || flat.auto_add_music === true;
			ttBrandContent = flat.brand_content_toggle === true || flat.brandContentToggle === true;
			ttBrandOrganic = flat.brand_organic_toggle === true || flat.brandOrganicToggle === true;
			ttVideoMadeWithAi = flat.video_made_with_ai === true || flat.videoMadeWithAi === true;
		}
		if (s.linkedin && typeof s.linkedin === 'object') {
			liCarousel = s.linkedin.postAsImagesCarousel === true;
			liCarouselName = typeof s.linkedin.carouselName === 'string' ? s.linkedin.carouselName : '';
			liCrossAccountPlugs = Array.isArray(s.linkedin.crossAccountPlugs)
				? (s.linkedin.crossAccountPlugs as LinkedInCrossAccountPlugState[])
				: [];
		} else {
			const flat = s as Record<string, unknown>;
			liCarousel =
				flat.post_as_images_carousel === true ||
				flat.postAsImagesCarousel === true ||
				flat.post_as_images_carousel === 'true';
			liCarouselName =
				typeof flat.carousel_name === 'string'
					? flat.carousel_name
					: typeof flat.carouselName === 'string'
						? flat.carouselName
						: '';
			liCrossAccountPlugs = [];
		}
	});

	let lastEmitted = $state('');
	$effect(() => {
		let next: Partial<ProviderSettings> = {};
		if (identifier === 'threads') {
			next = {
				threads: {
					enabled: threadsEnabled,
					message: threadsMessage,
					internalEngagementPlug: {
						enabled: igPlugEnabled,
						delaySeconds: igPlugDelaySeconds,
						message: igPlugMessage,
						plugName: 'threads-internal-follow-up',
						integrationId: channel.id
					}
				}
			};
		} else if (identifier.startsWith('instagram')) {
			next = {
				instagram: {
					postType: igPostType,
					collaborators: igCollaborators,
					trialReel: igTrialReel,
					graduationStrategy: igGraduationStrategy
				}
			};
		} else if (identifier === 'facebook') {
			const trimmed = fbUrl.trim();
			next = { facebook: trimmed ? { url: trimmed } : {} };
		} else if (identifier === 'youtube') {
			next = {
				youtube: {
					title: ytTitle.trim(),
					type: ytType,
					selfDeclaredMadeForKids: ytMadeForKids,
					tags: ytTags,
					...(ytThumbnail?.path ? { thumbnail: ytThumbnail } : {})
				}
			};
		} else if (identifier === 'tiktok') {
			next = {
				tiktok: {
					privacy_level: ttPrivacyLevel,
					content_posting_method: ttPostingMethod,
					title: ttTitle.trim(),
					duet: ttDuet,
					stitch: ttStitch,
					comment: ttComment,
					autoAddMusic: ttAutoAddMusic,
					brand_content_toggle: ttBrandContent,
					brand_organic_toggle: ttBrandOrganic,
					video_made_with_ai: ttVideoMadeWithAi
				}
			};
		} else if (identifier === 'linkedin' || identifier === 'linkedin-page') {
			const name = liCarouselName.trim();
			const activePlugs = liCrossAccountPlugs.filter((p) => p.enabled && p.integrationIds.length > 0);
			next = {
				linkedin: {
					postAsImagesCarousel: liCarousel,
					...(name ? { carouselName: name } : {}),
					...(activePlugs.length ? { crossAccountPlugs: activePlugs } : {})
				}
			};
		} else {
			return;
		}
		const sig = JSON.stringify(next);
		if (sig === lastEmitted) return;
		lastEmitted = sig;
		onChange(next);
	});
</script>

<!-- Trigger bar (inline). When opened, we render a full overlay panel (or embedded panel). -->
{#if !(embedded && open)}
	<Accordion.Root class="w-full">
		<Accordion.Item bind:open class="rounded-lg overflow-hidden border border-base-300">
			<Accordion.Trigger
				class="bg-[#5b2dd6] text-white flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
			>
				<span class="inline-flex items-center gap-2">
					<AbstractIcon name={icons.Cog.name} class="size-4" width="16" height="16" />
					{title}
				</span>
				<AbstractIcon name={open ? icons.ChevronUp.name : icons.ChevronDown.name} class="size-4" width="16" height="16" />
			</Accordion.Trigger>
		</Accordion.Item>
	</Accordion.Root>
{/if}

{#snippet settingsPanelBody()}
	{#if identifier === 'threads'}
		<ThreadFinisher
			bind:enabled={threadsEnabled}
			bind:message={threadsMessage}
			{disabled}
			compact={compactEditors}
		/>
		<SameAccountEngagementPlug
			bind:enabled={igPlugEnabled}
			bind:delaySeconds={igPlugDelaySeconds}
			bind:message={igPlugMessage}
			{disabled}
			compact={compactEditors}
		/>
	{:else if identifier.startsWith('instagram')}
		<InstagramCollaborators
			bind:postType={igPostType}
			bind:collaborators={igCollaborators}
			bind:trialReel={igTrialReel}
			bind:graduationStrategy={igGraduationStrategy}
		/>
	{:else if identifier === 'facebook'}
		<FacebookSettings bind:url={fbUrl} />
	{:else if identifier === 'youtube'}
		<YoutubeSettings
			bind:title={ytTitle}
			bind:type={ytType}
			bind:selfDeclaredMadeForKids={ytMadeForKids}
			bind:tags={ytTags}
			bind:thumbnail={ytThumbnail}
			{organizationId}
			{uploadUid}
			{disabled}
		/>
	{:else if identifier === 'tiktok'}
		<TiktokSettings
			bind:privacyLevel={ttPrivacyLevel}
			bind:contentPostingMethod={ttPostingMethod}
			bind:title={ttTitle}
			bind:duet={ttDuet}
			bind:stitch={ttStitch}
			bind:comment={ttComment}
			bind:autoAddMusic={ttAutoAddMusic}
			bind:brandContentToggle={ttBrandContent}
			bind:brandOrganicToggle={ttBrandOrganic}
			bind:videoMadeWithAi={ttVideoMadeWithAi}
			{disabled}
		/>
	{:else if identifier === 'linkedin' || identifier === 'linkedin-page'}
		<LinkedInSettings
			bind:postAsImagesCarousel={liCarousel}
			bind:carouselName={liCarouselName}
			showCarousel={true}
		/>
		<LinkedInCrossAccountPlugs
			currentChannel={channel}
			allChannels={allChannels}
			plugs={linkedInPlugDefs}
			bind:value={liCrossAccountPlugs}
			{disabled}
			compact={compactEditors}
		/>
	{:else}
		<p class="text-sm text-base-content/60">No settings available for this provider yet.</p>
	{/if}
{/snippet}

{#if open}
	{#if embedded}
		<div class="bg-base-100 w-full overflow-hidden rounded-xl border border-base-300 shadow-lg">
			<div class="bg-[#5b2dd6] flex items-center justify-between px-4 py-3 text-sm font-semibold text-white">
				<span class="inline-flex items-center gap-2">
					<AbstractIcon name={icons.Cog.name} class="size-4" width="16" height="16" />
					{title}
				</span>
			</div>

			<div class="p-4 sm:p-6">
				{@render settingsPanelBody()}
			</div>
		</div>
	{:else}
		<!-- Backdrop covers the whole modal context (and beyond), like original. -->
		<div class="fixed inset-0 z-[1000] bg-black/75" onclick={() => (open = false)} aria-hidden="true"></div>

		<!-- Panel: full-height, top-aligned, dark enough to hide underlying UI. -->
		<div class="fixed inset-0 z-[1001] flex items-start justify-center p-4 sm:p-6">
			<div class="bg-base-100 w-full max-w-[min(100vw-2rem,980px)] overflow-hidden rounded-xl shadow-2xl">
				<div class="bg-[#5b2dd6] flex items-center justify-between px-4 py-3 text-sm font-semibold text-white">
					<span class="inline-flex items-center gap-2">
						<AbstractIcon name={icons.Cog.name} class="size-4" width="16" height="16" />
						{title}
					</span>
					<button
						type="button"
						class="rounded-md p-2 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60"
						onclick={() => (open = false)}
						aria-label="Close settings"
					>
						<AbstractIcon name={icons.X2.name} class="size-5" width="20" height="20" />
					</button>
				</div>

				<div class="max-h-[calc(100vh-8rem)] overflow-y-auto p-4 sm:p-6">
					{@render settingsPanelBody()}
				</div>
			</div>
		</div>
	{/if}
{/if}

