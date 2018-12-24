# Check-code-ahead-of-master

Check whether current branch code ahead of master before building

## Install

``` bash
npm i check-code-ahead-of-master
```

## Usage

Add a command before your building command in `package.json`, for example

``` json
scripts: {
  "build": "ccaom && webpack...",
```

The `ccaom` command does following things:

1. if git has remote repository, the command will check remote `origin/master` branch otherwise will check local `mater` branch.

2. if current branch is behind master, the command will throw an error and abort the process.

## Licence

MIT