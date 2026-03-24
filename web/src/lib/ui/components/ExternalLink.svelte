<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLAnchorAttributes } from 'svelte/elements';

    type Props = HTMLAnchorAttributes & {
        /** The URL that the link points to */
        href: string
        /**
         * Whether the link points to a trusted source. This affects the rel attribute
         * by omitting 'noopener noreferrer' for trusted sources to facilitate browser optimizations
         * for linking to trusted domains.
         */
        trusted?: boolean
        /**
         * Determines if the link should pass link equity for SEO purposes. When false,
         * 'nofollow' is added to the rel attribute to inform search engines not to pass link equity
         * to the target URL.
         */
        follow?: boolean
        /**
         * Accessible label describing the link's destination and purpose
         */
        ariaLabel?: string

        children: Snippet;
    };

    
    let {
        href,
        trusted = false, // Defaults to false, considering all external links untrusted for security.
        follow = false, // Defaults to false to prevent SEO link equity passing by default.
        ariaLabel,

        children,
        class: className,
        ...rest
    } : Props = $props()

    // Computed rel attribute based on trusted and follow props
    const rel = $derived(() => {
        const relValues: string[] = []
        
        // Adds 'noopener noreferrer' to the 'rel' attribute for untrusted links to enhance security.
        if (!trusted) relValues.push("noopener", "noreferrer")
        // Adds 'nofollow' to the 'rel' attribute to prevent SEO link equity passing if specified.
        if (!follow) relValues.push("nofollow")
        
        // Joins the relValues array into a string for the 'rel' attribute, or undefined if empty.
        return relValues.length > 0 ? relValues.join(" ") : undefined
    })
</script>

<a
    {href}
    class={className}
    rel={rel()}
    target="_blank"
    aria-label={ariaLabel}
    {...rest}
>
    {@render children?.()}
</a>