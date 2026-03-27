<script lang="ts">
    import { cn } from "$lib/ui/helpers/common";

    interface Props {
        class?: string;
        showRadialGradient?: boolean;
        children?: import('svelte').Snippet;
        [key: string]: any
    }
    // This Code won't run in playground but will run in project as
    // this playground dosen't include tailwind css, config..
      
    let { class: _class = "", showRadialGradient = true, children, ...rest }: Props = $props();
</script>
  
<div
    class={cn(
      "relative flex flex-col h-[100vh] items-center justify-center bg-base-100 text-base-content transition-bg",
      _class
    )}
    {...rest}
>
    <div class="absolute inset-0 overflow-hidden">
      <div
        class={cn(
            `
        [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
        [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
        [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
        [background-image:var(--white-gradient),var(--aurora)]
        dark:[background-image:var(--dark-gradient),var(--aurora)]
        [background-size:300%,_200%]
        [background-position:50%_50%,50%_50%]
        filter blur-[10px] invert dark:invert-0
        after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)]
        after:dark:[background-image:var(--dark-gradient),var(--aurora)]
        after:[background-size:200%,_100%]
        after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
        pointer-events-none
        absolute -inset-[10px] opacity-50 will-change-transform`,
    
            showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
      ></div>
       <div
			class="pointer-events-none absolute inset-x-0 -top-24 z-[1] mx-auto h-72 w-[min(72rem,95vw)] rounded-full bg-gradient-to-b from-primary/20 via-secondary/10 to-transparent blur-3xl"
		></div>
    </div>
    {@render children?.()}
</div>