import Root from "$lib/ui/sheet/sheet.svelte";
import Portal from "$lib/ui/sheet/sheet-portal.svelte";
import Trigger from "$lib/ui/sheet/sheet-trigger.svelte";
import Close from "$lib/ui/sheet/sheet-close.svelte";
import Overlay from "$lib/ui/sheet/sheet-overlay.svelte";
import Content from "$lib/ui/sheet/sheet-content.svelte";
import Header from "$lib/ui/sheet/sheet-header.svelte";
import Footer from "$lib/ui/sheet/sheet-footer.svelte";
import Title from "$lib/ui/sheet/sheet-title.svelte";
import Description from "$lib/ui/sheet/sheet-description.svelte";

export {
	Root,
	Close,
	Trigger,
	Portal,
	Overlay,
	Content,
	Header,
	Footer,
	Title,
	Description,
	//
	Root as Sheet,
	Close as SheetClose,
	Trigger as SheetTrigger,
	Portal as SheetPortal,
	Overlay as SheetOverlay,
	Content as SheetContent,
	Header as SheetHeader,
	Footer as SheetFooter,
	Title as SheetTitle,
	Description as SheetDescription,
};
