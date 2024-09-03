const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

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
    name: "useI18n",
    question: "Do you want to use internationalization? (y/n)",
    default: "n",
  },
  // Add more questions as needed
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

function createProject(projectName) {
  console.log(`Creating project: ${projectName}`);
  execSync(
    `npx create-next-app@latest ${projectName} --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"`,
    { stdio: "inherit" }
  );
}

function customizeProject(projectPath, answers) {
  console.log("Customizing project...");

  // Change to project directory
  process.chdir(projectPath);

  // Update package.json
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  packageJson.dependencies = {
    ...packageJson.dependencies,
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "framer-motion": "^10.16.4",
    "next-pwa": "^5.6.0",
    "tailwind-merge": "^1.14.0",
  };
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Update next.config.js
  const nextConfigPath = path.join(projectPath, "next.config.js");
  const nextConfig = `
import path from 'path';
import withPWA from "next-pwa";

const pwaConfig = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias['public'] = path.join(process.cwd(), 'public');
    return config;
  },
  ${
    answers.useI18n === "y"
      ? `
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
  `
      : ""
  }
}

export default pwaConfig(nextConfig);
  `;
  fs.writeFileSync(nextConfigPath, nextConfig);

  // If using i18n, create the [lang] directory and move files
  if (answers.useI18n === "y") {
    const appDir = path.join(projectPath, "src", "app");
    const langDir = path.join(appDir, "[lang]");
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    // Move app/page.tsx to app/[lang]/page.tsx
    fs.renameSync(
      path.join(appDir, "page.tsx"),
      path.join(langDir, "page.tsx")
    );
    // Copy layout.tsx to [lang] directory
    fs.copyFileSync(
      path.join(appDir, "layout.tsx"),
      path.join(langDir, "layout.tsx")
    );
  }

  // Install additional dependencies
  console.log("Installing additional dependencies...");
  execSync("npm install", { stdio: "inherit" });
}

async function main() {
  const answers = await askQuestions();
  createProject(answers.projectName);
  customizeProject(path.join(process.cwd(), answers.projectName), answers);
  console.log("Project setup complete!");
  rl.close();
}

main().catch(console.error);
