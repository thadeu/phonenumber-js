import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.{ts,mts,cts}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.test.ts'],
    languageOptions: {
      globals: { ...globals.node, ...globals.vitest },
    },
  },
  {
    files: ['src/functions.ts'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
)
