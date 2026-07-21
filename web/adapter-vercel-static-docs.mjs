import fs from 'node:fs';

export function adapterVercelWithoutPrerenderDeps(createAdapter) {
	const base = createAdapter();

	return {
		name: base.name,
		async adapt(builder) {
			const deps = `${builder.config.kit.outDir}/output/prerendered/dependencies`;
			if (fs.existsSync(deps)) {
				fs.rmSync(deps, { recursive: true, force: true });
			}
			await base.adapt(builder);
		}
	};
}
