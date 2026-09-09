<script lang="ts">
	import type { ModuleConfigSchemaDrift } from '$lib/config/utils/getModuleConfigSchemaDrift';

	type Props = {
		drift: ModuleConfigSchemaDrift;
		moduleLabel: string;
		revisionConfigKey?: string;
	};

	let { drift, moduleLabel, revisionConfigKey = 'LANDING_PAGE_CONFIG_REVISION' }: Props = $props();

	const maxListedKeys = 8;

	const listedMissingKeys = $derived(drift.missingKeys.slice(0, maxListedKeys));
	const remainingMissingCount = $derived(
		Math.max(0, drift.missingKeys.length - listedMissingKeys.length)
	);
</script>

{#if drift.isOutOfSync}
	<div class="alert alert-warning mb-6 text-sm">
		<div class="min-w-0 space-y-2">
			<p class="font-medium">
				{moduleLabel} config is out of date with the repository schema
			</p>

			{#if drift.revisionMismatch && drift.codeRevision}
				<p>
					Schema revision in the database is
					<span class="font-mono">{drift.storedRevision ?? '(not set)'}</span>; the app expects
					<span class="font-mono">{drift.codeRevision}</span>. Review section copy, update
					<span class="font-mono">{revisionConfigKey}</span>, or load code
					defaults, then save.
				</p>
			{/if}

			{#if drift.missingKeys.length > 0}
				<p>
					Missing stored values for
					<span class="font-mono">{listedMissingKeys.join(', ')}</span>
					{#if remainingMissingCount > 0}
						and {remainingMissingCount} more
					{/if}
					. The public site falls back to git defaults until you save overrides here.
				</p>
			{/if}

			{#if drift.obsoleteKeys.length > 0}
				<p>
					Obsolete keys still in the database:
					<span class="font-mono">{drift.obsoleteKeys.join(', ')}</span>. Saving this form replaces
					the stored JSON with current schema fields.
				</p>
			{/if}
		</div>
	</div>
{/if}
