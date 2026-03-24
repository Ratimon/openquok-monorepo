/**
 * Breadcrumb component – ported from shadcn-svelte, using DaisyUI `breadcrumbs` semantics.
 * @see https://github.com/huntabyte/shadcn-svelte/tree/3beb894ba6bbc13c4c777c3cd8a8c6e5b4657b7d/docs/src/lib/registry/ui/breadcrumb
 */
import Root from "$lib/ui/breadcrumb/breadcrumb.svelte";
import Ellipsis from "$lib/ui/breadcrumb/breadcrumb-ellipsis.svelte";
import Item from "$lib/ui/breadcrumb/breadcrumb-item.svelte";
import Separator from "$lib/ui/breadcrumb/breadcrumb-separator.svelte";
import Link from "$lib/ui/breadcrumb/breadcrumb-link.svelte";
import List from "$lib/ui/breadcrumb/breadcrumb-list.svelte";
import Page from "$lib/ui/breadcrumb/breadcrumb-page.svelte";

export {
	Root,
	Ellipsis,
	Item,
	Separator,
	Link,
	List,
	Page,
	//
	Root as Breadcrumb,
	Ellipsis as BreadcrumbEllipsis,
	Item as BreadcrumbItem,
	Separator as BreadcrumbSeparator,
	Link as BreadcrumbLink,
	List as BreadcrumbList,
	Page as BreadcrumbPage
};
