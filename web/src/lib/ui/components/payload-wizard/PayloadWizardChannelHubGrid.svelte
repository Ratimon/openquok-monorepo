<script lang="ts">
	import type { PayloadWizardChannelHubLinkViewModel } from '$lib/posts/constants/publicPayloadWizardChannelConfig';

	import { icons } from '$data/icons';
	import { getRootPathPublicPayloadWizard } from '$lib/area-public/constants/getRootPathPublicTools';
	import { route, url } from '$lib/utils/path';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		channelLinksVm: PayloadWizardChannelHubLinkViewModel[];
		activeChannelSlug?: string | null;
		genericHref?: string;
	};

	let {
		channelLinksVm,
		activeChannelSlug = null,
		genericHref = url(route(getRootPathPublicPayloadWizard()))
	}: Props = $props();

	const headingId = 'payload-wizard-channel-hub-heading';

	const isGenericActive = $derived(!activeChannelSlug?.trim());
</script>

<section class="container mx-auto mt-12 max-w-[1600px] px-4" aria-labelledby={headingId}>
	<div class="space-y-2">
		<p class="text-xs font-bold tracking-wider text-primary uppercase">By channel</p>
		<h2 id={headingId} class="text-xl font-bold tracking-tight text-base-content sm:text-2xl">
			Payload Wizard for other platforms
		</h2>
		<p class="max-w-2xl text-sm text-base-content/70">
			Each page opens with that network selected and shows posting format examples. Use the generic
			tool when you want Global Edit across sample channels.
		</p>
	</div>

	<ul
		class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
		aria-label="Payload Wizard by channel"
	>
		<li>
			<a
				href={genericHref}
				aria-current={isGenericActive ? 'page' : undefined}
				class="group flex h-full flex-col gap-3 rounded-2xl border p-4 transition {isGenericActive
					? 'border-primary bg-primary/5 ring-2 ring-primary/30'
					: 'border-base-content/10 bg-base-200/40 hover:border-primary/40 hover:bg-base-200/70'}"
			>
				<span
					class="grid size-10 place-items-center rounded-lg border border-white/10 bg-base-100/80"
					aria-hidden="true"
				>
					<AbstractIcon
						name={icons.Braces.name}
						width="22"
						height="22"
						class="size-5"
						focusable="false"
					/>
				</span>
				<span class="space-y-1 text-left">
					<span class="block text-sm font-bold text-base-content group-hover:text-primary">
						For all channels
					</span>
					<span class="block text-xs leading-relaxed text-base-content/65">
						Global Edit — no platform default.
					</span>
				</span>
				<span class="mt-auto text-xs font-semibold text-primary">
					{isGenericActive ? 'Current page' : 'Open Payload Wizard →'}
				</span>
			</a>
		</li>

		{#each channelLinksVm as channelVm (channelVm.slug)}
			{@const isActive = activeChannelSlug === channelVm.slug}
			<li>
				<a
					href={url(channelVm.href)}
					aria-current={isActive ? 'page' : undefined}
					class="group flex h-full flex-col gap-3 rounded-2xl border p-4 transition {isActive
						? 'border-primary bg-primary/5 ring-2 ring-primary/30'
						: 'border-base-content/10 bg-base-200/40 hover:border-primary/40 hover:bg-base-200/70'}"
				>
					<span
						class="grid size-10 place-items-center rounded-lg border border-white/10 bg-base-100/80"
						aria-hidden="true"
					>
						<AbstractIcon
							name={channelVm.icon}
							width="22"
							height="22"
							class="size-5"
							focusable="false"
						/>
					</span>
					<span class="space-y-1 text-left">
						<span class="block text-sm font-bold text-base-content group-hover:text-primary">
							{channelVm.platformLabel}
						</span>
						<span class="line-clamp-2 block text-xs leading-relaxed text-base-content/65">
							{channelVm.description}
						</span>
					</span>
					<span class="mt-auto text-xs font-semibold text-primary">
						{isActive ? 'Current page' : 'Open Payload Wizard →'}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</section>
