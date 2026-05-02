<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Accordion from '$lib/ui/accordion';

	import ThreadFinisher from '$lib/ui/components/posts/thread/ThreadFinisher.svelte';
	import InstagramCollaborators from '$lib/ui/components/posts/providers/instagram/InstagramCollaborators.svelte';

	type ProviderSettings = {
		threads: {
			enabled: boolean;
			message: string;
		};
		instagram: { postType: 'post' | 'story'; collaborators: string[]; trialReel: boolean };
	};

	type Props = {
		open?: boolean;
		channel: CreateSocialPostChannelViewModel;
		value?: Partial<ProviderSettings>;
		onChange: (next: Partial<ProviderSettings>) => void;
		disabled?: boolean;
	};

	let { open = $bindable(false), channel, value = {}, onChange, disabled = false }: Props = $props();

	const identifier = $derived((channel.identifier ?? '').toLowerCase());
	const title = $derived(`${channel.name} Settings`);

	let threadsEnabled = $state(false);
	let threadsMessage = $state("That's a wrap!");

	let igPostType = $state<'post' | 'story'>('post');
	let igCollaborators = $state<string[]>([]);
	let igTrialReel = $state(false);

	// Pull values from the passed value object.
	$effect(() => {
		const s = value as Partial<ProviderSettings>;
		if (s.threads) {
			threadsEnabled = s.threads.enabled;
			threadsMessage = s.threads.message;
		}
		if (s.instagram) {
			igPostType = s.instagram.postType;
			igCollaborators = Array.isArray(s.instagram.collaborators)
				? s.instagram.collaborators
				: typeof (s.instagram as any).collaborators === 'string'
					? (s.instagram as any).collaborators
							.split(',')
							.map((x: string) => x.trim())
							.filter(Boolean)
					: [];
			igTrialReel = s.instagram.trialReel;
		}
	});

	let lastEmitted = $state('');
	$effect(() => {
		const next: Partial<ProviderSettings> = {
			threads: { enabled: threadsEnabled, message: threadsMessage },
			instagram: { postType: igPostType, collaborators: igCollaborators, trialReel: igTrialReel }
		};
		const sig = JSON.stringify(next);
		if (sig === lastEmitted) return;
		lastEmitted = sig;
		onChange(next);
	});
</script>

<!-- Trigger bar (inline). When opened, we render a full overlay panel. -->
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

{#if open}
	<!-- Backdrop covers the whole modal context (and beyond), like original. -->
	<div class="fixed inset-0 z-[1000] bg-black/75" onclick={() => (open = false)} aria-hidden="true"></div>

	<!-- Panel: full-height, top-aligned, dark enough to hide underlying UI. -->
	<div class="fixed inset-0 z-[1001] flex items-start justify-center p-4 sm:p-6">
		<div class="bg-base-100 w-full max-w-[min(100vw-2rem,980px)] rounded-xl overflow-hidden shadow-2xl">
			<div class="bg-[#5b2dd6] text-white flex items-center justify-between px-4 py-3 text-sm font-semibold">
				<span class="inline-flex items-center gap-2">
					<AbstractIcon name={icons.Cog.name} class="size-4" width="16" height="16" />
					{title}
				</span>
				<button
					type="button"
					class="hover:bg-white/10 rounded-md p-2 outline-none focus-visible:ring-2 focus-visible:ring-white/60"
					onclick={() => (open = false)}
					aria-label="Close settings"
				>
					<AbstractIcon name={icons.X2.name} class="size-5" width="20" height="20" />
				</button>
			</div>

			<div class="max-h-[calc(100vh-8rem)] overflow-y-auto p-4 sm:p-6">
				{#if identifier === 'threads'}
					<ThreadFinisher
						bind:enabled={threadsEnabled}
						bind:message={threadsMessage}
						disabled={disabled}
					/>
				{:else if identifier.startsWith('instagram')}
					<InstagramCollaborators
						bind:postType={igPostType}
						bind:collaborators={igCollaborators}
						bind:trialReel={igTrialReel}
					/>
				{:else}
					<p class="text-sm text-base-content/60">No settings available for this provider yet.</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

