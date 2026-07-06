<script lang="ts">
	import { tick } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { AnimatePresence, Motion } from 'svelte-motion';

	import { cn } from '$lib/ui/helpers/common';

	type SplitBy = 'words' | 'characters' | 'lines' | string;
	type StaggerFrom = 'first' | 'last' | 'center' | 'random' | number;
	type MotionState = Record<string, unknown> | Record<string, unknown>[];

	interface RenderGroup {
		characters: string[];
		needsSpace: boolean;
		offset: number;
		key: string;
	}

	interface TextRotateProps extends HTMLAttributes<HTMLSpanElement> {
		texts: string[];
		rotationInterval?: number;
		initial?: MotionState;
		animate?: MotionState;
		exit?: MotionState;
		animatePresenceInitial?: boolean;
		staggerDuration?: number;
		staggerFrom?: StaggerFrom;
		transition?: Record<string, unknown>;
		loop?: boolean;
		auto?: boolean;
		splitBy?: SplitBy;
		onNext?: (index: number) => void;
		mainClassName?: string;
		splitLevelClassName?: string;
		elementLevelClassName?: string;
		class?: string;
	}

	const defaultTransition = { type: 'spring', damping: 25, stiffness: 300 };

	function splitIntoCharacters(text: string) {
		if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
			const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
			return Array.from(segmenter.segment(text), ({ segment }) => segment);
		}

		return Array.from(text);
	}

	function buildRenderGroups(text: string, indexSeed: number, splitMode: SplitBy): RenderGroup[] {
		if (!text) return [];

		if (splitMode === 'characters') {
			const words = text.split(' ');
			let offset = 0;

			return words.map((word, index) => {
				const characters = splitIntoCharacters(word);
				const group = {
					characters,
					needsSpace: index !== words.length - 1,
					offset,
					key: `${indexSeed}-${index}-${word}`
				};

				offset += characters.length;
				return group;
			});
		}

		const segments =
			splitMode === 'words'
				? text.split(' ')
				: splitMode === 'lines'
					? text.replace(/\r\n?/g, '\n').split('\n')
					: text.split(splitMode);

		let offset = 0;

		return segments.map((segment, index) => {
			const group = {
				characters: [segment],
				needsSpace: splitMode === 'words' && index !== segments.length - 1,
				offset,
				key: `${indexSeed}-${index}-${segment}`
			};

			offset += 1;
			return group;
		});
	}

	function pickMotionState<T extends Record<string, unknown>>(value: T | T[], index: number): T {
		if (Array.isArray(value)) {
			return value[index % value.length] as T;
		}

		return value;
	}

	let {
		texts,
		rotationInterval = 2000,
		initial = { y: '100%', opacity: 0 },
		animate = { y: 0, opacity: 1 },
		exit = { y: '-120%', opacity: 0 },
		animatePresenceInitial = false,
		staggerDuration = 0,
		staggerFrom = 'first',
		transition = defaultTransition,
		loop = true,
		auto = true,
		splitBy = 'characters',
		onNext,
		mainClassName,
		splitLevelClassName,
		elementLevelClassName,
		class: className,
		...props
	}: TextRotateProps = $props();

	let currentTextIndex = $state(0);
	let widthProbeRef = $state<HTMLSpanElement | null>(null);
	let widthProbeIndex = $state(0);
	let containerWidth = $state(0);

	const currentText = $derived(texts[currentTextIndex] ?? '');
	const widthProbeText = $derived(texts[widthProbeIndex] ?? '');
	const presenceList = $derived([{ key: currentTextIndex }]);

	const renderGroups = $derived.by(() =>
		buildRenderGroups(currentText, currentTextIndex, splitBy)
	);
	const widthProbeRenderGroups = $derived.by(() =>
		buildRenderGroups(widthProbeText, widthProbeIndex, splitBy)
	);

	const totalCharacters = $derived.by(() =>
		renderGroups.reduce((sum, group) => sum + group.characters.length, 0)
	);

	function getStaggerDelay(index: number, characterCount: number) {
		const total = Math.max(characterCount, 1);

		if (staggerFrom === 'first') return index * staggerDuration;
		if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration;

		if (staggerFrom === 'center') {
			const center = Math.floor(total / 2);
			return Math.abs(center - index) * staggerDuration;
		}

		if (staggerFrom === 'random') {
			const randomIndex = Math.floor(Math.random() * total);
			return Math.abs(randomIndex - index) * staggerDuration;
		}

		return Math.abs(staggerFrom - index) * staggerDuration;
	}

	function getAnimationProps(index: number) {
		return {
			initial: pickMotionState(initial, index),
			animate: pickMotionState(animate, index),
			exit: pickMotionState(exit, index)
		};
	}

	function applyIndexChange(newIndex: number) {
		currentTextIndex = newIndex;
		onNext?.(newIndex);
	}

	export function next() {
		if (texts.length === 0) return;

		const nextIndex =
			currentTextIndex === texts.length - 1
				? loop
					? 0
					: currentTextIndex
				: currentTextIndex + 1;

		if (nextIndex !== currentTextIndex) {
			applyIndexChange(nextIndex);
		}
	}

	export function previous() {
		if (texts.length === 0) return;

		const previousIndex =
			currentTextIndex === 0
				? loop
					? texts.length - 1
					: currentTextIndex
				: currentTextIndex - 1;

		if (previousIndex !== currentTextIndex) {
			applyIndexChange(previousIndex);
		}
	}

	export function jumpTo(index: number) {
		if (texts.length === 0) return;

		const validIndex = Math.max(0, Math.min(index, texts.length - 1));

		if (validIndex !== currentTextIndex) {
			applyIndexChange(validIndex);
		}
	}

	export function reset() {
		if (currentTextIndex !== 0) {
			applyIndexChange(0);
		}
	}

	$effect(() => {
		const maxIndex = Math.max(texts.length - 1, 0);

		if (currentTextIndex > maxIndex) {
			currentTextIndex = maxIndex;
		}
	});

	$effect(() => {
		if (!auto || texts.length < 2) {
			return;
		}

		const intervalId = setInterval(() => next(), Math.max(0, rotationInterval));
		return () => clearInterval(intervalId);
	});

	$effect(() => {
		texts;
		splitBy;
		elementLevelClassName;
		mainClassName;

		if (typeof window === 'undefined' || !widthProbeRef) {
			return;
		}

		let cancelled = false;

		queueMicrotask(async () => {
			let maxWidth = 0;

			for (let index = 0; index < texts.length; index += 1) {
				widthProbeIndex = index;
				await tick();

				if (cancelled || !widthProbeRef) {
					return;
				}

				maxWidth = Math.max(maxWidth, widthProbeRef.offsetWidth);
			}

			containerWidth = maxWidth;
			widthProbeIndex = currentTextIndex;
		});

		return () => {
			cancelled = true;
		};
	});
