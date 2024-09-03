const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function customizeTemplate() {
  console.log("Welcome to the NextJS PWA Template customization script!");

  const projectName = await question("Enter your project name: ");
  const shortName = await question("Enter a short name for your PWA: ");
  const useI18n =
    (
      await question("Do you want to enable internationalization? (y/n): ")
    ).toLowerCase() === "y";

  let defaultLanguage = "en";
  if (!useI18n) {
    defaultLanguage = await question("Enter the default language (en/es): ");
    if (!["en", "es"].includes(defaultLanguage)) {
      console.log("Invalid language. Defaulting to English (en).");
      defaultLanguage = "en";
    }
  }

  // Update manifest.json
  const manifestPath = path.join(process.cwd(), "public", "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.name = projectName;
  manifest.short_name = shortName;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Update package.json
  const packagePath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  packageJson.name = projectName.toLowerCase().replace(/\s+/g, "-");
  packageJson.scripts = {
    dev: "next dev & tsc --watch",
    build: "tsc & next build",
    start: "next start",
    lint: "next lint",
  };
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

  // Update tsconfig.json
  const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
  tsconfig.compilerOptions.paths = {
    "@/*": ["./src/*"],
    "public/*": ["./public/*"],
  };
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));

  // Create next.config.mjs
  const nextConfigContent = `
import path from 'path';
import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias['public'] = path.join(process.cwd(), 'public');
    return config;
  },
};

const pwaConfig = withPWA({
  dest: "public",
});

export default pwaConfig(nextConfig);
`;
  fs.writeFileSync(
    path.join(process.cwd(), "next.config.mjs"),
    nextConfigContent
  );

  if (useI18n) {
    // Set up internationalization
    setupI18n(projectName, shortName);
  } else {
    // Set up single language
    setupSingleLanguage(defaultLanguage, projectName, shortName);
  }

  console.log("Template customization complete!");
  rl.close();
}

function setupI18n() {
  // Create [lang] folder and files
  const langFolderPath = path.join(process.cwd(), "src", "app", "[lang]");
  fs.mkdirSync(langFolderPath, { recursive: true });

  // Create page.tsx
  const pageTsxContent = `
import React from "react";
import { Suspense } from "react";
import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "../../../i18n-config";
import PortSelector from "@/components/PortSelector";
import { fetchRSSFeed, PortData } from "@/lib/rssParser";
import { RefreshNotification } from "@/components/RefreshNotification";

async function getPortData(): Promise<{
  data: PortData;
  lastFetchTime: string;
}> {
  const data = await fetchRSSFeed();
  const lastFetchTime = new Date().toISOString();
  return { data, lastFetchTime };
}

export default async function Home({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  const { data: initialData, lastFetchTime } = await getPortData();

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-12">
      <Suspense fallback="Loading...">
        <PortSelector
          dict={dict}
          lang={lang}
          initialData={initialData}
          lastFetchTime={lastFetchTime}
        />
        <RefreshNotification
          lastFetchTime={lastFetchTime}
          refreshText={dict.refreshPrompt}
          actionText={dict.refreshAction}
          descriptionText={dict.refreshDescription}
        />
      </Suspense>
    </main>
  );
}
`;
  fs.writeFileSync(path.join(langFolderPath, "page.tsx"), pageTsxContent);

  // Create layout.tsx
  const layoutTsxContent = `
import { getDictionary } from "@/lib/get-dictionary";
import { Locale, i18n } from "../../../i18n-config";
import Footer from "@/components/Footer";
import StickyRefreshButton from "@/components/StickyRefreshButton";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export async function generateMetadata({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const dictionary = await getDictionary(lang as Locale);
  return {
    title: "${projectName}",
    description: dictionary.metadata.description,
    manifest: "/manifest.json",
  };
}

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

export default async function Root({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <html lang={params.lang}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        {children}
        <StickyRefreshButton />
        <Footer dict={dict} lang={params.lang} />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
`;
  fs.writeFileSync(path.join(langFolderPath, "layout.tsx"), layoutTsxContent);

  // Update dictionaries to use projectName and shortName
  const enDictionary = {
    metadata: {
      title: projectName,
      description: `${projectName} - A progressive web app built with NextJS`,
    },
    // ... (other entries remain the same)
  };
  fs.writeFileSync(
    path.join(dictionariesPath, "en.json"),
    JSON.stringify(enDictionary, null, 2)
  );

  const esDictionary = {
    metadata: {
      title: projectName,
      description: `${projectName} - Una aplicación web progresiva construida con NextJS`,
    },
    // ... (other entries remain the same)
  };
  fs.writeFileSync(
    path.join(dictionariesPath, "es.json"),
    JSON.stringify(esDictionary, null, 2)
  );

  // Create middleware.ts
  const middlewareTsContent = `
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "../i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const locales = [...i18n.locales];
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  const locale = matchLocale(languages, locales, i18n.defaultLocale);

  return locale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the pathname is '/'
  if (pathname === "/") {
    const locale = getLocale(request);
    return NextResponse.redirect(new URL(\`/\${locale}\`, request.url));
  }

  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(\`/\${locale}/\`) && pathname !== \`/\${locale}\`
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(
        \`/\${locale}\${pathname.startsWith("/") ? "" : "/"}\${pathname}\`,
        request.url
      )
    );
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|service-worker.js|icon-192x192.png|icon-512x512.png).*)",
  ],
};
`;
  fs.writeFileSync(
    path.join(process.cwd(), "src", "middleware.ts"),
    middlewareTsContent
  );

  // Create get-dictionary.ts
  const getDictionaryTsContent = `
import type { Locale } from "../../i18n-config";

const dictionaries = {
  en: () => import("../dictionaries/en.json").then((module) => module.default),
  es: () => import("../dictionaries/es.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};
`;

  fs.writeFileSync(
    path.join(process.cwd(), "src", "lib", "get-dictionary.ts"),
    getDictionaryTsContent
  );
  // Create dictionaries
  const dictionariesPath = path.join(process.cwd(), "src", "dictionaries");
  fs.mkdirSync(dictionariesPath, { recursive: true });

  // Create i18n-config.ts
  const i18nConfigContent = `
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'es'],
} as const

export type Locale = (typeof i18n)['locales'][number]
`;
  fs.writeFileSync(
    path.join(process.cwd(), "i18n-config.ts"),
    i18nConfigContent
  );
}

function setupSingleLanguage(language) {
  // Create app folder structure
  const appFolderPath = path.join(process.cwd(), "src", "app");
  fs.mkdirSync(appFolderPath, { recursive: true });

  // Create page.tsx for single language
  const pageTsxContent = `
import React from "react";
import { Suspense } from "react";

export default async function Home() {

  // Hardcoded dictionary for single language
  const dict = {
    refreshPrompt: "New data available",
    refreshAction: "Refresh",
    refreshDescription: "Click to load the latest data",
    // Add other necessary translations here
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-12">
      <Suspense fallback="Loading...">
      </Suspense>
    </main>
  );
}
`;
  fs.writeFileSync(path.join(appFolderPath, "page.tsx"), pageTsxContent);

  // Create layout.tsx for single language
    const layoutTsxContent = `

export async function generateMetadata() {
  return {
    title: "${projectName}",
    description: "${projectName} - A progressive web app built with NextJS",
    manifest: "/manifest.json",
  };
}

export default async function Root({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hardcoded dictionary for single language
  const dict = {
    // Add necessary translations here
  };

  return (
    <html lang="${language}">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
`;
  fs.writeFileSync(path.join(appFolderPath, 'layout.tsx'), layoutTsxContent);}

customizeTemplate();
