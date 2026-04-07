/**
 * Babel config for Jest. Transforms ESM-only packages (e.g. @faker-js/faker, flowcraft) to CJS.
 * Orchestrator .ts files are handled by ts-jest.
 */
module.exports = {
    presets: [
        ["@babel/preset-env", { modules: "commonjs", targets: { node: "current" } }],
    ],
};
