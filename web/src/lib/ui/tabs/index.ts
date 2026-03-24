/**
 * Tabs component – ported from shadcn-svelte, using DaisyUI tab semantics.
 * @see https://github.com/huntabyte/shadcn-svelte/tree/3beb894ba6bbc13c4c777c3cd8a8c6e5b4657b7d/docs/src/lib/registry/ui/tabs
 */
import Root from "$lib/ui/tabs/tabs.svelte";
import List from "$lib/ui/tabs/tabs-list.svelte";
import Trigger from "$lib/ui/tabs/tabs-trigger.svelte";
import Content from "$lib/ui/tabs/tabs-content.svelte";

export {
	Root,
	List,
	Trigger,
	Content,
	//
	Root as Tabs,
	List as TabsList,
	Trigger as TabsTrigger,
	Content as TabsContent
};

