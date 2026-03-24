// https://github.com/huntabyte/shadcn-svelte/tree/3beb894ba6bbc13c4c777c3cd8a8c6e5b4657b7d/docs/src/lib/registry/ui/tooltip
import Root from '$lib/ui/tooltip/tooltip.svelte';
import Trigger from '$lib/ui/tooltip/tooltip-trigger.svelte';
import Content from '$lib/ui/tooltip/tooltip-content.svelte';
import Provider from '$lib/ui/tooltip/tooltip-provider.svelte';
import Portal from '$lib/ui/tooltip/tooltip-portal.svelte';

export {
	Root,
	Trigger,
	Content,
	Provider,
	Portal,
	//
	Root as Tooltip,
	Content as TooltipContent,
	Trigger as TooltipTrigger,
	Provider as TooltipProvider,
	Portal as TooltipPortal
};
