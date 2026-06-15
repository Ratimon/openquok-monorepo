<script lang="ts">
	import type { FeaturesAnimatedModel } from '$lib/content/constants/publicAgentConfig';

	import { onMount } from 'svelte';
	import { AnimatePresence, Motion } from 'svelte-motion';

	import { DEFAULT_LLM_MODELS } from '$lib/content/constants/publicAgentConfig';
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		models?: FeaturesAnimatedModel[];
		autoplay?: boolean;
		autoplayIntervalMs?: number;
		ariaLabel?: string;
	};

	let {
		models = DEFAULT_LLM_MODELS,
		autoplay = true,
		autoplayIntervalMs = 4500,
		ariaLabel = 'LLM model selection preview'
	}: Props = $props();

	let active = $state(0);

	function stackRotation(index: number) {
		return ((index * 7 + 3) % 21) - 10;
	}

	const activeModel = $derived(models[active] ?? models[0]);

	function isActive(index: number) {
		return index === active;
	}

	function handleNext() {
		if (models.length === 0) return;
		active = (active + 1) % models.length;
	}

	function handlePrev() {
		if (models.length === 0) return;
		active = (active - 1 + models.length) % models.length;
	}

	onMount(() => {
		if (!autoplay || models.length <= 1) return;

		const interval = setInterval(handleNext, autoplayIntervalMs);
		return () => clearInterval(interval);
	});
</script>

<div
	class="flex size-full flex-col overflow-hidden rounded-xl border border-base-content/10 bg-base-100 p-4 shadow-lg sm:p-5"
	role="region"
	aria-label={ariaLabel}
>
	<div class="grid min-h-0 flex-1 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
		<div class="relative mx-auto h-44 w-full max-w-[220px] sm:mx-0 sm:h-full sm:max-w-none">
			<AnimatePresence let:item list={[{ key: active }]}>
				{#each models as model, index (model.name)}
					<Motion
						initial={{
							opacity: 0,
							scale: 0.9,
							z: -100,
							rotate: stackRotation(index)
						}}
						animate={{
							opacity: isActive(index) ? 1 : 0.7,
							scale: isActive(index) ? 1 : 0.95,
							z: isActive(index) ? 0 : -100,
							rotate: isActive(index) ? 0 : stackRotation(index),
							zIndex: isActive(index) ? 999 : models.length + 2 - index,
							y: isActive(index) ? [0, -24, 0] : 0
						}}
						exit={{
							opacity: 0,
							scale: 0.9,
							z: 100,
							rotate: stackRotation(index)
						}}
						transition={{
							duration: 0.4,
							ease: 'easeInOut'
						}}
						let:motion
					>
						<div use:motion class="absolute inset-0 origin-bottom">
							<div
								class="flex size-full items-center justify-center rounded-2xl border border-base-content/10 shadow-md {model.containerClass ??
									'bg-base-200'}"
							>
								<AbstractIcon
									name={model.iconName}
									class={model.iconClass ?? 'size-12 text-base-content'}
									width="56"
									height="56"
								/>
							</div>
						</div>
					</Motion>
				{/each}
			</AnimatePresence>
		</div>

		<div class="flex min-h-0 flex-col justify-between gap-4">
			<Motion
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: -20, opacity: 0 }}
				transition={{ duration: 0.2, ease: 'easeInOut' }}
				let:motion
			>
				<div use:motion class="space-y-2">
					<h3 class="text-xl font-bold text-base-content sm:text-2xl">
						{activeModel.name}
					</h3>
					<p class="text-sm text-base-content/60">
						{activeModel.provider}
					</p>
					{#key active}
						<p class="text-sm leading-relaxed text-base-content/80 sm:text-base">
							{#each activeModel.description.split(' ') as word, wordIndex (wordIndex)}
								<Motion
									initial={{ filter: 'blur(10px)', opacity: 0, y: 5 }}
									animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
									transition={{
										duration: 0.2,
										ease: 'easeInOut',
										delay: 0.02 * wordIndex
									}}
									let:motion
								>
									<span use:motion class="inline-block">
										{word}&nbsp;
									</span>
								</Motion>
							{/each}
						</p>
					{/key}
				</div>
			</Motion>

			<div class="flex gap-3">
				<button
					type="button"
					class="flex size-8 items-center justify-center rounded-full bg-base-200 text-base-content/70 transition-colors hover:bg-base-300 hover:text-base-content"
					aria-label="Previous model"
					onclick={handlePrev}
				>
					<AbstractIcon
						name={icons.ArrowLeft.name}
						class="size-4"
						width="16"
						height="16"
					/>
				</button>
				<button
					type="button"
					class="flex size-8 items-center justify-center rounded-full bg-base-200 text-base-content/70 transition-colors hover:bg-base-300 hover:text-base-content"
					aria-label="Next model"
					onclick={handleNext}
				>
					<AbstractIcon
						name={icons.ArrowRight.name}
						class="size-4"
						width="16"
						height="16"
					/>
				</button>
			</div>
		</div>
	</div>
</div>
