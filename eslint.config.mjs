import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import vitest from "eslint-plugin-vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const config = [
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:prettier/recommended",
    "plugin:unicorn/recommended",
    // 'plugin:vitest/recommended'
  ),
  {
    ignores: [
      "node_modules/",
      "yarn-error.log",
      ".env",
      "dist",
      ".DS_Store",
      ".vscode",
      ".yarn",
      "tsconfig.json",
      "ecosystem.config.js",
    ],
  },
  // Configuración global personalizada
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "tsconfig.json",
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "no-console": "off",
      "unicorn/no-null": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/filename-case": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "no-process-exit": "off",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
    },
  },
  {
    files: ["src/typescript/**"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    files: ["src/docs/**"],
    rules: {
      "unicorn/no-empty-file": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            [
              "^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)",
            ],
            [
              String.raw`^node:.*\u0000$`,
              String.raw`^@?\w.*\u0000$`,
              String.raw`^[^.].*\u0000$`,
              String.raw`^\..*\u0000$`,
            ],
            [String.raw`^\u0000`],
            ["^node:"],
            [String.raw`^@?\w`],
            [
              "^@/libs",
              "^@/tests",
              "^@/routes",
              "^@/database",
              "^@/controllers",
              "^@/middlewares",
              String.raw`^\.`,
            ],
            ["^"],
            [String.raw`^\.`],
          ],
        },
      ],
    },
  },
  ...compat
    .extends("plugin:@typescript-eslint/disable-type-checked")
    .map((config) => ({
      ...config,
      files: ["**/*.{js,mjs,cjs}"],
    })),
  {
    files: ["tests/**"],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules, // you can also use vitest.configs.all.rules to enable all rules
      "vitest/max-nested-describe": ["error", { max: 3 }], // you can also modify rules' behavior using option like this
    },
  },
];

export default config;
