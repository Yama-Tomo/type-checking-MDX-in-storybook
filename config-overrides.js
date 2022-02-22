const path = require('path');

module.exports = {
  webpack: function (config) {
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
    const overridePaths = { ...paths };

    if (env === 'test') {
      const pathsConfigPath = path.resolve('node_modules/react-scripts/config/paths.js');
      // override paths in memory
      require.cache[require.resolve(pathsConfigPath)].exports = overridePaths;
    }

    return overridePaths;
  },
};
