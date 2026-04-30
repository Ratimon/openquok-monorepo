<script lang="ts">
	import type { AdminBlogActivityVm } from '$lib/blogs/blog.types';
	import type { BadgeVariant } from '$lib/ui/badge/Badge.svelte';


	import * as Avatar from '$lib/ui/components/avatar';
	import Badge from '$lib/ui/badge/Badge.svelte';
	import { CardContent, CardFooter } from '$lib/ui/card';
	import { createPagination } from '$lib/ui/helpers/createPagination.svelte';
	import { formatPassedTime } from '$lib/ui/helpers/common';
	import { Pagination } from '$lib/ui/pagination';
	import SupabaseUserAvatar from '$lib/ui/supabase/SupabaseUserAvatar.svelte';

	type Props = {
		activities: AdminBlogActivityVm[];
		getPostHref: (activity: AdminBlogActivityVm) => string;
	};

	let { activities, getPostHref }: Props = $props();

	let pagination = $derived(
		createPagination({
			initialItemsPerPage: 25,
			initialData: activities,
			searchField: 'activityType'
		})
	);

	let {
		currentData,
		currentPage,
		totalPages,
		totalFilteredItems,
		itemsPerPage,
		paginateFrontFF,
		paginateBackFF,
		setItemsPerPage,
		setCurrentPage
	} = $derived(pagination);

	function activityBadgeVariant(type: string): BadgeVariant {
		switch (type) {
			case 'view':
				return 'secondary';
			case 'like':
				return 'default';
			case 'share':
				return 'outline';
			case 'comment':
				return 'blue';
			default:
				return 'outline';
		}
	}

	function activityLabel(type: string): string {
		switch (type) {
			case 'view':
				return 'View';
			case 'like':
				return 'Like';
			case 'share':
				return 'Share';
			case 'comment':
				return 'Comment';
			default:
				return type;
		}
	}
</script>

<div class="mt-6 grid">
	<div class="flex w-full justify-end">
		<input
			type="text"
			class="border-input bg-transparent focus-visible:ring-ring h-9 w-60 rounded-md border border-base-300 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
			placeholder="Search by activity type…"
			bind:value={pagination.searchTerm}
		/>
	</div>

	<CardContent>
		<div class="grid">
			<div class="mt-6 table w-full table-auto">
				<div class="table-header-group">
					<div class="table-row text-sm">
						<div class="table-cell h-10 whitespace-nowrap border-b-2 border-base-300 px-2 text-left align-middle font-medium">
							User
						</div>
						<div class="table-cell h-10 whitespace-nowrap border-b-2 border-base-300 px-2 text-left align-middle font-medium">
							Activity
						</div>
						<div class="table-cell h-10 border-b-2 border-base-300 px-2 text-left align-middle font-medium">
							Blog post
						</div>
						<div class="table-cell h-10 whitespace-nowrap border-b-2 border-base-300 px-2 text-left align-middle font-medium">
							Date
						</div>
					</div>
				</div>

				<div class="table-row-group">
					{#if currentData.length === 0}
						<div class="table-row">
							<div class="table-cell p-6 text-center text-base-content/60" style="grid-column: 1 / -1;">
								No activities found.
							</div>
						</div>
					{:else}
						{#each currentData as activity (activity.id)}
							<div class="table-row h-auto">
								<div class="table-cell content-center border-b-2 border-base-300 p-2 align-middle">
									<div class="flex items-center gap-2">
										<Avatar.Root class="size-8 shrink-0">
											<SupabaseUserAvatar
												url={activity.author?.avatarUrl}
												size={32}
												alt={activity.author?.fullName ?? 'User'}
												imageOnly
											/>
											<Avatar.Fallback>
												{activity.author?.fullName?.[0] ?? 'A'}
											</Avatar.Fallback>
										</Avatar.Root>
										<span class="text-sm text-base-content/70">
											{activity.author?.fullName ?? 'Anonymous'}
										</span>
									</div>
								</div>
								<div class="table-cell content-center border-b-2 border-base-300 p-2 align-middle">
									<Badge variant={activityBadgeVariant(activity.activityType)}>
										{activityLabel(activity.activityType)}
									</Badge>
								</div>
								<div class="table-cell content-center border-b-2 border-base-300 p-2 align-middle">
									{#if activity.blogPost}
										<a
											href={getPostHref(activity)}
											class="text-base-content/70 hover:underline"
										>
											{activity.blogPost.title}
										</a>
									{:else}
										<span class="text-base-content/50">Deleted post</span>
									{/if}
								</div>
								<div class="table-cell content-center border-b-2 border-base-300 p-2 align-middle text-base-content/70">
									{formatPassedTime(activity.createdAt)}
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</CardContent>

	<CardFooter>
		<Pagination
			itemsPerPage={itemsPerPage}
			totalItems={totalFilteredItems}
			currentPage={currentPage}
			totalPages={totalPages}
			setItemsPerPage={setItemsPerPage}
			setCurrentPage={setCurrentPage}
			{paginateFrontFF}
			{paginateBackFF}
			nameOfItems="activities"
			pageSizeOptions={[5, 10, 25, 50]}
		/>
	</CardFooter>
</div>
