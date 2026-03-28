<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children
	}: {
		children: Snippet;
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
			content.className = `grow ${isLast ? '' : 'pb-8'}`;

			for (const node of group) {
				if (node.matches('h3, h4')) {
					node.className = 'text-base-content m-0 text-sm font-semibold';
				} else {
					node.classList.add('text-sm', 'text-base-content/70');
					node.style.marginTop = '0.25rem';
				}
				content.appendChild(node);
			}

			item.appendChild(iconCol);
			item.appendChild(content);
			el.appendChild(item);
		}
	});
</script>

<div class="not-prose my-6" bind:this={el}>
	{@render children()}
</div>
