<script lang="ts">
	import type { Link } from '$lib/ui/nav-bars/Link';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { toast } from '$lib/ui/sonner';
	import { signoutPresenter } from '$lib/user-auth/index';
	import { SignoutStatus } from '$lib/user-auth/Signout.presenter.svelte';
	import { getRootPathSignin, getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import { route, url } from '$lib/utils/path';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import Background from '$lib/ui/background/Background.svelte';
	import PublicNavbar from '$lib/ui/nav-bars/PublicNavbar.svelte';
	import PageLink from '$lib/ui/nav-bars/PageLink.svelte';

	// /sign-in
	const rootPathSignIn = getRootPathSignin();
	const signInPath = route(rootPathSignIn);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountPath = url(rootPathAccount);

	interface Props {
		navbarDesktopLinks: Link[];
		navbarMobileLinks: Link[];
		companyNameVm: string;
		isLoggedIn: boolean;
		/** When false, Account is shown disabled (e.g. email not verified yet). */
		accountNavEnabled?: boolean;
		class?: string;
	}

	let {
		navbarDesktopLinks,
		navbarMobileLinks,
		companyNameVm,
		isLoggedIn,
		accountNavEnabled = true,
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

	let signInHref = $derived.by(() => {
		const pathname = page.url.pathname || '/';
		const search = page.url.search || '';
		let redirectTarget: string;
		if (pathname === signInPath || pathname === signUpPath) {
			const params = new URLSearchParams(search);
			const existing = params.get('redirectURL');
			if (existing) {
				try {
					const decoded = decodeURIComponent(existing);
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
		return pathname !== signInPath
			? `${signInPath}?redirectURL=${encodeURIComponent(redirectTarget)}`
			: signInPath;
	});

	const authPillClass =
		'inline-flex min-h-11 items-center justify-center gap-1 rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base-100';
</script>

<Background color={className}>
	<header class="relative z-50">
		<nav
			class="relative z-50 flex items-center gap-4 px-4 py-4 mx-4 lg:gap-6"
			aria-label="Global"
		>
			<div class="relative z-10 flex shrink-0">
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

			<!-- Center: public nav tabs only (docs, blog, …) -->
			<div
				class="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
			>
				<div class="pointer-events-auto flex justify-center">
					<PublicNavbar
						pages={navbarDesktopLinks}
						tabClass="tab tab-lg tab-lifted flex-1 text-lg font-bold"
						whenSelected="account-link"
						whenUnselected="account-link"
					/>
				</div>
			</div>

			<div class="relative z-10 ml-auto flex items-center gap-2">
				{#if isLoggedIn}
					<div class="hidden items-center gap-2 lg:flex">
						{#if accountNavEnabled}
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
						{:else}
							<button
								type="button"
								disabled
								class="flex flex-col items-center gap-1 tab tab-lg tab-lifted account-link cursor-not-allowed opacity-50"
								title="Verify your email to access your account"
								aria-label="Account (verify your email first)"
							>
								<AbstractIcon name={icons.Account.name} width="30" height="30" focusable="false" />
								Account
							</button>
						{/if}
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
					<div class="hidden items-center gap-3 lg:flex">
						<a
							href={signInHref}
							data-sveltekit-preload-data="off"
							class="{authPillClass} auth-navbar-login border border-base-content/35 bg-transparent text-base-content hover:border-accent hover:text-accent"
						>
							Log in
						</a>
						<a
							href={signUpPath}
							data-sveltekit-preload-data="off"
							class="{authPillClass} bg-primary text-primary-content hover:bg-primary/90"
						>
							Start for $0
							<AbstractIcon name={icons.ChevronRight.name} class="size-4 shrink-0" width="16" height="16" />
						</a>
					</div>
				{/if}

				<!-- Burger (mobile) -->
				<div class="relative z-[100] flex lg:hidden">
					<Button
						variant="ghost"
						size="icon"
						preload="off"
						popovertarget="header-mobile-menu"
						popovertargetaction="toggle"
						class="-m-2.5 min-h-[44px] min-w-[44px] touch-manipulation p-2.5 text-base-content"
						aria-label={isOpen ? 'Close main menu' : 'Open main menu'}
						aria-expanded={isOpen}
					>
						{#if isOpen}
							<AbstractIcon name={icons.X2.name} width="24" height="24" focusable="false" />
						{:else}
							<AbstractIcon name={icons.MenuLine.name} width="24" height="24" focusable="false" />
						{/if}
					</Button>
				</div>
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
							{#if accountNavEnabled}
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
							{:else}
								<button
									type="button"
									disabled
									class="flex flex-col items-center gap-1 tab tab-lg tab-lifted account-link cursor-not-allowed opacity-50"
									title="Verify your email to access your account"
									aria-label="Account (verify your email first)"
								>
									<AbstractIcon name={icons.Account.name} width="30" height="30" focusable="false" />
									Account
								</button>
							{/if}
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
						<div class="flex w-full max-w-sm flex-col gap-3 self-center px-2">
							<a
								href={signInHref}
								data-sveltekit-preload-data="off"
								onclick={() => setClose()}
								class="{authPillClass} auth-navbar-login w-full border border-base-content/35 bg-transparent text-center text-base-content hover:border-accent hover:text-accent"
							>
								Log in
							</a>
							<a
								href={signUpPath}
								data-sveltekit-preload-data="off"
								onclick={() => setClose()}
								class="{authPillClass} w-full justify-center bg-primary text-primary-content hover:bg-primary/90"
							>
								Start for $0
								<AbstractIcon
									name={icons.ChevronRight.name}
									class="size-4 shrink-0"
									width="16"
									height="16"
								/>
							</a>
						</div>
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
