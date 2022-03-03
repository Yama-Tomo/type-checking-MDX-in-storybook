const { dependRequire } = require('./depend_require');
const ReactRefreshPlugin = dependRequire('@pmmmwh/react-refresh-webpack-plugin');
const ForkTsCheckerWebpackPlugin = dependRequire('react-dev-utils/ForkTsCheckerWebpackPlugin');

module.exports = function (
  webpackConfig,
  options /*: { forkTsCheckerIssueFormatter?: (issue: object) => object } */
) {
  webpackConfig.plugins = webpackConfig.plugins.filter(
    (p) => p.constructor.name !== 'ReactRefreshPlugin'
  );
  // Do not use ReactRefreshPlugin to display errors, use webpack-hot-middleware instead.
  webpackConfig.plugins.push(new ReactRefreshPlugin({ overlay: false }));
  webpackConfig.plugins.push(displayErrorOnDevPlugin(options));
};

function displayErrorOnDevPlugin(options) {
  return function () {
    // NOTE: `this` variable is webpack compiler instance

    let forkTsCheckerProcessing;
    let forkTsCheckerDone;
    this.hooks.beforeCompile.tap('beforeCompile', () => {
      forkTsCheckerProcessing = new Promise((resolve) => {
        forkTsCheckerDone = (issues) => resolve(issues);
      });
    });

    let doneCount = 0;
    const hooks = ForkTsCheckerWebpackPlugin.getCompilerHooks(this);
    hooks.issues.tap('check-done', function (issues) {
      doneCount += 1;
      if (doneCount < 2) {
        // Prevent ForkTsCheckerWebpackPlugin error from being displayed twice on first build.
        forkTsCheckerDone([]);
        return [];
      }

      const formattedIssues = options.forkTsCheckerIssueFormatter
        ? issues.map(options.forkTsCheckerIssueFormatter)
        : issues;

      // for webpack-hot-middleware
      forkTsCheckerDone(formattedIssues);
      // for cli console
      return formattedIssues;
    });

    const self = this;
    this.hooks.done.tap('notify-error-stats-to-browser', async (stats) => {
      const issues = await forkTsCheckerProcessing;
      if (!issues.length) {
        return;
      }

      const formattedIssues = issues.map((issue) => {
        const filename = `${issue.file}:${issue.location.start.line}:${issue.location.start.column}`;
        return {
          message: `${issue.code}: ${issue.message}`,
          // NOTE: node_modules/webpack/lib/stats/DefaultStatsFactoryPlugin.js `EXTRACT_ERROR` block
          module: { identifier: () => filename, readableIdentifier: () => filename },
        };
      });

      stats.compilation.errors.push(...formattedIssues);
      // see patches/webpack-hot-middleware+2.xx.x.patch
      self.notifyStatsToBrowser(stats);
    });
  };
}
