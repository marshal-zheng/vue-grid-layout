const { execSync } = require('child_process');
const fs = require('fs');
const fileSystem = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const semver = require('semver');
const inquirer = require('inquirer');

// Parse command line arguments
const args = require('minimist')(process.argv.slice(2));

// Extract the action command from arguments
const commandAction = args.action;

// get the current version from package.json
const getCurrentVersion = () => {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  return packageJson.version;
}

// handle the release process
const release = async () => {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'semverType',
        message: 'Select version type:',
        choices: ['PATCH', 'MINOR', 'MAJOR'],
      },
    ]);
    const { semverType: type } = answers;

    const currentVersion = getCurrentVersion();
    const isFirstRelease = !fs.existsSync('./CHANGELOG.md');
    const nextVersion = isFirstRelease ? currentVersion : semver.inc(currentVersion, type.toLowerCase());

    const existingTags = execSync('git tag').toString().split('\n');
    if (existingTags.includes(`v${nextVersion}`)) {
      console.log(chalk.red(`The tag v${nextVersion} already exists. Please choose a different version.`));
      return;
    }

    if (!isFirstRelease) {
      const packageJsonPath = './package.json';
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageJson.version = nextVersion;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

        // Commit the version update
        execSync('git add package.json');
        execSync(`git commit -m "release v${nextVersion}" --no-verify`);
    }

    // Create a temporary tag for generating the changelog
    const tempTag = `v${nextVersion}`;
    execSync(`git tag ${tempTag}`);

    // Generate changelog
    execSync(`git cliff --config cliff.toml -o CHANGELOG.md`);

    // Commit the changelog
    execSync('git add CHANGELOG.md');
    execSync(`git commit --amend --no-edit --no-verify`);

    // Delete the temporary tag
    execSync(`git tag -d ${tempTag}`);

    const tagAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'tagMessage',
        message: 'Enter the tag message (optional):',
      },
    ]);

    let command = `git tag "v${nextVersion}"`;
    if (tagAnswers.tagMessage) {
      command += ` -m "${tagAnswers.tagMessage}"`;
    }
    execSync(command);

    // Push the tag to the repository
    execSync('git push --tags');

    console.log(chalk.green(`Released version ${nextVersion}`));
  } catch (error) {
    console.error(chalk.red('An error occurred during the release process:'), error);
  }
};

// publish the package
const publish = () => {
  const buildDir = './build';
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
    console.log(chalk.yellow('Build directory removed'));
  }
  build();
  execSync('npm publish');
  console.log(chalk.green('Published to npm'));
}

// ASCII art logo
const logo = `
  GGGGG  RRRRR  IIIII  DDDDD     L       A    Y   Y  OOOO  U   U  TTTTT
  G      R   R    I    D   D     L      A A    Y Y  O    O U   U    T
  G  GG  RRRRR    I    D   D     L     AAAAA    Y   O    O U   U    T
  G   G  R  R     I    D   D     L     A   A    Y   O    O U   U    T
  GGGGG  R   R  IIIII  DDDDD     LLLLL A   A    Y    OOOO   UUU     T
`;

// Path to node_modules binaries
const BIN = path.join(__dirname, 'node_modules', '.bin');

// clean the build directory
function clean() {
  fs.rmSync(path.join(__dirname, 'build'), { recursive: true, force: true });
  fs.mkdirSync(path.join(__dirname, 'build'));
}

// run ESLint on the project
function lint() {
  execSync(`${BIN}/eslint lib/* lib/utils/*`, { stdio: 'inherit' });
}

// compile the project to CommonJS using Babel
function buildCJS() {
  execSync(`${BIN}/babel --out-dir ./build/cjs --extensions ".ts,.tsx" ./lib`, { stdio: 'inherit' });
}

// bundle the project for the web using Webpack
function buildWeb() {
  execSync(`${BIN}/webpack --mode=production`, { stdio: 'inherit' });
}

// start the Webpack development server
function dev() {
  process.env.DRAGGABLE_DEBUG = 1;
  execSync(`${BIN}/webpack serve --mode=development`, { stdio: 'inherit' });
}

// run the build process
function build() {
  clean();
  buildCJS();
  buildWeb();
}

// generate project documentation
async function generateDocs() {
  const docsPath = path.join(__dirname, 'docs');
  try {
    await fileSystem.remove(docsPath);
    console.log(chalk.green('Docs directory removed successfully.'));

    const sourceDir = path.join(__dirname, 'example');
    await fileSystem.copy(sourceDir, docsPath);
    console.log(chalk.green('example directory has been copied to docs'));

    const libSource = path.join(__dirname, 'build', 'web', 'vue-grid-layout.min.js');
    const libTarget = path.join(docsPath, 'vue-grid-layout.min.js');
    await fileSystem.copy(libSource, libTarget);
    console.log(chalk.green('example directory has been copied to docs'));

    const indexPath = path.join(docsPath, 'index.html');
    let htmlContent = await fileSystem.readFile(indexPath, 'utf8');
    htmlContent = htmlContent.replace(
      /<script id="vue-grid-layout-script" src="[^"]*"><\/script>/g,
      '<script id="vue-grid-layout-script" src="./vue-grid-layout.min.js"></script>'
    );
    await fileSystem.writeFile(indexPath, htmlContent);
    console.log(chalk.green('index.html has been modified'));
  } catch (error) {
    console.error(chalk.red('An error occurred:'), error);
  }
}

// build the project and generate documentation
function buildDocs() {
  build();
  generateDocs();
}

// Mapping of command actions to functions
const commands = { clean, lint, build, dev, publish, release, docs: buildDocs };

// execute a command based on the action argument
const executeCommand = async (action) => {
  console.log(chalk.hex('#3399FF')(logo));
  if (action in commands) {
    await commands[action]();
  } else {
    console.log(chalk.red(`Unknown command action: ${action}`));
  }
};

// Execute the command
executeCommand(commandAction);