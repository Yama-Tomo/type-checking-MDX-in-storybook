const path = require('path');
const displayErrorOnDevPlugin = require('./webpack/display_error_on_dev_plugin');
const typeCheckingMdx = require('./webpack/type_checking_mdx');

module.exports = {
  stories: ['../src/stories/**/*.stories.@(tsx|mdx)'],
  addons: [
    '@storybook/preset-create-react-app',
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
      },
    },
  ],
  webpackFinal: (config, { configType }) => {
    const isDev = configType === 'DEVELOPMENT';

    config.resolve.alias['~'] = path.resolve('./src');

    const eslintRule = config.module.rules.find(
      (rule) =>
        rule.test &&
        typeof rule.test.test === 'function' &&
        rule.test.test('.jsx') &&
        rule.enforce === 'pre' &&
        Array.isArray(rule.use) &&
        rule.use.find((use) => use.loader && use.loader.includes('eslint-loader'))
    );

    if (eslintRule) {
      // exclude .storybook dir
      eslintRule.include = eslintRule.include.filter(
        (includePath) => !includePath.includes('.storybook')
      );
      config.module.rules = [
        ...config.module.rules.filter((rule) => rule !== eslintRule),
        eslintRule,
      ];
    }

    typeCheckingMdx(config, { delay: isDev ? 1500 : 5000 });

    if (isDev) {
      displayErrorOnDevPlugin(config, {
        forkTsCheckerIssueFormatter: typeCheckingMdx.forkTsCheckerIssueFormatter,
      });
    }

    return config;
  },
  core: {
    builder: 'webpack5',
  },
};
