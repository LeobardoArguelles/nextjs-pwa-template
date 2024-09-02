# NextJS PWA Template
This is a highly customizable template for creating Progressive Web Apps (PWAs) and their promotional websites using NextJS, TailwindCSS, and TypeScript.

# Features

* NextJS 13+ with App Router
* TailwindCSS for styling
* TypeScript support
* PWA configuration with next-pwa
* Optional internationalization (i18n) support
* Integration with Headless UI and Heroicons
* Animation support with Framer Motion
* Utility-first CSS with tailwind-merge
* Customizable UI components from shadcn/ui

# Getting Started

1. Clone this repository
2. Run the customization script (instructions below)
3. Install dependencies: npm install or yarn install
4. Start the development server: npm run dev or yarn dev

# Customization
To customize the template for your project, run the following command:
`node customize.js`

This script will prompt you for the following information:

* Project name
* Short name (for PWA)
* Default language (if not using i18n)
* Whether to enable internationalization

# Scripts

* `dev`: Runs the development server and TypeScript compiler in watch mode
* `build`: Builds the production-ready application
* `start`: Starts the production server
* `lint`: Runs the linter to check for code quality issues

# Folder Structure
```
├── public/
│   ├── icons/
│   └── manifest.json
├── src/
│   ├── app/
│   │   └── [lang]/ (if using i18n)
│   ├── components/
│   ├── dictionaries/ (if using i18n)
│   └── lib/
├── next.config.mjs
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

# Internationalization

If you chose to enable internationalization, the template uses NextJS's built-in i18n support. Localized content is stored in JSON files in the `src/dictionaries` directory.

# License
This project is licensed under the MIT License.
