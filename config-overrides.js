const path = require('path');

module.exports = {
  webpack: function (config) {
    // enable alias import
    config.resolve.alias['~'] = path.resolve('./src');

    return config;
  },
  jest: function (config) {
    config.moduleNameMapper['^~/(.*)$'] = '<rootDir>/src/$1';

    return config;
  },
};
