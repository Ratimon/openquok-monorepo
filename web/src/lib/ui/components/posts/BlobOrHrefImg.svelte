<script lang="ts">
	import { resolveMediaPreviewUrl, isAuthenticatedMediaDownloadHref } from '$lib/posts/utils/mediaPreview';

	type Props = {
		href: string;
		class?: string;
		alt?: string;
		draggable?: boolean;
		loading?: 'lazy' | 'eager' | undefined;
	};

	let { href, class: className = '', alt = '', draggable = false, loading = 'lazy' }: Props = $props();

	let src = $state('');

	$effect(() => {
		const h = href;
		let blobUrlToRevoke: string | null = null;
		let cancelled = false;

		if (!isAuthenticatedMediaDownloadHref(h)) {
			src = h;
			return () => {
				cancelled = true;
			};
		}

		src = '';
		void resolveMediaPreviewUrl(h).then((u) => {
			if (cancelled) {
				if (u.startsWith('blob:')) URL.revokeObjectURL(u);
				return;
			}
			if (blobUrlToRevoke && blobUrlToRevoke !== u && blobUrlToRevoke.startsWith('blob:')) {
				URL.revokeObjectURL(blobUrlToRevoke);
			}
			src = u;
			if (u.startsWith('blob:')) blobUrlToRevoke = u;
		});

		return () => {
			cancelled = true;
			if (blobUrlToRevoke?.startsWith('blob:')) URL.revokeObjectURL(blobUrlToRevoke);
		};
	});
</script>

{#if src}
	<img {src} class={className} {alt} {draggable} {loading} />
{/if}
