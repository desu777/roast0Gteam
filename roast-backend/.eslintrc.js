module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Allow semicolons
    'semi': ['error', 'always'],
    
    // Allow spaces before function parentheses
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],
    
    // Allow console logs in development
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    
    // Allow debugger in development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    
    // Max line length
    'max-len': ['warn', {
      code: 120,
      ignoreComments: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true
    }],
    
    // Prefer const
    'prefer-const': 'error',
    
    // No unused vars
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    
    // Comma dangle
    'comma-dangle': ['error', 'never'],
    
    // Quote style
    'quotes': ['error', 'single', { avoidEscape: true }],
    
    // Indent
    'indent': ['error', 2, { SwitchCase: 1 }],
    
    // No multiple empty lines
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    
    // Require await in async functions
    'require-await': 'error',
    
    // No return await
    'no-return-await': 'error'
  }
}; 