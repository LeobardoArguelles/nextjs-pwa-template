const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const questions = [
  {
    name: "projectName",
    question: "What is your project name?",
    default: "my-pwa-project",
  },
  {
    name: "shortName",
    question: "What is your project short name?",
    default: "my-pwa",
  },
  {
    name: "description",
    question: "Describe your project",
    default: "A Progressive Web App",
  }
];

async function askQuestions() {
  const answers = {};
  for (const q of questions) {
    const answer = await new Promise((resolve) => {
      rl.question(`${q.question} (${q.default}): `, (input) => {
        resolve(input || q.default);
      });
    });
    answers[q.name] = answer;
  }
  return answers;
}

function updatePackageJson(projectPath, projectName) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.name = projectName;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function updateManifest(projectPath, answers) {
  const manifestPath = path.join(projectPath, 'public', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.name = answers.projectName;
  manifest.short_name = answers.shortName;
  manifest.description = answers.description;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

function updateDictionaries(projectPath, answers) {
  const dictionaries = [
    path.join(projectPath, 'src', 'dictionaries', 'app', 'en.json'),
    path.join(projectPath, 'src', 'dictionaries', 'app', 'es.json'),
    path.join(projectPath, 'src', 'dictionaries', 'main', 'en.json'),
    path.join(projectPath, 'src', 'dictionaries', 'main', 'es.json'),
  ];

  dictionaries.forEach(dictionaryPath => {
    const dictionary = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'));
    dictionary.meta = {
      title: answers.projectName,
      description: answers.description,
    };
    fs.writeFileSync(dictionaryPath, JSON.stringify(dictionary, null, 2));
  });
}

function updateLayouts(projectPath, answers) {
  const layouts = [
    path.join(projectPath, 'src', 'app', '[lang]', 'layout.tsx'),
    path.join(projectPath, 'src', 'app', 'app', '[lang]', 'layout.tsx'),
  ];

  layouts.forEach(layoutPath => {
    let content = fs.readFileSync(layoutPath, 'utf8');
    content = content.replace(/https:\/\/yourdomain\.com/g, answers.domain);
    fs.writeFileSync(layoutPath, content);
  });
}

function updateReadme(projectPath, answers) {
  const readmePath = path.join(projectPath, 'README.md');
  let content = fs.readFileSync(readmePath, 'utf8');
  content = content.replace(/# .*/, `# ${answers.projectName}`);
  content = content.replace(/(?<=\n).*(?=\n)/, answers.description);
  fs.writeFileSync(readmePath, content);
}

async function main() {
  const answers = await askQuestions();
  const projectPath = process.cwd();  // Assuming we're in the project directory

  updatePackageJson(projectPath, answers.projectName);
  updateManifest(projectPath, answers);
  updateDictionaries(projectPath, answers);
  updateLayouts(projectPath, answers);
  updateReadme(projectPath, answers);

  console.log("Project customization complete!");
  rl.close();
}

main().catch(console.error);
