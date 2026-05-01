<script lang="ts">
	import type { ChannelViewModel } from '$lib/posts';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { Badge } from '$lib/ui/badge';
	import { Checkbox } from '$lib/ui/checkbox';
	import { socialProviderIcon } from '$lib/posts/constants/socialProviderIcons';

	export type SocialPlatformFilterVm = {
		allSocialPlatforms: boolean;
		selectedSocialPlatformIdentifiers: string[];
	};

	type Props = SocialPlatformFilterVm & {
		channels: ChannelViewModel[];
		onChange: (next: SocialPlatformFilterVm) => void;
	};

	let { channels, allSocialPlatforms, selectedSocialPlatformIdentifiers, onChange }: Props = $props();

	let open = $state(false);

	const KNOWN_LABELS: Record<string, string> = {
		threads: 'Threads',
		'instagram-business': 'Instagram (Business)',
		'instagram-standalone': 'Instagram (Standalone)',
		instagram: 'Instagram',
		facebook: 'Facebook',
		youtube: 'YouTube',
		tiktok: 'TikTok',
		x: 'X'
	};

	function labelForIdentifier(identifier: string): string {
		const key = identifier.trim();
		if (KNOWN_LABELS[key]) return KNOWN_LABELS[key];
		return key
			.split('-')
			.filter(Boolean)
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
			.join(' ');
	}

	const normalizedSelected = $derived.by(() =>
		selectedSocialPlatformIdentifiers
			.map((x) => String(x ?? '').trim())
			.filter(Boolean)
	);

	const platformRows = $derived.by(() => {
		const map = new Map<string, string>();
		for (const c of channels) {
			const id = String(c.identifier ?? '').trim();
			if (!id) continue;
			if (!map.has(id)) map.set(id, labelForIdentifier(id));
		}
		for (const s of normalizedSelected) {
			if (!map.has(s)) map.set(s, labelForIdentifier(s));
		}
		return [...map.entries()]
			.map(([id, label]) => ({ id, label }))
			.sort((a, b) => a.label.localeCompare(b.label));
	});

	const allPlatformIds = $derived.by(() => platformRows.map((p) => p.id));

	const effectiveSelected = $derived.by(() =>
		allSocialPlatforms ? allPlatformIds : normalizedSelected
	);

	const summary = $derived.by(() => {
		if (allSocialPlatforms) return 'All platforms';
		const n = normalizedSelected.length;
		if (n === 0) return 'Select platforms';
		if (n === 1) return platformRows.find((p) => p.id === normalizedSelected[0])?.label ?? '1 platform';
		return `${n} platforms`;
	});

	function close() {
		open = false;
	}

	function setAll(next: boolean) {
		if (next) {
			onChange({
				allSocialPlatforms: true,
				selectedSocialPlatformIdentifiers: allPlatformIds
			});
			return;
		}
		onChange({ allSocialPlatforms: false, selectedSocialPlatformIdentifiers });
	}

	function togglePlatform(id: string) {
		const key = String(id ?? '').trim();
		if (!key) return;
		const set = new Set(normalizedSelected);
		if (set.has(key)) set.delete(key);
		else set.add(key);
		onChange({ allSocialPlatforms: false, selectedSocialPlatformIdentifiers: [...set] });
	}

	function removeSelected(id: string) {
		const key = String(id ?? '').trim();
		onChange({
			allSocialPlatforms: false,
			selectedSocialPlatformIdentifiers: normalizedSelected.filter((x) => x !== key)
		});
	}

	const selectedBadges = $derived.by(() =>
		effectiveSelected.map((id) => ({
			id,
			label: platformRows.find((p) => p.id === id)?.label ?? labelForIdentifier(id)
		}))
	);

	$effect(() => {
		if (!open) return;
		if (typeof window === 'undefined') return;
		const handler = (e: MouseEvent) => {
			const el = e.target as HTMLElement | null;
			if (!el) return;
			if (el.closest('[data-social-channel-filter-root]')) return;
			close();
		};
		window.addEventListener('click', handler, true);
		return () => window.removeEventListener('click', handler, true);
	});
