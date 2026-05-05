<script lang="ts">
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
</script>

<svelte:head>
	<title>
		Integrations — OpenQuok
	</title>
</svelte:head>

<div class="mx-auto max-w-6xl min-w-0 px-4 py-8">
	<div>
		<div class="flex items-center gap-3">
			<AbstractIcon
				name={icons.Link.name}
				class="text-primary size-8 shrink-0"
				width="32"
				height="32"
			/>
			<h1 class="text-2xl font-semibold tracking-tight text-base-content">
				Integrations
			</h1>
		</div>
		<p class="mt-2 text-base-content/80">
			Connect external services and manage integrations for this workspace.
		</p>
	</div>
</div>
