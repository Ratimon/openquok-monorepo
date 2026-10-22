<script lang="ts">
	import type { PublicDirectoryChannelSlug } from '$lib/content/constants/channels/catalog/directory-platforms/directoryChannelProcessSection';

	type Props = {
		channelSlug: PublicDirectoryChannelSlug;
	};

	let { channelSlug }: Props = $props();

	const peerpushOptions = [
		{ id: 'standard', label: 'Standard launch', note: 'Paid — faster publish path on PeerPush' },
		{ id: 'queue', label: 'Free queue', note: 'Wait in line — confirm dofollow terms on the site' }
	];

	const uneedOptions = [
		{ id: 'line', label: 'Join the line', note: 'Free queue — Uneed sets timing and listing rules' },
		{ id: 'paid', label: 'Paid launch', note: 'Reserved slot when Uneed offers paid placement' },
		{ id: 'maker', label: 'Maker profile', note: 'Separate flow — check backlink policy before submit' }
	];

	const options = $derived(channelSlug === 'peerpush' ? peerpushOptions : uneedOptions);
	const platformLabel = $derived(channelSlug === 'peerpush' ? 'PeerPush' : 'Uneed');
</script>

<div class="select-none bg-base-100 p-4 text-base-content sm:p-5">
	<p class="text-xs font-medium tracking-wide text-base-content/50 uppercase">Launch options</p>
	<p class="mt-1 text-sm font-semibold">Pick free or paid on {platformLabel}</p>

	<ul class="mt-5 space-y-3">
		{#each options as option, index (option.id)}
			<li
				class="rounded-xl border px-3 py-3 {index === 0
					? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
					: 'border-base-300/90 bg-base-200/30'}"
			>
				<p class="text-sm font-semibold">{option.label}</p>
				<p class="mt-1 text-xs leading-relaxed text-base-content/65">{option.note}</p>
			</li>
		{/each}
	</ul>

	<p class="mt-4 text-center text-xs leading-relaxed text-base-content/55">
		OpenQuok lists each path in My Products. You choose before autofill — OpenQuok does not pick for you.
	</p>
</div>
