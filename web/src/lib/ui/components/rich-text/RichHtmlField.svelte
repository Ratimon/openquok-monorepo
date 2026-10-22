<script lang="ts">
	import { ContentEditor } from '$lib/ui/editor';
	import { stripInlineImagesFromRichHtml } from '$lib/utils/stripInlineImagesFromRichHtml';

	import Button from '$lib/ui/buttons/Button.svelte';
	import { Textarea } from '$lib/ui/textarea';

	type EditorMode = 'visual' | 'html';

	type Props = {
		value: string;
		onChange: (value: string) => void;
		placeholder?: string;
		textareaId?: string;
		class?: string;
		userId?: string;
		/** Reserved for non-blog inline image storage; not wired in ContentEditor yet. */
		inlineImageBucket?: string;
		beforeInlineImageAction?: () => boolean;
		/** When false, toolbar image actions are hidden and `<img>` is stripped from HTML. */
		enableInlineImages?: boolean;
		linkPlaceholder?: string;
	};

	let {
		value,
		onChange,
		placeholder = 'Enter HTML or use Visual to insert links',
		textareaId,
		class: className = '',
		userId = '',
		inlineImageBucket: _inlineImageBucket,
		beforeInlineImageAction,
		enableInlineImages = true,
		linkPlaceholder = 'https://example.com'
	}: Props = $props();

	function emitChange(next: string) {
		onChange(enableInlineImages ? next : stripInlineImagesFromRichHtml(next));
	}

	let mode = $state<EditorMode>('visual');
	let htmlSource = $state('');
	let editorRef: ContentEditor | undefined = $state();

	function switchMode(next: EditorMode) {
		if (next === mode) return;
		if (next === 'html') {
			htmlSource = editorRef?.getCurrentContent?.() ?? value ?? '';
		}
		mode = next;
	}
</script>

<div class="flex flex-col gap-2 {className}">
	<div class="flex items-center gap-2">
		<Button
			type="button"
			variant={mode === 'visual' ? 'primary' : 'outline'}
			size="sm"
			onclick={() => switchMode('visual')}
		>
			Visual
		</Button>
		<Button
			type="button"
			variant={mode === 'html' ? 'primary' : 'outline'}
			size="sm"
			onclick={() => switchMode('html')}
		>
			HTML source
		</Button>
	</div>
	{#if mode === 'visual'}
		<ContentEditor
			bind:this={editorRef}
			content={value}
			onChange={emitChange}
			outputType="html"
			showMenu={true}
			{userId}
			{beforeInlineImageAction}
			{enableInlineImages}
			{linkPlaceholder}
			{placeholder}
			class="prose-sm min-h-24 text-sm"
		/>
	{:else}
		<Textarea
			id={textareaId}
			class="min-h-32 font-mono text-sm"
			{placeholder}
			value={htmlSource}
			oninput={(e) => {
				htmlSource = e.currentTarget.value;
				emitChange(e.currentTarget.value);
			}}
		/>
	{/if}
</div>
