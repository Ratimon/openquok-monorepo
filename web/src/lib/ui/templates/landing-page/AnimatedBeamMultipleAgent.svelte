<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AnimatedBeam from '$lib/ui/animated-beam/AnimatedBeam.svelte';
	import BeamCircle from '$lib/ui/animated-beam/BeamCircle.svelte';

	let containerRef = $state<HTMLElement>();
	let userRef = $state<HTMLElement>();
	let botTopRef = $state<HTMLElement>();
	let botMiddleRef = $state<HTMLElement>();
	let botBottomRef = $state<HTMLElement>();
	let socialTopRef = $state<HTMLElement>();
	let socialMiddleRef = $state<HTMLElement>();
	let socialBottomRef = $state<HTMLElement>();
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

		<div class="flex h-full flex-col justify-between py-2 sm:py-4">
			<BeamCircle class="size-14 sm:size-16">
				<div bind:this={botTopRef} class="flex items-center justify-center text-base-content">
					<AbstractIcon name={icons.Bot.name} width="26" height="26" />
				</div>
			</BeamCircle>
			<BeamCircle class="size-14 sm:size-16">
				<div bind:this={botMiddleRef} class="flex items-center justify-center text-base-content">
					<AbstractIcon name={icons.Bot.name} width="26" height="26" />
				</div>
			</BeamCircle>
			<BeamCircle class="size-14 sm:size-16">
				<div bind:this={botBottomRef} class="flex items-center justify-center text-base-content">
					<AbstractIcon name={icons.Bot.name} width="26" height="26" />
				</div>
			</BeamCircle>
		</div>

		<div class="flex h-full flex-col justify-between py-2 sm:py-4">
			<BeamCircle class="size-14 sm:size-16">
				<div bind:this={socialTopRef} class="flex items-center justify-center">
					<AbstractIcon name={icons.InstagramGlyph.name} width="24" height="24" />
				</div>
			</BeamCircle>
			<BeamCircle class="size-14 sm:size-16">
				<div bind:this={socialMiddleRef} class="flex items-center justify-center">
					<AbstractIcon name={icons.TikTok.name} width="24" height="24" />
				</div>
			</BeamCircle>
			<BeamCircle class="size-14 sm:size-16">
				<div bind:this={socialBottomRef} class="flex items-center justify-center">
					<AbstractIcon name={icons.FacebookGlyph.name} width="24" height="24" />
				</div>
			</BeamCircle>
		</div>
	</div>

	<AnimatedBeam {containerRef} fromRef={userRef} toRef={botTopRef} curvature={40} />
	<AnimatedBeam {containerRef} fromRef={userRef} toRef={botMiddleRef} />
	<AnimatedBeam {containerRef} fromRef={userRef} toRef={botBottomRef} curvature={-40} />
	<AnimatedBeam {containerRef} fromRef={botMiddleRef} toRef={socialTopRef} curvature={40} />
	<AnimatedBeam {containerRef} fromRef={botMiddleRef} toRef={socialMiddleRef} />
	<AnimatedBeam {containerRef} fromRef={botMiddleRef} toRef={socialBottomRef} curvature={-40} />
</div>