</script>

<span
	class="pointer-events-none invisible fixed top-0 left-[-10000px] whitespace-pre-wrap"
	aria-hidden="true"
>
	<span
		bind:this={widthProbeRef}
		class={cn('inline-flex flex-wrap', splitBy === 'lines' && 'w-full flex-col', mainClassName)}
	>
		{#each widthProbeRenderGroups as group (`probe-${group.key}`)}
			<span class={cn('inline-flex', splitBy === 'lines' && 'w-full', splitLevelClassName)}>
				{#each group.characters as character, charIndex (`probe-${group.key}-${charIndex}`)}
					<span class={cn(elementLevelClassName)}>{character}</span>
				{/each}

				{#if group.needsSpace}
					<span aria-hidden="true" class="whitespace-pre"> </span>
				{/if}
			</span>
		{/each}
	</span>
</span>

<span
	class={cn('relative inline-block align-baseline', mainClassName, className)}
	style:min-width={containerWidth > 0 ? `${containerWidth}px` : undefined}
	{...props}
>
	<span class="sr-only">{currentText}</span>

	<AnimatePresence
		list={presenceList}
		let:item
		exitBeforeEnter={true}
		initial={animatePresenceInitial}
	>
		{#if item}
			<span
				aria-hidden="true"
				class={cn('inline-flex flex-wrap', splitBy === 'lines' && 'w-full flex-col')}
			>
				{#each renderGroups as group (group.key)}
					<span
						class={cn('inline-flex', splitBy === 'lines' && 'w-full', splitLevelClassName)}
					>
						{#each group.characters as character, charIndex (`${currentTextIndex}-${group.key}-${charIndex}`)}
							{@const totalIndex = group.offset + charIndex}
							{@const animationProps = getAnimationProps(totalIndex)}

							<span class={cn(elementLevelClassName)}>
								<Motion
									initial={animationProps.initial}
									animate={animationProps.animate}
									exit={animationProps.exit}
									transition={{
										...transition,
										delay: getStaggerDelay(totalIndex, totalCharacters)
									}}
									let:motion
								>
									<span use:motion class="inline-block">{character}</span>
								</Motion>
							</span>
						{/each}

						{#if group.needsSpace}
							<span aria-hidden="true" class="whitespace-pre"> </span>
						{/if}
					</span>
				{/each}
			</span>
		{/if}
	</AnimatePresence>
</span>
