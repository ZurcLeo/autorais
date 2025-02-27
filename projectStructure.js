const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const chalk = require('chalk');

const projectRoot = '/Users/leocruz/Documents/Projects/eloscloud/frontend'; // substitua pelo diretório raiz do seu projeto
const shouldExcludeNodeModules = minimist(process.argv.slice(2)).excludeNodeModules === true;

// Função para obter a estrutura de pastas
async function getFolderStructure(rootDir, depth = 0) {
  const folderStructure = {};
  let files;

  try {
    files = fs.readdirSync(rootDir);
  } catch (err) {
    console.error(chalk.red(`Erro ao ler o diretório ${rootDir}: ${err.message}`));
    return folderStructure;
  }

  for (const file of files) {
    const filePath = path.join(rootDir, file);

    try {
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && (shouldExcludeNodeModules ? file !== 'node_modules' : true)) {
        folderStructure[file] = await getFolderStructure(filePath, depth + 1);
      } else {
        folderStructure[file] = null;
      }
    } catch (err) {
      console.error(chalk.red(`Erro ao acessar ${filePath}: ${err.message}`));
    }
  }

  return folderStructure;
}

// Função para navegar na estrutura de pastas
async function navigateFolderStructure(currentPath, folderStructure) {
  const { default: inquirer } = await import('inquirer');

  const choices = Object.keys(folderStructure).map(key => ({
    name: key,
    value: key,
    short: key
  }));

  choices.unshift(new inquirer.Separator());
  choices.unshift({
    name: chalk.blue('.. (up one level)'),
    value: '..',
    short: '..'
  });
  choices.unshift(new inquirer.Separator());

  const { chosenFolder } = await inquirer.prompt([
    {
      type: 'list',
      name: 'chosenFolder',
      message: `Contents of ${chalk.green(currentPath)}:`,
      choices
    }
  ]);

  if (chosenFolder === '..') {
    return currentPath === projectRoot ? null : path.dirname(currentPath);
  }

  const nextPath = path.join(currentPath, chosenFolder);

  if (folderStructure[chosenFolder] === null) {
    console.log(chalk.yellow(`File: ${chosenFolder}`));
    return currentPath;
  }

  return nextPath;
}

// Função principal
async function main() {
  const folderStructure = await getFolderStructure(projectRoot);
  let currentPath = projectRoot;

  while (currentPath) {
    const relativePath = path.relative(projectRoot, currentPath);
    const structure = relativePath ? folderStructure[relativePath.split(path.sep)[0]] : folderStructure;
    currentPath = await navigateFolderStructure(currentPath, structure);
  }
}

main().catch(err => {
  console.error(chalk.red('Error:'), err);
});
