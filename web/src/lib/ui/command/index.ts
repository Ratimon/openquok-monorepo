import Root from "$lib/ui/command/command.svelte";
import Loading from "$lib/ui/command/command-loading.svelte";
import Dialog from "$lib/ui/command/command-dialog.svelte";
import Empty from "$lib/ui/command/command-empty.svelte";
import Group from "$lib/ui/command/command-group.svelte";
import Item from "$lib/ui/command/command-item.svelte";
import Input from "$lib/ui/command/command-input.svelte";
import List from "$lib/ui/command/command-list.svelte";
import Separator from "$lib/ui/command/command-separator.svelte";
import Shortcut from "$lib/ui/command/command-shortcut.svelte";
import LinkItem from "$lib/ui/command/command-link-item.svelte";

export {
	Root,
	Dialog,
	Empty,
	Group,
	Item,
	LinkItem,
	Input,
	List,
	Separator,
	Shortcut,
	Loading,
	//
	Root as Command,
	Dialog as CommandDialog,
	Empty as CommandEmpty,
	Group as CommandGroup,
	Item as CommandItem,
	LinkItem as CommandLinkItem,
	Input as CommandInput,
	List as CommandList,
	Separator as CommandSeparator,
	Shortcut as CommandShortcut,
	Loading as CommandLoading,
};
