<script lang="ts">
	import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
	import * as Breadcrumb from '$lib/ui/breadcrumb';
	import { cn } from '$lib/ui/helpers/common';
	import { url } from '$lib/utils/path';

	type Props = {
		pageTitle: string;
		class?: string;
	};

	let { pageTitle, class: className = '' }: Props = $props();

	// /blog
	const rootPathPublicBlog = getRootPathPublicBlog();
	const blogHubHref = url(`/${rootPathPublicBlog}`);
</script>

<Breadcrumb.Root class={cn('max-w-full', className)}>
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link
				href={blogHubHref}
				class="text-primary hover:text-primary/80 text-sm font-bold uppercase tracking-wider no-underline"
			>
				Blog
			</Breadcrumb.Link>
		</Breadcrumb.Item>
		<Breadcrumb.Separator class="text-primary/60" />
		<Breadcrumb.Item>
			<Breadcrumb.Page class="text-primary line-clamp-1 text-sm">{pageTitle}</Breadcrumb.Page>
		</Breadcrumb.Item>
	</Breadcrumb.List>
</Breadcrumb.Root>
