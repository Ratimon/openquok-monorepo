import { tv } from "tailwind-variants";

import type { Snippet } from "svelte";
import type { HTMLLabelAttributes } from "svelte/elements";
import type { VariantProps } from "tailwind-variants";

export const label = tv({
    base: "text-sm rtl:text-right font-medium block",
    variants: {
      color: {
        disabled: "text-base-content/50",
        primary: "text-primary",
        secondary: "text-secondary",
        green: "text-green-600",
        emerald: "text-emerald-600",
        red: "text-red-600",
        blue: "text-blue-600",
        yellow: "text-yellow-600",
        orange: "text-orange-600",
        gray: "text-base-content/70",
        teal: "text-teal-600",
        cyan: "text-cyan-600",
        sky: "text-sky-600",
        indigo: "text-indigo-600",
        lime: "text-lime-600",
        amber: "text-amber-600",
        violet: "text-violet-600",
        purple: "text-purple-600",
        fuchsia: "text-fuchsia-600",
        pink: "text-pink-600",
        rose: "text-rose-600"
      }
    }
});

export type LabelVariants = VariantProps<typeof label>;

// label
export interface LabelProps extends HTMLLabelAttributes {
    children: Snippet;
    color?: LabelVariants["color"];
    show?: boolean;
}

export const dropzone = tv({
    base: "flex flex-col justify-center items-center w-full h-64 bg-base-200 rounded-lg border-2 border-base-300 border-dashed cursor-pointer hover:bg-base-300"
});