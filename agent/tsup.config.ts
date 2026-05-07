import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node18",
  sourcemap: true,
  clean: true,
  // This is a CLI package; publishing declarations isn't required and
  // makes the build sensitive to optional `@types/*` packages.
  dts: false,
  shims: false,
  splitting: false,
  minify: false,
  banner: {
    js: "#!/usr/bin/env node",
  },
});

