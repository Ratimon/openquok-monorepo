
// https://shadcn-svelte.com/docs/components/popover
import Root from "$lib/ui/popover/popover.svelte";
import Close from "$lib/ui/popover/popover-close.svelte";
import Content from "$lib/ui/popover/popover-content.svelte";
import Trigger from "$lib/ui/popover/popover-trigger.svelte";
import Portal from "$lib/ui/popover/popover-portal.svelte";

export {
	Root,
	Content,
	Trigger,
	Close,
	Portal,
	//
	Root as Popover,
	Content as PopoverContent,
	Trigger as PopoverTrigger,
	Close as PopoverClose,
	Portal as PopoverPortal,
};
