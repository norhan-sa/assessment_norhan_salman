import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "coverage"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts", "**/*.mts"],
    languageOptions: {
      // Lets rules use type information from tsconfig.json.
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // A promise that is not awaited skips the error handler.
      "@typescript-eslint/no-floating-promises": "error",
      // Parameters starting with "_" are unused on purpose.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // Must be last: turns off ESLint rules that would conflict with Prettier.
  prettier,
);
