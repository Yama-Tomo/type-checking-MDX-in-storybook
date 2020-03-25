const path = require('path')
const displayErrorOnDevPlugin = require('./webpack/display_error_on_dev_plugin')
const typeCheckingMdx = require('./webpack/type_checking_mdx')

process.env.EXTEND_ESLINT = 'false'

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

    typeCheckingMdx(config, { delay: isDev ? 1500 : 5000, isDev })

    if (isDev) {
      config.plugins.push(
        displayErrorOnDevPlugin({ formatter: typeCheckingMdx.stripTsxFilenameFormatter })
      )
    }

    return config
  },
}