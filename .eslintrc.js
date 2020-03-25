module.exports = {
  root: true,
  plugins: [
    'react',
    'prettier'
  ],
  extends: [
    'react-app',
    'plugin:prettier/recommended'
  ],
  rules: {  
    'comma-dangle': ['error', {
      'arrays': 'always-multiline',
      'exports': 'always-multiline',
      'imports': 'always-multiline',
      'objects': 'always-multiline',
      'functions': 'never',
    }],
    '@typescript-eslint/no-explicit-any': 'error',  
    'import/order': 'error',
    'prettier/prettier': [
      'error',
      {
        'singleQuote': true,
        'trailingComma': 'es5',
        'printWidth': 100,
      }
    ]
  }
}