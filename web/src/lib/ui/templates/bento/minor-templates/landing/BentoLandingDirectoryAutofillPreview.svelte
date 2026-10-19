<script lang="ts">
	import { LANDING_DIRECTORY_MOCK_PROFILE } from '$lib/ui/templates/bento/minor-templates/landing/landingDirectoryProfileMock';
</script>

<div class="select-none bg-base-100 text-base-content">
	<div class="flex items-center gap-2 border-b border-base-300 bg-base-200/60 px-3 py-2">
		<span class="size-2.5 rounded-full bg-error/80" aria-hidden="true"></span>
		<span class="size-2.5 rounded-full bg-warning/80" aria-hidden="true"></span>
		<span class="size-2.5 rounded-full bg-success/80" aria-hidden="true"></span>
		<p class="ml-2 truncate text-xs text-base-content/70">peerpush.com · Submit product</p>
	</div>

	<div class="space-y-3 p-4 sm:p-5">
		<p class="text-xs font-medium tracking-wide text-base-content/50 uppercase">Directory form</p>

		<div class="rounded-lg border border-base-300/90 bg-base-200/30 px-3 py-2.5">
			<div class="flex items-center justify-between gap-2">
				<span class="text-[0.65rem] font-semibold tracking-wide text-base-content/50 uppercase">
					Product name
				</span>
				<span class="badge badge-success badge-outline text-[0.6rem]">From profile</span>
			</div>
			<p class="mt-1 text-sm font-medium">{LANDING_DIRECTORY_MOCK_PROFILE.name}</p>
		</div>

		<div class="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
			<div class="flex items-center justify-between gap-2">
				<span class="text-[0.65rem] font-semibold tracking-wide text-base-content/50 uppercase">
					Tagline
				</span>
				<span class="badge badge-success badge-outline text-[0.6rem]">Autofilled</span>
			</div>
			<p class="mt-1 text-sm">{LANDING_DIRECTORY_MOCK_PROFILE.tagline}</p>
			<p class="mt-2 text-xs text-base-content/60">Edit before submit — extension filled this from My Products.</p>
		</div>

		<div class="rounded-lg border border-base-300/90 bg-base-200/30 px-3 py-2.5">
			<div class="flex items-center justify-between gap-2">
				<span class="text-[0.65rem] font-semibold tracking-wide text-base-content/50 uppercase">
					Website
				</span>
				<span class="badge badge-success badge-outline text-[0.6rem]">From profile</span>
			</div>
			<p class="mt-1 text-sm">{LANDING_DIRECTORY_MOCK_PROFILE.websiteDisplay}</p>
		</div>
	</div>
</div>
