<script lang="ts">
  import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";

  import { cn, type WithElementRef } from "$lib/ui/helpers/common";

  type InputType = Exclude<HTMLInputTypeAttribute, "file">;

  type Props = WithElementRef<
        Omit<HTMLInputAttributes, "type"> &
        ({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined })
  >;

  let {
        ref = $bindable(null),
        value = $bindable(),
        type,
        files = $bindable(),
        class: className,
        "data-slot": dataSlot = "input",
        ...restProps
  }: Props = $props();
</script>

{#if type === "file"}
  <input
        bind:this={ref}
        data-slot={dataSlot}
        class={cn(
        "selection:bg-primary selection:text-primary-content border-base-300 ring-offset-base-100 placeholder:text-base-content/50 flex h-9 w-full min-w-0 rounded-md border bg-base-100 px-3 pt-1.5 text-sm font-medium text-base-content shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-error/30 aria-invalid:border-error",
        className
        )}
        type="file"
        bind:files
        bind:value
        {...restProps}
  />
{:else}
    <input
        bind:this={ref}
        data-slot={dataSlot}
        class={cn(
        "border-base-300 bg-base-100 selection:bg-primary selection:text-primary-content ring-offset-base-100 placeholder:text-base-content/50 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base text-base-content shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-error/30 aria-invalid:border-error",
        className
        )}
        {type}
        bind:value
        {...restProps}
  />
{/if}
