// https://github.com/huntabyte/shadcn-svelte/tree/3beb894ba6bbc13c4c777c3cd8a8c6e5b4657b7d/docs/src/lib/registry/ui/avatar
import Root from "$lib/ui/components/avatar/avatar.svelte";
import Image from "$lib/ui/components/avatar/avatar-image.svelte";
import Fallback from "$lib/ui/components/avatar/avatar-fallback.svelte";

export {
	Root,
	Image,
	Fallback,
	//
	Root as Avatar,
	Image as AvatarImage,
	Fallback as AvatarFallback
};
