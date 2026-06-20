<script lang="ts">
	type Props = {
		postAsImagesCarousel?: boolean;
		carouselName?: string;
		/** When false, carousel option is hidden (personal profile). */
		showCarousel?: boolean;
	};

	let {
		postAsImagesCarousel = $bindable(false),
		carouselName = $bindable(''),
		showCarousel = true
	}: Props = $props();
</script>

<div class="space-y-4">
	{#if showCarousel}
		<label class="flex items-center gap-2 text-sm text-base-content/80">
			<input
				type="checkbox"
				class="checkbox checkbox-primary checkbox-sm"
				bind:checked={postAsImagesCarousel}
			/>
			Post as image carousel (PDF document on LinkedIn)
		</label>

		{#if postAsImagesCarousel}
			<div class="space-y-1">
				<label class="text-xs font-medium text-base-content/70" for="linkedin-carousel-name">
					Carousel document title
				</label>
				<input
					id="linkedin-carousel-name"
					class="border-base-300 bg-base-100 w-full rounded-md border px-3 py-2 text-sm"
					placeholder="slides"
					bind:value={carouselName}
				/>
			</div>
		{/if}
	{/if}
</div>
