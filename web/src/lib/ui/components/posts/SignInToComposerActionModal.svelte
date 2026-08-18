<script lang="ts">
	import type { GuestComposerLockAction } from '$lib/posts/constants/guestComposerLock';

	import { page } from '$app/state';

	import { GUEST_COMPOSER_LOCK_COPY } from '$lib/posts/constants/guestComposerLock';
	import { buildGuestComposerAuthHrefs } from '$lib/posts/utils/buildGuestComposerAuthHrefs';
	import { getRootPathSignin, getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route, url } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';

	type Props = {
		open?: boolean;
		action: GuestComposerLockAction;
		signInHref?: string;
		signUpHref?: string;
	};

	let {
		open = $bindable(false),
		action,
		signInHref = '',
		signUpHref = ''
	}: Props = $props();

	// /sign-in
	const rootPathSignIn = getRootPathSignin();
	const signInPath = url(route(rootPathSignIn));

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = url(route(rootPathSignUp));

	const copy = $derived(GUEST_COMPOSER_LOCK_COPY[action]);
	const derivedHrefs = $derived.by(() => {
		const pathname = page.url.pathname || '/';
		const search = page.url.search || '';
		return buildGuestComposerAuthHrefs({
			signInPath,
			signUpPath,
			currentPathAndSearch: `${pathname}${search}`
		});
	});
	const resolvedSignInHref = $derived(signInHref.trim() || derivedHrefs.signInHref);
	const resolvedSignUpHref = $derived(signUpHref.trim() || derivedHrefs.signUpHref);
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md" showCloseButton>
		<Dialog.Header>
			<Dialog.Title>
				{copy.title}
			</Dialog.Title>
			<Dialog.Description>
				{copy.description}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Dialog.Close>
				<Button type="button" variant="ghost">
					Not now
				</Button>
			</Dialog.Close>
			<Button href={resolvedSignUpHref} variant="secondary" checkCurrent={false}>
				Sign up
			</Button>
			<Button href={resolvedSignInHref} variant="primary" checkCurrent={false}>
				Sign in
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
