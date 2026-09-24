module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'test-results/**',
      'playwright-report/**',
      '.vscode/**',
    ],
  },
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: Object.fromEntries(
        'getComputedStyle window document localStorage sessionStorage matchMedia performance requestAnimationFrame cancelAnimationFrame ResizeObserver IntersectionObserver MutationObserver FormData AbortController fetch screen DeviceOrientationEvent innerWidth Event URL console setTimeout clearTimeout require module __dirname process'
          .split(' ')
          .map((name) => [name, 'readonly']),
      ),
    },
    rules: {
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
      'no-unreachable': 'error',
      'no-undef': 'error',
      'no-constant-condition': 'error',
      'no-dupe-args': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      eqeqeq: 'error',
    },
  },
];
