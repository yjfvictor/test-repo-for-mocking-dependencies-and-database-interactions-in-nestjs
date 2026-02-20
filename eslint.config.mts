/**
 * @file eslint.config.mts
 * @brief ESLint flat config for TypeScript and NestJS project.
 * @details Enables TypeScript parser and recommended rules; restricts linting to src and test.
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';
import type { Linter } from 'eslint';

/**
 * @var config
 * @brief ESLint flat configuration array for the project.
 * @type { Linter.Config[] }
 * @details Applies recommended JS config, ignores dist/node_modules/coverage/docs,
 *          and configures TypeScript parser, Node/Jest globals, and recommended
 *          TypeScript rules with unused-vars error (args matching ^_ ignored).
 */
const config: Linter.Config[] = [
  js.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'docs/**'],
  },
  {
    files: ['src/**/*.ts', 'test/**/*.ts', '**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: 'latest' as const, sourceType: 'module' as const },
      globals: { ...globals.node, ...globals.jest },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

export default config;
