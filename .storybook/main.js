const path = require('path')

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
    config.resolve.alias['~'] = path.resolve('./src')

    return config
  },
}