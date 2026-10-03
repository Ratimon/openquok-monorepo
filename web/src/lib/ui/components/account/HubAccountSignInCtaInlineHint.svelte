<script lang="ts">
	import type { HubAccountSignInCtaVariant } from '$lib/ui/components/account/hubAccountSignInCta.types';

	import { page } from '$app/state';

	import { buildGuestComposerAuthHrefs } from '$lib/posts/utils/buildGuestComposerAuthHrefs';
	import { getRootPathSignin, getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route, url } from '$lib/utils/path';
	import { resolveHubAccountSignInCtaCopy } from '$lib/ui/components/account/utils/resolveHubAccountSignInCtaCopy';

	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		variant: HubAccountSignInCtaVariant;
		isLoggedIn: boolean;
		class?: string;
	};

	let { variant, isLoggedIn, class: className = '' }: Props = $props();

	// /sign-in
	const rootPathSignIn = getRootPathSignin();
	const signInPath = url(route(rootPathSignIn));

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = url(route(rootPathSignUp));

	const copy = $derived(resolveHubAccountSignInCtaCopy(variant));
	const signInHref = $derived.by(() => {
		const pathname = page.url.pathname || '/';
		const search = page.url.search || '';
		return buildGuestComposerAuthHrefs({
			signInPath,
			signUpPath,
			currentPathAndSearch: `${pathname}${search}`
		}).signInHref;
	});
</script>

{#if !isLoggedIn}
	<div
		class={[
			'rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-base-content/80',
			className
		]}
		role="note"
	>
		<p>{copy.inlineHint}</p>
		<div class="mt-2 flex flex-wrap gap-2">
			<Button href={signInHref} variant="primary" size="sm" checkCurrent={false}>Sign in</Button>
		</div>
	</div>
{/if}
