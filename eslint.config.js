import nextjs from '@next/eslint-plugin-next';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '.next/**',
      'build/**',
      'dist/**',
      '.task-master/**',
      'scripts/**',
      'TestSprite/**',
      'tasks/**',
      '.cursor/**',
      'code_html_template/**',
      'code_clone_ref/**',
      'agent-transcripts/**',
      'src/lib/generated/**/*',
      '**/*.d.ts',
      'public/**',
      'test-*.js',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@next/next': nextjs,
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      // TypeScript handles undefined symbols; base no-undef is noisy for .ts/.tsx
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-require-imports': 'warn',
      'no-var': 'warn',
      '@typescript-eslint/no-this-alias': 'off',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      // Copy-heavy MOSC pages use non-breaking spaces; empty catch blocks exist in payment flows
      'no-irregular-whitespace': 'off',
      'no-empty': 'off',
      'no-unreachable': 'warn',
      'no-prototype-builtins': 'off',
      'no-case-declarations': 'off',
      'no-redeclare': 'warn',
      'no-useless-escape': 'warn',
    },
  },
];
