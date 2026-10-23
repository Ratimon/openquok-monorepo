<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AnimatedBeam from '$lib/ui/animated-beam/AnimatedBeam.svelte';
	import BeamCircle from '$lib/ui/animated-beam/BeamCircle.svelte';

	let containerRef = $state<HTMLElement>();
	let userRef = $state<HTMLElement>();
	let botTopRef = $state<HTMLElement>();
	let botUpperMidRef = $state<HTMLElement>();
	let botLowerMidRef = $state<HTMLElement>();
	let botBottomRef = $state<HTMLElement>();
	let channelTopRef = $state<HTMLElement>();
	let channelUpperMidRef = $state<HTMLElement>();
	let channelLowerMidRef = $state<HTMLElement>();
	let channelBottomRef = $state<HTMLElement>();
</script>

<div
	bind:this={containerRef}
	class="relative flex h-full min-h-72 w-full items-stretch justify-center overflow-hidden rounded-lg border border-base-content/10 bg-base-100 p-8 shadow-2xl ring-1 ring-base-content/10 sm:min-h-80 sm:p-10 lg:min-h-96"
	aria-hidden="true"
>
	<div
		class="flex h-full w-full max-w-md flex-row items-stretch justify-between gap-6 py-4 sm:gap-10 sm:py-6"
	>
		<div class="flex h-full flex-col justify-center">
			<BeamCircle class="size-14 sm:size-16">
				<div bind:this={userRef} class="flex items-center justify-center text-base-content">
					<AbstractIcon name={icons.User1.name} width="28" height="28" />
				</div>
			</BeamCircle>
		</div>

		<div class="flex h-full flex-col justify-between py-1 sm:py-2">
			<BeamCircle class="size-12 sm:size-14">
				<div bind:this={botTopRef} class="flex items-center justify-center text-base-content">
					<AbstractIcon name={icons.Bot.name} width="24" height="24" />
				</div>
			</BeamCircle>
			<BeamCircle class="size-12 sm:size-14">
				<div bind:this={botUpperMidRef} class="flex items-center justify-center text-base-content">
					<AbstractIcon name={icons.Bot.name} width="24" height="24" />
				</div>
			</BeamCircle>
			<BeamCircle class="size-12 sm:size-14">
				<div bind:this={botLowerMidRef} class="flex items-center justify-center text-base-content">
					<AbstractIcon name={icons.Bot.name} width="24" height="24" />
				</div>
			</BeamCircle>
			<BeamCircle class="size-12 sm:size-14">
				<div bind:this={botBottomRef} class="flex items-center justify-center text-base-content">
					<AbstractIcon name={icons.Bot.name} width="24" height="24" />
				</div>
			</BeamCircle>
		</div>

		<div class="flex h-full flex-col justify-between py-1 sm:py-2">
			<BeamCircle class="size-12 sm:size-14">
				<div bind:this={channelTopRef} class="flex items-center justify-center">
					<AbstractIcon name={icons.InstagramGlyph.name} width="22" height="22" />
				</div>
			</BeamCircle>
			<BeamCircle class="size-12 sm:size-14">
				<div bind:this={channelUpperMidRef} class="flex items-center justify-center">
					<AbstractIcon name={icons.TikTok.name} width="22" height="22" />
				</div>
			</BeamCircle>
			<BeamCircle class="size-12 sm:size-14">
				<div bind:this={channelLowerMidRef} class="flex items-center justify-center">
					<AbstractIcon name={icons.PeerPush.name} width="22" height="22" />
				</div>
			</BeamCircle>
			<BeamCircle class="size-12 sm:size-14">
				<div bind:this={channelBottomRef} class="flex items-center justify-center">
					<AbstractIcon name={icons.FacebookGlyph.name} width="22" height="22" />
				</div>
			</BeamCircle>
		</div>
	</div>

	<AnimatedBeam {containerRef} fromRef={userRef} toRef={botTopRef} curvature={50} />
	<AnimatedBeam {containerRef} fromRef={userRef} toRef={botUpperMidRef} curvature={20} />
	<AnimatedBeam {containerRef} fromRef={userRef} toRef={botLowerMidRef} curvature={-20} />
	<AnimatedBeam {containerRef} fromRef={userRef} toRef={botBottomRef} curvature={-50} />
	<AnimatedBeam {containerRef} fromRef={botTopRef} toRef={channelTopRef} curvature={40} />
	<AnimatedBeam {containerRef} fromRef={botUpperMidRef} toRef={channelUpperMidRef} curvature={20} />
	<AnimatedBeam {containerRef} fromRef={botLowerMidRef} toRef={channelLowerMidRef} curvature={-20} />
	<AnimatedBeam {containerRef} fromRef={botBottomRef} toRef={channelBottomRef} curvature={-40} />
</div>
