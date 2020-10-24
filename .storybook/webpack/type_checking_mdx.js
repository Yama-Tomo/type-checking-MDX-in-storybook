const rimraf = require('rimraf');
const fs = require('fs');
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const displayErrorOnDevPlugin = require('./display_error_on_dev_plugin');

const delayTypeCheckingPlugin = function (options /*: { delay?: number } */) {
  return function () {
    ForkTsCheckerWebpackPlugin.getCompilerHooks(this).serviceBeforeStart.tapAsync(
      'delay-check-starting',
      (cb) => {
        setTimeout(() => {
          cb();
        }, options.delay || 5000);
      }
    );
  };
};

const stripTsxFilenameFormatter = (message) =>
  displayErrorOnDevPlugin
    .formatter(message)
    .replace(/(.*)\.storybook\/\.mdx_to_tsx\/(.*?)\.tsx/g, '$1$2');

module.exports = function (webpackConfig, options /*: { delay?: number } */) {
  if (fs.existsSync('.storybook/.mdx_to_tsx')) {
    rimraf.sync('.storybook/.mdx_to_tsx');
  }

  const mdxRule = webpackConfig.module.rules.find(
    (rule) =>
      rule.test &&
      typeof rule.test.test === 'function' &&
      rule.test.test('.stories.mdx') &&
      !rule.exclude
  );

  if (mdxRule) {
    mdxRule.use = [
      mdxRule.use[0],
      {
        loader: path.resolve('./.storybook/webpack/mdx_to_tsx_loader.js'),
        options: { tsconfig: path.resolve('./tsconfig.json'), basePath: path.resolve('./') },
      },
      mdxRule.use[1],
    ];
  }

  // extract `ForkTsCheckerWebpackPlugin` instance
  const forkTsCheckerWebpackPlugin = webpackConfig.plugins.find(
    (p) => p.constructor.name === 'ForkTsCheckerWebpackPlugin'
  );
  const currentOptions = forkTsCheckerWebpackPlugin.options;

  // add .storybook/.mdx_to_tsx files to type checking
  currentOptions.reportFiles = ['.storybook/.mdx_to_tsx/**/*.tsx', ...currentOptions.reportFiles];
  currentOptions.tsconfig = './tsconfig.storybook.json';

  if (!options.isDev) {
    currentOptions.formatter = (message) => stripTsxFilenameFormatter(message);
  }

  // replace new `ForkTsCheckerWebpackPlugin` instance
  webpackConfig.plugins = webpackConfig.plugins
    .filter((p) => p.constructor.name !== 'ForkTsCheckerWebpackPlugin')
    .concat(new ForkTsCheckerWebpackPlugin(currentOptions));

  webpackConfig.plugins.push(delayTypeCheckingPlugin(options));
};

module.exports.stripTsxFilenameFormatter = stripTsxFilenameFormatter;
