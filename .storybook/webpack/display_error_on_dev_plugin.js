const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin')
const typescriptFormatter = require('react-dev-utils/typescriptFormatter')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const chalk = require('chalk')

const formatter = (message) => `${message.file}\n${typescriptFormatter(message, true)}`

// reference `react-dev-utils/WebpackDevServerUtils.js`
module.exports = function(options) {
  return function() {
    // NOTE: `this` variable is webpack compiler instance

    let tsMessagesPromise
    let tsMessagesResolver

    this.hooks.beforeCompile.tap('beforeCompile', () => {
      tsMessagesPromise = new Promise(resolve => {
        tsMessagesResolver = msgs => resolve(msgs)
      })
    })

    this.hooks.done.tap('done', async stats => {
      const statsData = stats.toJson({
        all: false,
        warnings: true,
        errors: true,
      })

      const tsMessages = await tsMessagesPromise

      statsData.errors.push(...tsMessages.errors)

      stats.compilation.errors.push(...tsMessages.errors)

      const messages = formatWebpackMessages(statsData)

      if (messages.errors.length > 0) {
        console.log(chalk.red('Failed to compile.\n'))
        console.log(messages.errors.join('\n\n'))
      }
    })

    ForkTsCheckerWebpackPlugin.getCompilerHooks(this).receive.tap('display-error-messages', (diagnostics, lints) => {
      const allMsgs = [...diagnostics, ...lints]

      tsMessagesResolver({
        errors: allMsgs.filter(msg => msg.severity === 'error').map(options && options.formatter || formatter),
        warnings: allMsgs.filter(msg => msg.severity === 'warning').map(options && options.formatter || formatter),
      })
    })
  }
}

module.exports.formatter = formatter