</script>

<div class="relative" data-social-channel-filter-root>
	<button
		type="button"
		class="border-base-300 bg-base-100/60 hover:bg-base-100 inline-flex max-w-[min(100%,280px)] items-center gap-2 rounded-lg border px-3 py-2 text-sm text-base-content/80 outline-none focus-visible:ring-2 focus-visible:ring-primary"
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		<AbstractIcon name={icons.Link.name} class="size-4 shrink-0" width="16" height="16" />
		<span class="min-w-0 truncate">{summary}</span>
		<AbstractIcon name={icons.ChevronDown.name} class="size-4 shrink-0" width="16" height="16" />
	</button>

	{#if open}
		<div
			class="border-base-300 bg-base-100 absolute left-0 z-[60] mt-2 w-[min(calc(100vw-2rem),320px)] rounded-lg border p-3 shadow-xl sm:left-auto sm:right-0"
			role="menu"
		>
			<p class="px-1 pb-2 text-xs font-semibold text-base-content/60">Platforms</p>

			<div class="flex items-center justify-between gap-2 px-1 pb-2">
				<label class="flex cursor-pointer items-center gap-2 rounded-md">
					<Checkbox checked={allSocialPlatforms} onCheckedChange={() => setAll(!allSocialPlatforms)} />
					<span class="text-sm leading-snug">All platforms</span>
				</label>

				{#if normalizedSelected.length > 0}
					<button
						type="button"
						class="text-xs font-medium text-base-content/70 underline-offset-2 hover:underline"
						onclick={() => onChange({ allSocialPlatforms: false, selectedSocialPlatformIdentifiers: [] })}
					>
						Clear
					</button>
				{/if}
			</div>

			{#if selectedBadges.length > 0}
				<div class="flex flex-wrap gap-2 px-1 pb-2">
					{#each selectedBadges as b (b.id)}
						<Badge variant="secondary" class="rounded-full gap-1.5 pr-1">
							<AbstractIcon
								name={socialProviderIcon(b.id)}
								class="size-3.5 shrink-0"
								width="14"
								height="14"
							/>
							{b.label}
							<button
								type="button"
								class="ml-0.5 outline-none focus-visible:ring-2 focus-visible:ring-primary"
								aria-label={`Remove ${b.label}`}
								onclick={() => {
									if (allSocialPlatforms) {
										onChange({
											allSocialPlatforms: false,
											selectedSocialPlatformIdentifiers: allPlatformIds.filter((x) => x !== b.id)
										});
									} else {
										removeSelected(b.id);
									}
								}}
							>
								<AbstractIcon name={icons.X2.name} width="10" height="10" />
							</button>
						</Badge>
					{/each}
				</div>
			{/if}

			<div class="divider my-1"></div>

			<div class="max-h-[min(50vh,280px)] space-y-1 overflow-y-auto">
				{#each platformRows as p (p.id)}
					<label
						class="hover:bg-base-200 flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 {!allSocialPlatforms && normalizedSelected.includes(p.id)
							? 'bg-base-200/80'
							: ''}"
					>
						<Checkbox
							checked={effectiveSelected.includes(p.id)}
							onCheckedChange={() => {
								if (allSocialPlatforms) {
									onChange({
										allSocialPlatforms: false,
										selectedSocialPlatformIdentifiers: allPlatformIds.filter((x) => x !== p.id)
									});
								} else {
									togglePlatform(p.id);
								}
							}}
							class="mt-0.5"
						/>
						<AbstractIcon
							name={socialProviderIcon(p.id)}
							class="size-4 shrink-0 text-base-content mt-0.5"
							width="16"
							height="16"
						/>
						<span class="text-sm leading-snug">{p.label}</span>
					</label>
				{/each}
			</div>
		</div>
	{/if}
</div>
