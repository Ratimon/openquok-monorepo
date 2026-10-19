<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AnimatedBeam from '$lib/ui/animated-beam/AnimatedBeam.svelte';
	import BeamCircle from '$lib/ui/animated-beam/BeamCircle.svelte';

	let containerRef = $state<HTMLElement>();
	let userRef = $state<HTMLElement>();
	let profileRef = $state<HTMLElement>();
	let peerpushRef = $state<HTMLElement>();
	let uneedRef = $state<HTMLElement>();
</script>

<div
	bind:this={containerRef}
	class="relative flex h-full min-h-72 w-full items-stretch justify-center overflow-hidden rounded-lg border border-base-content/10 bg-base-100 p-8 shadow-2xl ring-1 ring-base-content/10 sm:min-h-80 sm:p-10 lg:min-h-96"
	aria-hidden="true"
>
	<div
		class="flex h-full w-full max-w-sm flex-row items-stretch justify-between gap-8 py-4 sm:max-w-md sm:gap-12 sm:py-6"
	>
		<div class="flex h-full flex-col justify-center">
			<BeamCircle class="size-14 sm:size-16">
				<div bind:this={userRef} class="flex items-center justify-center text-base-content">
					<AbstractIcon name={icons.User1.name} width="28" height="28" />
				</div>
			</BeamCircle>
		</div>

		<div class="flex h-full flex-col justify-center">
			<BeamCircle class="size-16 sm:size-[4.5rem]">
				<div bind:this={profileRef} class="flex items-center justify-center text-primary">
					<AbstractIcon name={icons.CustomizedDrawnHouse.name} width="30" height="30" />
				</div>
			</BeamCircle>
		</div>

		<div class="flex h-full flex-col justify-between py-6 sm:py-10">
			<BeamCircle class="size-14 sm:size-16">
				<div bind:this={peerpushRef} class="flex items-center justify-center">
					<AbstractIcon name={icons.PeerPush.name} width="28" height="28" />
				</div>
			</BeamCircle>
			<BeamCircle class="size-14 sm:size-16">
				<div bind:this={uneedRef} class="flex items-center justify-center">
					<AbstractIcon name={icons.Uneed.name} width="28" height="28" />
				</div>
			</BeamCircle>
		</div>
	</div>

	<AnimatedBeam {containerRef} fromRef={userRef} toRef={profileRef} />
	<AnimatedBeam {containerRef} fromRef={profileRef} toRef={peerpushRef} curvature={32} />
	<AnimatedBeam {containerRef} fromRef={profileRef} toRef={uneedRef} curvature={-32} />
</div>
