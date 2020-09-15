const path = require('path')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const isDev = process.env.NODE_ENV == 'development'

module.exports = {
  webpack: function (config, env) {
    config.module.rules[2].oneOf.forEach(rule => {
      if (rule.test) {
        const tests = Array.isArray(rule.test) ? rule.test : [rule.test]

        if (tests.some(t => t.test('.tsx')) && isDev) {
          rule.options.plugins.push(require.resolve('react-refresh/babel'))
        }
      }
    })


    if (isDev) {
      config.plugins.push(new ReactRefreshWebpackPlugin())
    }

    // enable alias import
    config.resolve.alias['~'] = path.resolve('./src')

    return config
  },
  jest: function (config) {
    config.moduleNameMapper['^~/(.*)$'] = '<rootDir>/src/$1'
    config.moduleFileExtensions = [...config.moduleFileExtensions, 'd.ts']
    config.transform = { '^.+\\.mdx$': '@storybook/addon-docs/jest-transform-mdx', ...config.transform }

    return config
  }
}