<script lang="ts">
	import type { IconName } from '$data/icons';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AnimatedBeam from '$lib/ui/animated-beam/AnimatedBeam.svelte';
	import BeamCircle from '$lib/ui/animated-beam/BeamCircle.svelte';

	type Props = {
		channelIconName: IconName;
	};

	let { channelIconName }: Props = $props();

	let containerRef = $state<HTMLElement>();
	let userRef = $state<HTMLElement>();
	let botRef = $state<HTMLElement>();
	let channelRef = $state<HTMLElement>();
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
			<BeamCircle class="size-14 sm:size-16">
				<div bind:this={botRef} class="flex items-center justify-center text-base-content">
					<AbstractIcon name={icons.Bot.name} width="26" height="26" />
				</div>
			</BeamCircle>
		</div>

		<div class="flex h-full flex-col justify-center">
			<BeamCircle class="size-14 sm:size-16">
				<div bind:this={channelRef} class="flex items-center justify-center">
					<AbstractIcon name={channelIconName} width="26" height="26" />
				</div>
			</BeamCircle>
		</div>
	</div>

	<AnimatedBeam {containerRef} fromRef={userRef} toRef={botRef} />
	<AnimatedBeam {containerRef} fromRef={botRef} toRef={channelRef} curvature={32} />
</div>
