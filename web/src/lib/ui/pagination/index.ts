/**
 * Pagination – adapted from shadcn-svelte
 * @see https://github.com/huntabyte/shadcn-svelte/tree/main/docs/src/lib/registry/ui/pagination
 */
import Root from './pagination.svelte';
import Content from './pagination-content.svelte';
import Item from './pagination-item.svelte';
import Link from './pagination-link.svelte';
import Previous from './pagination-previous.svelte';
import Next from './pagination-next.svelte';
import Ellipsis from './pagination-ellipsis.svelte';
import Composite from './pagination-composite.svelte';

export {
	Root,
	Content,
	Item,
	Link,
	Previous,
	Next,
	Ellipsis,
	Composite,
	//
	Root as PaginationRoot,
	Content as PaginationContent,
	Item as PaginationItem,
	Link as PaginationLink,
	Previous as PaginationPrevious,
	Next as PaginationNext,
	Ellipsis as PaginationEllipsis,
	Composite as Pagination
};
