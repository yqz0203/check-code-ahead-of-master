/**
 * 检查git
 */

const logger = require('./logger');
const { spawn, spawnSync } = require('child_process');

let allBranches = [];

function throwCode(code) {
  if (code === 128) {
    logger.error('> 当前目录不是一个git仓库\n');
  } else {
    logger.error(`> git命令执行错误，code: ${code}`);
  }
  process.exit(code);
}

/**
 * 获取当前分支
 */
function getCurrentBranchName() {
  const git = spawn('git', ['branch', '-a']);
  const grep = spawn('grep', ['*']);

  return new Promise((resolve, reject) => {
    git.stderr.on('data', data => logger.error(data.toString()));

    git.stdout.on('data', data => {
      // 记录全部分支
      allBranches = data.toString().split(/\r\n|\n/);

      grep.stdin.write(data);
    });

    git.on('close', code => {
      if (code !== 0) {
        throwCode(code);
      }

      grep.stdin.end();
    });

    git.on('error', e => console.log(e));

    grep.stdout.on('data', data => {
      const branchName = data
        .toString()
        .substr(1)
        .trim();

      resolve(branchName);
    });

    grep.on('close', code => {
      if (code !== 0) {
        logger.error(`grep 进程退出码：${code}`);
      }
    });

    grep.on('error', e => console.log(e));
  });
}

/**
 * 检查是否存在远端的master分支
 * TODO: 远端写死了origin，改为可配置
 */
function hasOrigin() {
  return allBranches.some(branch => {
    return branch.includes('origin/master');
  });
}

/**
 * 检查master分支
 */
async function checkMaster() {
  let branchName = await getCurrentBranchName();
  let name = branchName;

  // 从commit或者tag检出
  name = name.replace(/^\(HEAD detached at (.*)\)$/i, '$1');

  logger.log(`> 所在分支: ${branchName}\n`);

  if (hasOrigin()) {
    logger.log('> 获取最新git信息\n');

    const res = spawnSync('git', ['fetch']);

    if (res.status) {
      throwCode(res.status);
    }
  } else {
    logger.log(`> 仓库未关联远端，跳过 fetch 阶段\n`);
  }

  const masterName = hasOrigin() ? 'origin/master' : 'master';

  const res2 = spawnSync('git', `log ${name}..${masterName}`.split(' '));

  const { stdout, stderr } = res2;

  if (res2.error) {
    throwCode(res2.status);
  }

  const log = stdout.toString();

  if (log) {
    logger.warn(
      log
        .split(/\r\n|\n/)
        .splice(0, 20)
        .join('\n') + '...\n'
    );
    logger.error(
      `> 当前分支并未包含${masterName}全部代码，请合并后进行操作🙃🙃\n`
    );
    process.exit(1);
    return;
  }

  logger.log(`> 当前分支已包含${masterName}最新代码👌👌\n`);
}

module.exports = checkMaster;
