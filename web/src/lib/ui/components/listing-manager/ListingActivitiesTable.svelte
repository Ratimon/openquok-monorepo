<script lang="ts">
	import type { AdminListingActivityVm } from '$lib/listings/listing.types';
	import type { BadgeVariant } from '$lib/ui/badge/Badge.svelte';

	import * as Avatar from '$lib/ui/components/avatar';
	import Badge from '$lib/ui/badge/Badge.svelte';
	import { CardContent, CardFooter } from '$lib/ui/card';
	import { createPagination } from '$lib/ui/helpers/createPagination.svelte';
	import { formatPassedTime } from '$lib/ui/helpers/common';
	import { Pagination } from '$lib/ui/pagination';
	import {
		Root as Table,
		Body as TableBody,
		Cell as TableCell,
		Head as TableHead,
		Header as TableHeader,
		Row as TableRow
	} from '$lib/ui/table';
	import SupabaseUserAvatar from '$lib/ui/supabase/SupabaseUserAvatar.svelte';

	type Props = {
		activities: AdminListingActivityVm[];
		getListingHref: (activity: AdminListingActivityVm) => string;
	};

	let { activities, getListingHref }: Props = $props();

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

<div class="mt-6 w-full">
	<div class="flex w-full justify-end">
		<input
			type="text"
			class="border-input bg-transparent focus-visible:ring-ring h-9 w-60 rounded-md border border-base-300 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
			placeholder="Search by activity type…"
			bind:value={pagination.searchTerm}
		/>
	</div>

	<CardContent class="w-full px-0">
		<Table containerClass="mt-6 w-full border border-base-300 rounded-xl bg-base-100">
			<TableHeader>
				<TableRow class="text-sm">
					<TableHead>User</TableHead>
					<TableHead>Activity</TableHead>
					<TableHead class="whitespace-normal">Listing</TableHead>
					<TableHead>Date</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if currentData.length === 0}
					<TableRow>
						<TableCell colspan={4} class="py-6 text-center text-base-content/60">
							No activities found.
						</TableCell>
					</TableRow>
				{:else}
					{#each currentData as activity (activity.id)}
						<TableRow class="h-auto">
							<TableCell>
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
							</TableCell>
							<TableCell>
								<Badge variant={activityBadgeVariant(activity.activityType)}>
									{activityLabel(activity.activityType)}
								</Badge>
							</TableCell>
							<TableCell>
								{#if activity.listing}
									<a href={getListingHref(activity)} class="text-base-content/70 hover:underline">
										{activity.listing.title}
									</a>
								{:else}
									<span class="text-base-content/50">Deleted listing</span>
								{/if}
							</TableCell>
							<TableCell class="text-base-content/70">
								{formatPassedTime(activity.createdAt)}
							</TableCell>
						</TableRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
	</CardContent>

	<CardFooter class="w-full flex-col items-stretch px-0">
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
