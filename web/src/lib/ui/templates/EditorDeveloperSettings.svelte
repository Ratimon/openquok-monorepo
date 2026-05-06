<script lang="ts">
	import type { DevelopersSettingsPresenter } from '$lib/settings/DevelopersSettings.presenter.svelte';
	import type { UpsertOAuthAppsPresenter } from '$lib/developers';

	import UpdateDeveloperAccess from '$lib/ui/components/developer/UpdateDeveloperAccess.svelte';
	import UpdateDeveloperOauth from '$lib/ui/components/developer/UpdateDeveloperOauth.svelte';

	type Props = {
		developersPresenter: DevelopersSettingsPresenter;
		upsertOauthAppsPresenter: UpsertOAuthAppsPresenter;

		apiKey: string | null;
		apiKeyVisible: boolean;
		canRotate: boolean;
		rotating: boolean;

		onCopy: (text: string) => void | Promise<void>;
		developerTab?: 'access' | 'apps';
	};

	let {
		developersPresenter,
		upsertOauthAppsPresenter,
		apiKey,
		apiKeyVisible,
		canRotate,
		rotating,
		onCopy,
		developerTab = $bindable<'access' | 'apps'>('access')
	}: Props = $props();
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between gap-3">
		<div>
			<p class="text-sm text-base-content/70">Use your API Key to automate your own account.</p>
			<p class="text-sm text-base-content/70">
				If you’re building a product that schedules posts on behalf of other users, use OAuth Apps.
			</p>
		</div>

		<div class="inline-flex rounded-full bg-base-200 p-1">
			<button
				type="button"
				class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
					developerTab === 'access' ? 'bg-primary text-primary-content' : 'text-base-content/70 hover:bg-base-300/50'
				}`}
				onclick={() => (developerTab = 'access')}
			>
				Access
			</button>
			<button
				type="button"
				class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
					developerTab === 'apps' ? 'bg-primary text-primary-content' : 'text-base-content/70 hover:bg-base-300/50'
				}`}
				onclick={() => (developerTab = 'apps')}
			>
				Apps
			</button>
		</div>
	</div>

	{#if developerTab === 'access'}
		<UpdateDeveloperAccess
			presenter={developersPresenter}
			apiKey={apiKey}
			apiKeyVisible={apiKeyVisible}
			canRotate={canRotate}
			rotating={rotating}
		/>
	{:else}
		<UpdateDeveloperOauth
            presenter={upsertOauthAppsPresenter}
            onCopy={onCopy}
        />
	{/if}
</div>
