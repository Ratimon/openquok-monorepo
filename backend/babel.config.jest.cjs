/**
 * Babel config for Jest. Used to transform ESM-only packages (feed, xml-js)
 * to CJS so Jest can load them. Our .ts files are handled by ts-jest.
 */
module.exports = {
    presets: [
        ["@babel/preset-env", { modules: "commonjs", targets: { node: "current" } }],
    ],
};
