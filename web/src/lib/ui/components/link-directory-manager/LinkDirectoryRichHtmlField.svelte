<script lang="ts">
	import ContentEditor from '$lib/ui/editor/ContentEditor.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { Textarea } from '$lib/ui/textarea';

	type Props = {
		id?: string;
		label: string;
		value?: string;
		onValueChange?: (value: string) => void;
		rows?: number;
		placeholder?: string;
		/** When set with `visualEditor`, enables Visual + HTML source tabs (blog-style). */
		userId?: string;
		visualEditor?: boolean;
		class?: string;
	};

	let {
		id,
		label,
		value = $bindable(''),
		rows = 5,
		placeholder = '<p>Paragraph with optional <a href="https://example.com">links</a>.</p>',
		userId,
		visualEditor = false,
		onValueChange,
		class: className = ''
	}: Props = $props();

	let editorMode = $state<'visual' | 'html'>('html');
	let htmlSource = $state('');

	$effect(() => {
		if (editorMode === 'html') {
			htmlSource = value;
		}
	});

	function switchEditorMode(next: 'visual' | 'html') {
		if (next === editorMode) return;
		if (next === 'html') {
			htmlSource = value;
		}
		editorMode = next;
	}
</script>

<div class={className}>
	<span class="label-text text-sm">{label}</span>
	<p class="label-text-alt mt-0.5 text-base-content/60">
		{#if visualEditor && userId}
			HTML — switch between Visual and HTML source. Plain text is wrapped in paragraphs on the public guide.
		{:else}
			HTML source. Plain text is wrapped in paragraphs on the public guide.
		{/if}
		External links render with <code class="text-xs">nofollow</code> per site policy; only
		<code class="text-xs">*.openquok.com</code> stays followable.
	</p>

	{#if visualEditor && userId}
		<div class="mb-2 flex gap-2">
			<Button
				type="button"
				variant={editorMode === 'visual' ? 'primary' : 'outline'}
				size="sm"
				onclick={() => switchEditorMode('visual')}
			>
				Visual
			</Button>
			<Button
				type="button"
				variant={editorMode === 'html' ? 'primary' : 'outline'}
				size="sm"
				onclick={() => switchEditorMode('html')}
			>
				HTML source
			</Button>
		</div>
	{/if}

	{#if visualEditor && userId && editorMode === 'visual'}
		<ContentEditor
			content={value}
			onChange={(next) => {
				value = next;
				onValueChange?.(next);
			}}
			outputType="html"
			showMenu={true}
			{userId}
			placeholder="Enter HTML content"
			class="prose-sm min-h-48 font-mono text-sm"
		/>
	{:else}
		<Textarea
			{id}
			class="min-h-24 font-mono text-sm"
			{rows}
			{placeholder}
			value={value}
			oninput={(e) => {
				const next = e.currentTarget.value;
				value = next;
				onValueChange?.(next);
			}}
		/>
	{/if}
</div>
