<script lang="ts">
	import type { PageData } from './$types';
	import { absoluteUrl } from '$lib/utils/path';
	import { getRootPathEditorFeedbackManager } from '$lib/area-admin/constants/getRootPathEditorArea';

	type Props = { data: PageData };
	let { data }: Props = $props();

	const feedbackManagerUrl = absoluteUrl(getRootPathEditorFeedbackManager());
</script>

<div class="p-4 md:p-6">
	<h1 class="text-xl font-semibold text-base-content">
		Editor area</h1>
	<p class="text-sm text-base-content/70 mt-1">
		Tools for editors.
	</p>

	<div class="mt-6 grid gap-3 sm:grid-cols-2">
		<a
			href={feedbackManagerUrl}
			class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm hover:bg-base-200 transition-colors"
		>
			<div class="font-medium text-base-content">
				Feedback manager</div>
			<div class="text-sm text-base-content/70 mt-1">
				View and manage incoming feedback.
			</div>
		</a>
	</div>
</div>

