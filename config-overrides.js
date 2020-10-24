const path = require('path');

module.exports = {
  webpack: function (config, env) {
    const forkTsCheckerWebpackPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name == 'ForkTsCheckerWebpackPlugin'
    );

    if (forkTsCheckerWebpackPlugin) {
      forkTsCheckerWebpackPlugin.tsconfig = path.resolve('./tsconfig.json');
    }

    // enable alias import
    config.resolve.alias['~'] = path.resolve('./src');

    return config;
  },
  jest: function (config) {
    config.moduleNameMapper['^~/(.*)$'] = '<rootDir>/src/$1';
    config.moduleFileExtensions = [...config.moduleFileExtensions, 'd.ts'];
    config.transform = {
      '^.+\\.mdx$': '@storybook/addon-docs/jest-transform-mdx',
      ...config.transform,
    };

    return config;
  },
  paths: (paths, env) => {
    const overridePaths = {
      ...paths,
      appTsConfig: path.resolve('./tsconfig-react-scripts-v4.json'),
    };

    if (env === 'test') {
      const pathsConfigPath = path.resolve('node_modules/react-scripts/config/paths.js');
      // override paths in memory
      require.cache[require.resolve(pathsConfigPath)].exports = overridePaths;
    }

    return overridePaths;
  },
};
