<script lang="ts">
	import type { Link } from '$lib/ui/nav-bars/Link';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import toast from 'svelte-hot-french-toast';
	import { signoutPresenter } from '$lib/user-auth/index';
	import { SignoutStatus } from '$lib/user-auth/Signout.presenter.svelte';
	import { getRootPathSignin, getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import { url } from '$lib/utils/path';
	import { icons } from '$data/icon';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Background from '$lib/ui/background/Background.svelte';
	import PublicNavbar from '$lib/ui/nav-bars/PublicNavbar.svelte';
	import PageLink from '$lib/ui/nav-bars/PageLink.svelte';

	const signInPath = `/${getRootPathSignin()}`;
	const signUpPath = `/${getRootPathSignup()}`;
	const accountPath = url(getRootPathAccount());

	type Props = {
		navbarDesktopLinks: Link[];
		navbarMobileLinks: Link[];
		companyNameVm: string;
		isLoggedIn: boolean;
		class?: string;
	};

	let {
		navbarDesktopLinks,
		navbarMobileLinks,
		companyNameVm,
		isLoggedIn,
		class: className = 'bg-base-100'
	}: Props = $props();

	let isOpen = $state(false);

	/** Popover element for mobile menu (native Popover API). */
	let mobileMenuPopoverEl: HTMLDivElement | undefined = $state(undefined);

	function setClose() {
		isOpen = false;
		mobileMenuPopoverEl?.hidePopover?.();
	}

	function onPopoverToggle(e: ToggleEvent) {
		isOpen = e.newState === 'open';
	}

	async function onSignout() {
		try {
			await signoutPresenter.signout();
			const status = signoutPresenter.status;
			const isSignedOut = status === SignoutStatus.SUCCESS;
			const showToastMessage = signoutPresenter.showToastMessage;
			if (isSignedOut && showToastMessage) {
				toast.success(signoutPresenter.toastMessage);
			}
			if (!isSignedOut && showToastMessage) {
				toast.error(signoutPresenter.toastMessage);
			}
		} catch (error) {
			console.error('Error signing out:', error);
			toast.error('An error occurred while signing out. Please try again later.');
		} finally {
			signoutPresenter.showToastMessage = false;
			await invalidateAll();
			setClose();
		}
	}

	let navbarAuthLinks: Link[] = $derived.by(() => {
		const pathname = page.url.pathname || '/';
		const search = page.url.search || '';
		// Build a single redirect target (no nested redirectURL) to avoid chains like ...?redirectURL=%2Fsign-in%3FredirectURL%3D...
		let redirectTarget: string;
		if (pathname === signInPath || pathname === signUpPath) {
			const params = new URLSearchParams(search);
			const existing = params.get('redirectURL');
			if (existing) {
				try {
					const decoded = decodeURIComponent(existing);
					// If the existing redirect itself contains redirectURL, break the chain by sending home
					redirectTarget = decoded.includes('redirectURL=') ? '/' : decoded;
				} catch {
					redirectTarget = '/';
				}
			} else {
				redirectTarget = '/';
			}
		} else {
			const params = new URLSearchParams(search);
			params.delete('redirectURL');
			const qs = params.toString();
			redirectTarget = pathname + (qs ? `?${qs}` : '');
		}
		if (!redirectTarget.startsWith('/')) redirectTarget = '/' + redirectTarget;
		const signInHref =
			pathname !== signInPath
				? `${signInPath}?redirectURL=${encodeURIComponent(redirectTarget)}`
				: signInPath;
		return [
			{ pathname: signInHref, title: 'Login', navType: 'tab', preload: 'off' },
			{ pathname: signUpPath, title: 'Signup', navType: 'tab', preload: 'off' }
		];
	});
</script>

<Background color={className}>
	<header class="relative z-50">
		<nav class="flex items-center justify-between gap-4 lg:gap-6 px-4 py-4 mx-4" aria-label="Global">
			<div class="flex lg:flex shrink-0">
				<a
					class="flex items-center gap-2 shrink-0"
					href="/"
					title="{companyNameVm} homepage"
				>
					<img
						class="w-14"
						alt={companyNameVm}
						src={url('/pwa/favicon.svg')}
						width={32}
						height={32}
					/>
					<span class="font-extrabold text-lg text-base-content">
						{companyNameVm}
					</span>
				</a>
			</div>

			<div class="hidden lg:flex lg:justify-center lg:gap-8 lg:items-center">
				<PublicNavbar
					pages={navbarDesktopLinks}
					tabClass="tab tab-lg tab-lifted flex-1 text-lg font-bold"
					whenSelected="account-link"
					whenUnselected="account-link"
				/>

				{#if isLoggedIn}
					<div class="flex items-center gap-2">
						<PageLink
							href={accountPath}
							useGoto
							onAfterNavigate={setClose}
							class="flex flex-col items-center gap-1 tab tab-lg tab-lifted account-link"
							whenSelected="account-link tab-active"
							whenUnselected="account-link"
						>
							<AbstractIcon name={icons.Account.name} width="30" height="30" focusable="false" />
							Account
						</PageLink>
						<button
							type="button"
							onclick={onSignout}
							class="tab tab-lg tab-lifted flex-1 text-base whitespace-nowrap account-link flex flex-col items-center gap-1"
						>
							<AbstractIcon name={icons.LogOut.name} width="24" height="24" focusable="false" />
							Sign Out
						</button>
					</div>
				{:else}
					<PublicNavbar
						pages={navbarAuthLinks}
						class="text-primary-content flex-nowrap"
						tabClass="tab tab-lg tab-lifted flex-1 text-lg font-bold whitespace-nowrap"
						whenSelected="tab-active font-white !bg-primary hover:text-white"
						whenUnselected="hover:text-base-content/70"
					/>
				{/if}
			</div>

			<!-- Right spacer (for theme toggle etc.) -->
			<div class="items-center lg:flex lg:justify-end lg:flex-nowrap hidden lg:block lg:w-24">
				<!-- Optional: ThemeSwitcher or other right-side actions -->
			</div>

			<!-- Burger button (mobile): native popover toggle so open works without relying on our click handler -->
			<div class="flex lg:hidden ml-4 relative z-[100]">
				<button
					type="button"
					popovertarget="header-mobile-menu"
					popovertargetaction="toggle"
					class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-base-content touch-manipulation cursor-pointer min-w-[44px] min-h-[44px]"
					aria-label={isOpen ? 'Close main menu' : 'Open main menu'}
					aria-expanded={isOpen}
				>
					{#if isOpen}
						<AbstractIcon name={icons.X2.name} width="24" height="24" focusable="false" />
					{:else}
						<AbstractIcon name={icons.MenuLine.name} width="24" height="24" focusable="false" />
					{/if}
				</button>
			</div>
		</nav>

		<!-- Mobile menu: native popover (browser handles open/close; no JS click needed to open) -->
		<div
			id="header-mobile-menu"
			popover="auto"
			class="fixed inset-0 z-50 border-none bg-transparent p-0"
			style="max-width: none; max-height: none;"
			ontoggle={onPopoverToggle}
			bind:this={mobileMenuPopoverEl}
		>
			<button
				type="button"
				popovertarget="header-mobile-menu"
				popovertargetaction="hide"
				class="fixed inset-0 z-40 bg-base-content/20 cursor-default"
				aria-label="Close menu"
			></button>
			<div class="fixed inset-y-0 right-0 z-50 w-full px-8 py-4 overflow-y-auto bg-base-100 sm:max-w-sm sm:ring-1 sm:ring-base-content/10" role="dialog" aria-modal="true" aria-label="Main menu">
				<div class="flex items-center justify-between">
					<img
						class="w-8"
						alt={companyNameVm}
						src={url('/pwa/favicon.svg')}
						width="32"
						height="32"
					/>
					<span class="font-extrabold text-lg text-base-content">{companyNameVm}</span>
					<button
						type="button"
						popovertarget="header-mobile-menu"
						popovertargetaction="hide"
						class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-base-content min-w-[44px] min-h-[44px]"
						aria-label="Close menu"
					>
						<AbstractIcon name={icons.X2.name} width="24" height="24" focusable="false" />
					</button>
				</div>

				<div class="flow-root mt-6">
					<div class="py-4">
						<PublicNavbar
							pages={navbarMobileLinks}
							class="flex flex-col gap-y-4 items-center"
							tabClass="tab tab-lg tab-lifted flex-1 text-lg font-bold account-link"
							whenSelected="account-link"
							whenUnselected="account-link"
						/>
					</div>

					<div class="divider"></div>

					{#if isLoggedIn}
						<div class="flex flex-col gap-y-4 justify-center items-center">
							<PageLink
								href={accountPath}
								useGoto
								onAfterNavigate={setClose}
								class="flex flex-col items-center gap-1 tab tab-lg tab-lifted account-link"
								whenSelected="account-link tab-active"
								whenUnselected="account-link"
							>
								<AbstractIcon name={icons.Account.name} width="30" height="30" focusable="false" />
								Account
							</PageLink>
							<button
								type="button"
								onclick={onSignout}
								class="tab tab-lg tab-lifted flex-1 text-base account-link flex flex-col items-center gap-1"
							>
								<AbstractIcon name={icons.LogOut.name} width="24" height="24" focusable="false" />
								Sign Out
							</button>
						</div>
					{:else}
						<PublicNavbar
							pages={navbarAuthLinks}
							class="flex flex-col gap-y-4 items-center text-primary-content"
							tabClass="tab tab-lg tab-lifted flex-1 text-lg font-bold"
							whenSelected="tab-active font-white !bg-primary hover:text-white"
							whenUnselected="hover:text-base-content/70"
						/>
					{/if}
				</div>
			</div>
		</div>
	</header>
</Background>

<style>
	/* Use theme semantic colors so account links match daisyui themes */
	:global(a.account-link),
	:global(.account-link),
	:global(a.tab.account-link),
	:global(.tab.account-link) {
		color: var(--color-primary) !important;
		font-weight: 700 !important;
	}

	:global(a.account-link:hover),
	:global(.account-link:hover),
	:global(a.tab.account-link:hover),
	:global(.tab.account-link:hover) {
		color: var(--color-accent) !important;
	}
</style>
