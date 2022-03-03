const path = require('path');

const reactScriptsPath = path.join(require.resolve(`react-scripts/package.json`), '..');
const dependRequireResolve = (id) => require.resolve(id, { paths: [reactScriptsPath] });
const dependRequire = (id) => require(dependRequireResolve(id));

module.exports = {
  dependRequireResolve,
  dependRequire,
};
