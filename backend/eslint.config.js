import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["dist/**", "node_modules/**"] },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        rules: {
            indent: ["error", 4],
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        },
    }
);
