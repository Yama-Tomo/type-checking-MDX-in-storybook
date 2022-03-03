const { dependRequire } = require('./depend_require');
const rimraf = require('rimraf');
const fs = require('fs');
const path = require('path');
const ForkTsCheckerWebpackPlugin = dependRequire('react-dev-utils/ForkTsCheckerWebpackPlugin');

const delayTypeCheckingPlugin = function (options /*: { delay?: number } */) {
  return function () {
    ForkTsCheckerWebpackPlugin.getCompilerHooks(this).start.tapPromise(
      'delay-check-starting',
      () => new Promise((r) => setTimeout(r, options.delay || 5000))
    );
  };
};

const appendMDXFilePathFormatter = (issue) => {
  if (!issue.file.includes('.storybook/.mdx_to_tsx')) {
    return issue;
  }

  const originalFileName = issue.file.replace(/(.*)\.storybook\/\.mdx_to_tsx\/(.*?)\.tsx/g, '$1$2');
  return {
    ...issue,
    message: `${issue.message}\n\noriginal file Path: ${originalFileName}\n`,
  };
};

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

  // add .storybook/.mdx_to_tsx files to type checking
  const currentOptions = forkTsCheckerWebpackPlugin.options;
  currentOptions.issue.include.push({ file: '.storybook/.mdx_to_tsx/**/*.tsx' });
  currentOptions.typescript.configOverwrite.include = ['src', '.storybook/.mdx_to_tsx/**/*.tsx'];

  // replace new `ForkTsCheckerWebpackPlugin` instance
  webpackConfig.plugins = webpackConfig.plugins
    .filter((p) => p.constructor.name !== 'ForkTsCheckerWebpackPlugin')
    .concat(new ForkTsCheckerWebpackPlugin(currentOptions));

  webpackConfig.plugins.push(delayTypeCheckingPlugin(options));
};

module.exports.forkTsCheckerIssueFormatter = appendMDXFilePathFormatter;
