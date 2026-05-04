<script lang="ts" module>
    import { type VariantProps, tv } from "tailwind-variants";
  
    export const badgeVariants = tv({
        base: "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-base-300 px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:ring-[3px] aria-invalid:ring-error/20 aria-invalid:border-error [&>svg]:pointer-events-none [&>svg]:size-3",
        variants: {
            variant: {
            default: "bg-primary text-primary-content hover:bg-primary/90 border-transparent",
            secondary: "bg-secondary text-secondary-content hover:bg-secondary/90 border-transparent",
            warning: "bg-warning text-warning-content hover:bg-warning/90 border-transparent",
            outline: "bg-transparent text-base-content hover:bg-base-200",
            yellow: "bg-warning text-warning-content hover:bg-warning/90 border-transparent",
            blue: "bg-info text-info-content hover:bg-info/90 border-transparent",
            green: "bg-success text-success-content hover:bg-success/90 border-transparent",
            red: "bg-error text-error-content hover:bg-error/90 border-transparent",
            gray: "bg-neutral text-neutral-content hover:bg-neutral/90 border-transparent",
            purple: "bg-accent text-accent-content hover:bg-accent/90 border-transparent",
            pink: "bg-accent text-accent-content hover:bg-accent/90 border-transparent",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    });
  
    export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
  
  </script>
  
  <script lang="ts">
        import type { Snippet } from "svelte";
    
        import { cn } from "$lib/ui/helpers/common";
    
        type Props = {
            children: Snippet;
            class?: string | undefined | null;
            href?: string | undefined;
            variant: BadgeVariant;
            /** Inline `style` for the root chip (e.g. workspace tag hex from the API). */
            surfaceStyle?: string | undefined;
            /** When `href` is set, forwarded to the anchor for nav chips (e.g. topic filters). */
            ariaCurrent?: "page" | undefined;
            /** References an element `id` (e.g. a visually hidden label). */
            ariaLabelledby?: string | undefined;
            dataTestid?: string | undefined;
        };
    
        let {
            children,
            class: className = undefined,
            href = undefined,
            variant = "default",
            surfaceStyle = undefined,
            ariaCurrent = undefined,
            ariaLabelledby = undefined,
            dataTestid = undefined,
        }: Props = $props();
  </script>
  
  {#if href}
        <a
            href={href}
            data-slot="badge"
            data-testid={dataTestid}
            aria-labelledby={ariaLabelledby}
            aria-current={ariaCurrent}
            style={surfaceStyle}
            class={cn(badgeVariants({ variant }), className)}
        >
        {@render children?.()}
        </a>
  {:else}
        <span
            data-slot="badge"
            data-testid={dataTestid}
            aria-labelledby={ariaLabelledby}
            style={surfaceStyle}
            class={cn(badgeVariants({ variant }), className)}
        >
        {@render children?.()}
        </span>
  {/if}
  