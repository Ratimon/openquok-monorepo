<script lang="ts">
	import type { PostsCreateFormFields } from '$lib/stack-builder/utils/postsCreatePayload';

	import {
		fieldsToPostsCreatePayload,
		postsCreatePayloadToFields
	} from '$lib/stack-builder/utils/postsCreatePayload';

	type Props = {
		payload: Record<string, unknown> | undefined;
		onChange: (payload: Record<string, unknown>) => void;
	};

	let { payload, onChange }: Props = $props();

	let fields = $state<PostsCreateFormFields>(postsCreatePayloadToFields(payload));

	$effect(() => {
		fields = postsCreatePayloadToFields(payload);
	});

	function commitFields() {
		onChange(fieldsToPostsCreatePayload(fields));
	}
</script>

<div class="space-y-3 rounded-lg border border-base-content/10 bg-base-200/20 p-3">
	<p class="text-xs text-base-content/60">
		Fills the example JSON block in Core Workflow markdown for
		<code class="text-xs">openquok posts:create --json ./post.json</code>.
	</p>

	<label class="block space-y-1">
		<span class="text-xs font-medium text-base-content/70">Scheduled at (ISO-8601)</span>
		<input
			class="input input-bordered input-sm w-full font-mono text-xs"
			type="text"
			bind:value={fields.scheduledAt}
			onchange={commitFields}
			placeholder="2026-01-01T12:00:00.000Z"
		/>
	</label>

	<label class="block space-y-1">
		<span class="text-xs font-medium text-base-content/70">Status</span>
		<select
			class="select select-bordered select-sm w-full text-xs"
			bind:value={fields.status}
			onchange={commitFields}
		>
			<option value="scheduled">scheduled</option>
			<option value="draft">draft</option>
		</select>
	</label>

	<label class="block space-y-1">
		<span class="text-xs font-medium text-base-content/70">Caption / body</span>
		<textarea
			class="textarea textarea-bordered w-full text-sm"
			rows="2"
			bind:value={fields.body}
			oninput={commitFields}
			placeholder="Post caption shown on the channel"
		></textarea>
	</label>

	<label class="block space-y-1">
		<span class="text-xs font-medium text-base-content/70">Integration id</span>
		<input
			class="input input-bordered input-sm w-full font-mono text-xs"
			type="text"
			bind:value={fields.integrationId}
			onchange={commitFields}
			placeholder="<integration-id>"
		/>
	</label>

	<details class="text-xs">
		<summary class="cursor-pointer text-base-content/60">Preview JSON</summary>
		<pre class="mt-2 overflow-x-auto rounded bg-base-300/40 p-2 font-mono text-[11px]">{JSON.stringify(
				fieldsToPostsCreatePayload(fields),
				null,
				2
			)}</pre>
	</details>
</div>
