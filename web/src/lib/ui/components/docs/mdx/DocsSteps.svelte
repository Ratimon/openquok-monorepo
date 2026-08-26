<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		howToName,
		howToDescription
	}: {
		children: Snippet;
		/** HowTo JSON-LD title — parsed from raw markdown at SSR; mirrored here for authoring clarity. */
		howToName?: string;
		/** Optional HowTo JSON-LD description. */
		howToDescription?: string;
	} = $props();

	let el: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!el) return;

		const headings = el.querySelectorAll<HTMLElement>(':scope > :is(h3, h4)');
		if (headings.length === 0) return;

		if (el.querySelector('.step-item')) return;

		const groups: HTMLElement[][] = [];
		let current: HTMLElement[] = [];

		for (const child of Array.from(el.children) as HTMLElement[]) {
			if (child.matches('h3, h4') && current.length > 0) {
				groups.push(current);
				current = [];
			}
			current.push(child);
		}
		if (current.length > 0) groups.push(current);

		let stepNum = 0;
		el.innerHTML = '';

		for (let i = 0; i < groups.length; i++) {
			stepNum++;
			const group = groups[i]!;
			const isLast = i === groups.length - 1;

			const item = document.createElement('div');
			item.className = 'step-item group relative flex gap-x-4';

			const iconCol = document.createElement('div');
			iconCol.className = `relative ${isLast ? '' : 'after:border-base-300 after:absolute after:top-7 after:bottom-0 after:start-3 after:-translate-x-[0.5px] after:border-s'}`;

			const circle = document.createElement('div');
			circle.className =
				'bg-primary text-primary-content relative z-10 flex size-6 items-center justify-center rounded-full text-xs font-semibold';
			circle.textContent = String(stepNum);
			iconCol.appendChild(circle);

			const content = document.createElement('div');
			content.className = [
				'flex min-w-0 grow flex-col gap-4',
				isLast ? '' : 'pb-8',
				'[&_.shiki]:max-w-full [&_pre]:min-w-0',
				'[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/50 [&_a]:underline-offset-[3px] hover:[&_a]:decoration-primary',
				'[&>p]:m-0 [&>p]:text-sm [&>p]:leading-relaxed [&>p]:text-base-content/70',
				'[&>ol]:m-0 [&>ol]:list-decimal [&>ol]:space-y-2 [&>ol]:ps-5',
				'[&>ul]:m-0 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:ps-5',
				'[&_li]:text-sm [&_li]:leading-relaxed [&_li]:text-base-content/70 [&_li]:marker:text-base-content/50',
				'[&_strong]:text-base-content'
			]
				.filter(Boolean)
				.join(' ');

			for (const node of group) {
				if (node.matches('h3, h4')) {
					node.className = 'text-base-content m-0 text-sm font-semibold';
				} else if (!node.classList.contains('docs-tabs')) {
					node.classList.add('text-sm', 'leading-relaxed', 'text-base-content/70');
				}
				content.appendChild(node);
			}

			item.appendChild(iconCol);
			item.appendChild(content);
			el.appendChild(item);
		}
	});
</script>

<div
	class="not-prose my-6"
	bind:this={el}
	data-howto-name={howToName}
	data-howto-description={howToDescription}
>
	{@render children()}
</div>
