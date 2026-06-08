<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Button from '$lib/ui/buttons/Button.svelte';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter
	} from '$lib/ui/card';

	let companyName = $derived((page.data as App.LayoutData)?.companyNameVm ?? 'Openquok');
	let prefilledCode = $derived(page.form?.userCode ?? page.data.prefilledCode ?? '');
	let errorMessage = $derived(page.form?.error ?? null);
	let codeInput = $state<HTMLInputElement | null>(null);

	onMount(() => {
		codeInput?.focus();
	});
</script>

<svelte:head>
	<title>Authorize CLI — {companyName}</title>
	<meta
		name="description"
		content="Authorize the official Openquok command-line tool on your computer."
	/>
</svelte:head>

<div class="mt-12 flex min-h-[60vh] items-start justify-center px-4">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle>Authorize Openquok CLI</CardTitle>
			<CardDescription>
				Enter the code shown in your terminal to link this computer to your {companyName} account.
			</CardDescription>
		</CardHeader>
		<form method="POST">
			<CardContent class="space-y-4">
				{#if errorMessage}
					<p class="text-sm text-error" role="alert">{errorMessage}</p>
				{/if}
				<label class="block space-y-2" for="cli-user-code">
					<span class="text-sm font-medium text-base-content">Device code</span>
					<input
						bind:this={codeInput}
						id="cli-user-code"
						class="input input-bordered w-full font-mono text-center text-2xl tracking-widest uppercase"
						type="text"
						name="user_code"
						value={prefilledCode}
						placeholder="XXXX-XXXX"
						maxlength="9"
						autocomplete="off"
						autocapitalize="characters"
						spellcheck="false"
						required
					/>
				</label>
			</CardContent>
			<CardFooter class="flex flex-col gap-3">
				<Button type="submit" class="w-full">
					Continue
				</Button>
				<p class="text-center text-xs text-base-content/60">
					Only use codes from <code class="text-xs">openquok auth:login</code> on your machine.
					<a class="link link-primary" href="https://www.openquok.com" rel="noopener">openquok.com</a>
				</p>
			</CardFooter>
		</form>
	</Card>
</div>
