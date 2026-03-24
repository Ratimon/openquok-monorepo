<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	let currentUser = $derived((data as App.LayoutData)?.currentUser ?? (page.data as App.LayoutData)?.currentUser ?? null);
	let companyNameVm = $derived((page.data as App.LayoutData)?.companyNameVm ?? (data as App.LayoutData)?.companyNameVm ?? 'Content OS');
</script>

<div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
	<h2 class="text-2xl font-bold text-base-content">
		Account dashboard</h2>
	<p class="mt-2 text-base-content/80">
		Welcome to your account. This is the default page when you are signed in.
	</p>
	{#if currentUser}
		<dl class="mt-6 grid gap-2 text-sm sm:grid-cols-2">
			<div class="contents">
				<dt class="font-medium text-base-content/70">Email</dt>
				<dd class="text-base-content">{currentUser.email}</dd>
			</div>
			<div class="contents">
				<dt class="font-medium text-base-content/70">Full name</dt>
				<dd class="text-base-content">{currentUser.fullName ?? '—'}</dd>
			</div>
			<div class="contents">
				<dt class="font-medium text-base-content/70">Username</dt>
				<dd class="text-base-content">{currentUser.username ?? '—'}</dd>
			</div>
		</dl>
	{/if}
</div>
