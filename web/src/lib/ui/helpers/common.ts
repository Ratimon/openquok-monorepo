import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { cubicOut } from 'svelte/easing'
import type { TransitionConfig } from 'svelte/transition'


/**
 * Checks if two arrays are equal.
 *
 * @param a - The first array.
 * @param b - The second array.
 * @returns `true` if the arrays are equal, `false` otherwise.
 */
export function arraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return false
  }

  return true
}

/**
 * Combines multiple class names into a single string.
 *
 * @param inputs - The class names to be combined.
 * @returns The combined class names as a string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param str - The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalize(str: string) {
  if (!str || typeof str !== "string") return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Converts a string to a slug.
 * Replaces non-word characters and underscores with spaces,
 * splits the string into an array of words, and joins them with hyphens.
 * Finally, converts the resulting string to lowercase.
 *
 * @param string - The string to convert to a slug, such as 'This is a Header!'.
 * @returns The slugified string, such as this-is-a-header.
 */
export function stringToSlug(string: string) {
	return noWhiteSpaceString(string.toString())
		.replace(/[\W_]+/g, ' ')
		.split(' ')
		.join('-')
		.toLowerCase();
}

/**
 * Formats the passed time since a given date into a human-readable string.
 * @param created_at - The date in string format to calculate the passed time from.
 * @returns A string representing the passed time in a human-readable format.
 */
export function formatPassedTime(
  created_at: string | null,
): string {
  if (!created_at) return ""
  const now = new Date()
  const createdAt = new Date(created_at)
  const diff = Math.abs(now.getTime() - createdAt.getTime())
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)

  if (days > 365) {
    return `${years} year${years > 1 ? "s" : ""} ago`
  } else if (months > 0) {
    return `${months} month${months > 1 ? "s" : ""} ago`
  } else if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else {
    return "just now"
  }
}

/**
 * Checks if a given string is a valid URL.
 *
 * @param url - The string to be validated as a URL.
 * @returns A boolean indicating whether the given string is a valid URL.
 */
export function isValidUrl(url: string) {
  // Regular expression for URL validation
  const urlRegex =
    /^(?:(?:https?):\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+[^\s]*$/i

  // Test the given URL against the regex
  return urlRegex.test(url)
}

/**
 * Removes special characters and leading or trailing spaces from a string.
 * @param str - The input string.
 * @returns The input string with special characters removed.
 */
export function removeSpecialCharacters(str: string) {
	return str.replace(/[^\w\s]/gi, '').trim();
}

type FlyAndScaleParams = {
  y?: number
  x?: number
  start?: number
  duration?: number
}

export const flyAndScale = (node: Element, params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }): TransitionConfig => {
  const style = getComputedStyle(node)
  const transform = style.transform === 'none' ? '' : style.transform

  const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
    const [minA, maxA] = scaleA
    const [minB, maxB] = scaleB

    const percentage = (valueA - minA) / (maxA - minA)
    const valueB = percentage * (maxB - minB) + minB

    return valueB
  }

  const styleToString = (style: Record<string, number | string | undefined>): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str
      return str + `${key}:${style[key]};`
    }, '')
  }

  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0])
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0])
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1])

      return styleToString({
        transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        opacity: t,
      })
    },
    easing: cubicOut,
  }
}

/**
 * Removes all whitespace characters from a given string.
 * @param str - The input string.
 * @returns The input string with all whitespace characters removed.
 */
export function noWhiteSpaceString(str: string | undefined) {
	if (!str) return '';
	return str.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
}

/**
 * Converts a plural string to its singular form.
 * Handles common English pluralization rules.
 * 
 * @param str - The plural string to convert.
 * @returns The singular form of the string.
 */
export function pluralToSingular(str: string | undefined | null): string {
	if (!str) return '';
	
	// Special cases for words that don't follow standard pluralization rules
	const specialCases: Record<string, string> = {
		'sites': 'site',
		'Sites': 'Site',
		'SITES': 'SITE'
	};
	
	return str
		.split(' ')
		.map(word => {
			// Check special cases first
			if (specialCases[word]) {
				return specialCases[word];
			}
			
			// Handle words ending in "ies" -> "y"
			if (word.toLowerCase().endsWith('ies') && word.length > 3) {
				return word.slice(0, -3) + 'y';
			}
			// Handle words ending in "es" (but not "ies")
			if (word.toLowerCase().endsWith('es') && !word.toLowerCase().endsWith('ies') && word.length > 2) {
				return word.slice(0, -2);
			}
			// Handle words ending in "s" (but not "es" or "ies")
			if (word.toLowerCase().endsWith('s') && word.length > 1) {
				return word.slice(0, -1);
			}
			// Return word as-is if it doesn't match plural patterns
			return word;
		})
		.join(' ');
}

/**
 * A number formatter that formats numbers in a compact notation (e.g., 1K, 1M).
 * Uses the English locale.
 */
export const numberFormatter = Intl.NumberFormat("en", { notation: "compact" })

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = Omit<T, "children"> & {
	children?: import("svelte").Snippet;
};
