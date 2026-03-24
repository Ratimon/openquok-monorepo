import Root from "$lib/ui/dialog/dialog.svelte";
import Portal from "$lib/ui/dialog/dialog-portal.svelte";
import Title from "$lib/ui/dialog/dialog-title.svelte";
import Footer from "$lib/ui/dialog/dialog-footer.svelte";
import Header from "$lib/ui/dialog/dialog-header.svelte";
import Overlay from "$lib/ui/dialog/dialog-overlay.svelte";
import Content from "$lib/ui/dialog/dialog-content.svelte";
import Description from "$lib/ui/dialog/dialog-description.svelte";
import Trigger from "$lib/ui/dialog/dialog-trigger.svelte";
import Close from "$lib/ui/dialog/dialog-close.svelte";

export {
	Root,
	Title,
	Portal,
	Footer,
	Header,
	Trigger,
	Overlay,
	Content,
	Description,
	Close,
	//
	Root as Dialog,
	Title as DialogTitle,
	Portal as DialogPortal,
	Footer as DialogFooter,
	Header as DialogHeader,
	Trigger as DialogTrigger,
	Overlay as DialogOverlay,
	Content as DialogContent,
	Description as DialogDescription,
	Close as DialogClose,
};
