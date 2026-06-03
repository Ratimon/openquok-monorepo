<script lang="ts">
	import { AnimatePresence, Motion } from 'svelte-motion';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type AnimationStyle =
		| 'from-bottom'
		| 'from-center'
		| 'from-top'
		| 'from-left'
		| 'from-right'
		| 'fade'
		| 'top-in-bottom-out'
		| 'left-in-right-out';

	type Props = {
		animationStyle?: AnimationStyle;
		videoSrc: string;
		thumbnailSrc: string;
		thumbnailAlt?: string;
		iconColor?: string;
	};

	let {
		animationStyle = 'from-center',
		videoSrc,
		thumbnailSrc,
		thumbnailAlt = 'Video thumbnail',
		iconColor = 'white'
	}: Props = $props();

	let isVideoOpen = $state(false);
	let isCloseHovered = $state(false);
	let isPlayHovered = $state(false);

	const animationVariants = {
		'from-bottom': {
			initial: { y: 100, opacity: 0 },
			animate: { y: 0, opacity: 1 },
			exit: { y: 100, opacity: 0 }
		},
		'from-center': {
			initial: { scale: 0.5, opacity: 0 },
			animate: { scale: 1, opacity: 1 },
			exit: { scale: 0.5, opacity: 0 }
		},
		'from-top': {
			initial: { y: -100, opacity: 0 },
			animate: { y: 0, opacity: 1 },
			exit: { y: -100, opacity: 0 }
		},
		'from-left': {
			initial: { x: -100, opacity: 0 },
			animate: { x: 0, opacity: 1 },
			exit: { x: -100, opacity: 0 }
		},
		'from-right': {
			initial: { x: 100, opacity: 0 },
			animate: { x: 0, opacity: 1 },
			exit: { x: 100, opacity: 0 }
		},
		fade: {
			initial: { opacity: 0 },
			animate: { opacity: 1 },
			exit: { opacity: 0 }
		},
		'top-in-bottom-out': {
			initial: { y: -100, opacity: 0 },
			animate: { y: 0, opacity: 1 },
			exit: { y: 200, opacity: 0 }
		},
		'left-in-right-out': {
			initial: { x: -100, opacity: 0 },
			animate: { x: 0, opacity: 1 },
			exit: { x: 200, opacity: 0 }
		}
	} as const;

	const selectedAnimation = $derived(animationVariants[animationStyle]);

	function openVideo() {
		isVideoOpen = true;
	}

	function closeVideo() {
		isVideoOpen = false;
	}

	const playIconScale = $derived(isPlayHovered ? 1.1 : 1);
</script>

<div class="relative">
	<button
		type="button"
		class="relative w-full cursor-pointer border-0 bg-transparent p-0 text-left"
		aria-label="Play video"
		onclick={openVideo}
		onmouseenter={() => (isPlayHovered = true)}
		onmouseleave={() => (isPlayHovered = false)}
	>
		<img
			src={thumbnailSrc}
			alt={thumbnailAlt}
			width={1920}
			height={1080}
			class="w-full rounded-2xl transition-all duration-200"
		/>
		<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
			<div
				class="flex size-24 items-center justify-center rounded-full border border-neutral-800 backdrop-blur-md transition-transform duration-300 ease-out"
				class:scale-110={isPlayHovered}
			>
				<div
					class="flex size-20 items-center justify-center rounded-full border border-neutral-800 backdrop-blur-2xl transition-all duration-300 ease-out"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke={iconColor}
						stroke-width="1.7"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-8 transition-transform duration-300 ease-out"
						style="transform: scale({playIconScale})"
						aria-hidden="true"
					>
						<path d="M5 5a2 2 0 0 1 3.08-1.63l11.26 6.9a2 2 0 0 1 0 3.46L8.08 20.6A2 2 0 0 1 5 18.97z" />
					</svg>
				</div>
			</div>
		</div>
	</button>

	<AnimatePresence list={[{ key: isVideoOpen }]} let:item>
		{#if item.key}
			<Motion
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				let:motion
			>
				<div
					use:motion
					class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
					role="presentation"
					onclick={(e) => {
						if (e.currentTarget === e.target) closeVideo();
					}}
				>
					<Motion
						initial={selectedAnimation.initial}
						animate={selectedAnimation.animate}
						exit={selectedAnimation.exit}
						transition={{ type: 'spring', damping: 30, stiffness: 300 }}
						let:motion
					>
						<div
							use:motion
							class="relative mx-4 aspect-video w-full max-w-4xl md:mx-0"
						>
							<Motion whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} let:motion>
								<button
									type="button"
									use:motion
									class="absolute -top-16 right-0 rounded-full bg-neutral-900/50 p-2 text-xl text-white ring-1 backdrop-blur-md"
									aria-label="Close video"
									onclick={closeVideo}
									onmouseenter={() => (isCloseHovered = true)}
									onmouseleave={() => (isCloseHovered = false)}
								>
									<AbstractIcon
										name={icons.X2.name}
										width="20"
										height="20"
										class="size-5 text-white"
									/>
								</button>
							</Motion>
							<Motion
								animate={{ scale: isCloseHovered ? 0.98 : 1 }}
								transition={{ duration: 0.2 }}
								let:motion
							>
								<div
									use:motion
									class="relative isolate z-[1] size-full overflow-hidden rounded-2xl border-2 border-white"
								>
									<iframe
										src={videoSrc}
										title={thumbnailAlt}
										class="size-full rounded-2xl"
										allowfullscreen
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									></iframe>
								</div>
							</Motion>
						</div>
					</Motion>
				</div>
			</Motion>
		{/if}
	</AnimatePresence>
</div>
