const chalk = require('chalk').default;

module.exports = {
  log: (...args) => console.log(chalk.greenBright(...args)),
  warn: (...args) => console.log(chalk.yellowBright(...args)),
  error: (...args) => console.log(chalk.redBright(...args)),
};
