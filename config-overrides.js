const path = require('path')

const isDev = process.env.NODE_ENV == 'development'

module.exports = {
  webpack: function (config, env) {
    if (isDev) {
      // enable hot-loader/react-dom
      config.resolve.alias['react-dom'] = '@hot-loader/react-dom'
    }

    // enable alias import
    config.resolve.alias['~'] = path.resolve('./src')

    return config
  },
  jest: function (config) {
    config.moduleNameMapper['^~/(.*)$'] = '<rootDir>/src/$1'
    config.transform = { '^.+\\.mdx$': '@storybook/addon-docs/jest-transform-mdx', ...config.transform }

    return config
  }
}