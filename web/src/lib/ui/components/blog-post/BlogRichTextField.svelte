<script lang="ts">
	import RichHtmlField from '$lib/ui/components/rich-text/RichHtmlField.svelte';

	type Props = {
		value: string;
		onChange: (value: string) => void;
		placeholder?: string;
		textareaId?: string;
		class?: string;
		userId?: string;
		beforeInlineImageAction?: () => boolean;
	};

	let {
		value,
		onChange,
		placeholder = 'Enter HTML or use Visual to insert links',
		textareaId,
		class: className = '',
		userId = '',
		beforeInlineImageAction
	}: Props = $props();
</script>

<RichHtmlField
	{value}
	{onChange}
	{placeholder}
	{textareaId}
	class={className}
	{userId}
	{beforeInlineImageAction}
/>
