const path = require('path')
const displayErrorOnDevPlugin = require('./webpack/display_error_on_dev_plugin')

module.exports = {
  stories: ['../src/stories/**/*.stories.(tsx|mdx)'],
  addons: [
    '@storybook/preset-create-react-app',
    {
      name: "@storybook/addon-docs",
      options: {
        configureJSX: true
      }
    }
  ],
  webpackFinal: (config, { configType }) => {
    const isDev = configType === 'DEVELOPMENT'

    config.resolve.alias['~'] = path.resolve('./src')

    if (isDev) {
      config.plugins.push(
        displayErrorOnDevPlugin()
      )
    }

    return config
  },
}