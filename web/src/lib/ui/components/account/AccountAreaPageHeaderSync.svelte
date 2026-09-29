<script lang="ts">
	import { accountAreaPageHeaderPresenter } from '$lib/area-protected/AccountAreaPageHeader.presenter.svelte';

	type Props = {
		title: string;
		currentPageLabel?: string;
		linkHome?: boolean;
		headingId?: string;
		description?: string | null;
		actionLabel?: string | null;
		onAction?: (() => void) | null;
	};

	let {
		title,
		currentPageLabel,
		linkHome = true,
		headingId,
		description = null,
		actionLabel = null,
		onAction = null
	}: Props = $props();

	$effect(() => {
		accountAreaPageHeaderPresenter.set({
			title,
			currentPageLabel,
			linkHome,
			headingId,
			description,
			actionLabel,
			onAction
		});
		return () => {
			accountAreaPageHeaderPresenter.clear();
		};
	});
</script>
