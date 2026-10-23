import { defineConfig, globalIgnores } from 'eslint/config';
import next from 'eslint-config-next';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  ...next,
  prettier,
  {
    rules: {
      'react-hooks/exhaustive-deps': 0,
      '@next/next/no-img-element': 'off',
      // React Compiler rules added in eslint-plugin-react-hooks v7 (eslint-config-next 16).
      // Kept as warnings until the flagged components are refactored.
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
  globalIgnores([
    'node_modules/**',
    '.next/**',
    'public/**',
    '.husky/**',
    'next-env.d.ts',
  ]),
]);
