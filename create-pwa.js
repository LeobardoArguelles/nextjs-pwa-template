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
    name: "shortName",
    question: "What is your project short name?",
    default: "my-pwa",
  },
  {
    name: "description",
    question: "Describe your project",
    default: "Generated with Leobard's PWA generator",
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
    "tailwind-merge": "^1.14.0",
    "next-themes": "^0.3.0",
    "@formatjs/intl-localematcher": "^0.5.4",
  };
  packageJson.scripts = {
    "dev": "next dev & tsc --watch",
    "build": "tsc & next build",
    "start": "next start",
    "lint": "next lint"
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Update next.config.js
  const nextConfigPath = path.join(projectPath, "next.config.mjs");
  const nextConfig = `
/** @type {import('next').NextConfig} */
import path from 'path';
import process from 'process';

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }
    config.resolve.alias['public'] = path.join(process.cwd(), 'public');
    return config;
  },
};

export default nextConfig;
  `;

  fs.writeFileSync(nextConfigPath, nextConfig);

  const appDir = path.join(projectPath, "src", "app");
  const langDir = path.join(appDir, "[lang]");
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }

  // Move app/page.tsx to app/[lang]/page.tsx
  fs.renameSync(path.join(appDir, "page.tsx"), path.join(langDir, "page.tsx"));

  // Delete app/layout.tsx
  fs.unlinkSync(path.join(appDir, "layout.tsx"));

  // Create app/[lang]/layout.tsx
  const layoutPath = path.join(langDir, "layout.tsx");
  const layout = `
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { getDictionary } from "@/lib/get-dictionary";
import { Locale, i18n } from "@/i18n-config";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dictionary = await getDictionary(lang);
  return {
    title: "Control de obras",
    description: "App para llevar el control de obras en Arveco",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "PWA App",
    },
    formatDetection: {
      telephone: false,
    },
    openGraph: {
      type: "website",
      siteName: "Control de obras",
      title: "Control de obras",
      description: "App para llevar el control de obras en Arveco",
      url: "https://yourdomain.com",
      images: [
        {
          url: "https://yourdomain.com/icons/apple-touch-icon.png",
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <html lang={params.lang} suppressHydrationWarning>
      <head>
        <meta name="application-name" content="Control de obras" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PWA App" />
        <meta
          name="description"
          content="App para llevar el contro de obras en Arveco"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/touch-icon-ipad.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/touch-icon-iphone-retina.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/icons/touch-icon-ipad-retina.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="mask-icon"
          href="/icons/safari-pinned-tab.svg"
          color="#030364"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
        />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Control de obras" />
        <meta
          property="og:description"
          content="App para llevar el contro de obras en Arveco"
        />
        <meta property="og:site_name" content="Control de obras" />
        <meta property="og:url" content="https://yourdomain.com" />
        <meta
          property="og:image"
          content="https://yourdomain.com/icons/apple-touch-icon.png"
        />
         <link rel="apple-touch-startup-image" media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash_screens/11__iPad_Pro__10.5__iPad_Pro_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash_screens/10.5__iPad_Air_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash_screens/8.3__iPad_Mini_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash_screens/11__iPad_Pro_M4_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash_screens/13__iPad_Pro_M4_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash_screens/11__iPad_Pro_M4_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash_screens/10.9__iPad_Air_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash_screens/10.9__iPad_Air_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash_screens/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash_screens/8.3__iPad_Mini_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash_screens/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash_screens/10.2__iPad_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash_screens/iPhone_11__iPhone_XR_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash_screens/12.9__iPad_Pro_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash_screens/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash_screens/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash_screens/12.9__iPad_Pro_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash_screens/10.2__iPad_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash_screens/11__iPad_Pro__10.5__iPad_Pro_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash_screens/iPhone_11__iPhone_XR_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" href="/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash_screens/13__iPad_Pro_M4_landscape.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png"/>
<link rel="apple-touch-startup-image" media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="/splash_screens/10.5__iPad_Air_landscape.png"/>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
`;

  fs.writeFileSync(layoutPath, layout);

  // Add i18n-config.ts located at src/i18n-config.ts
  // Make sure the directory exists
  const i18nConfigPath = path.join(projectPath, "src", "i18n-config.ts");

  const i18nConfig = `
  export const i18n = {
    defaultLocale: 'en',
    ${answers.useI18n === "y" ? "locales: ['en', 'es']," : "locales: ['en'],"}
  } as const

export type Locale = (typeof i18n)['locales'][number]
`;

  fs.writeFileSync(i18nConfigPath, i18nConfig);

  // Add lib/get-dictionary.ts located at src/lib/get-dictionary.ts
  // Make sure the directory exists
  const libDir = path.join(projectPath, "src", "lib");
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  const getDictionaryPath = path.join(libDir, "get-dictionary.ts");
  const getDictionary = `
import type { Locale } from "@/i18n-config";

const dictionaries = {
  en: () => import("../dictionaries/en.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};

`;

  fs.writeFileSync(getDictionaryPath, getDictionary);

  // Add dictionaries/en.json
  const dictionariesDir = path.join(projectPath, "src", "dictionaries");
  if (!fs.existsSync(dictionariesDir)) {
    fs.mkdirSync(dictionariesDir, { recursive: true });
  }

  const enDictionaryPath = path.join(dictionariesDir, "en.json");
  const enDictionary = `{}`;

  fs.writeFileSync(enDictionaryPath, enDictionary);

  if (answers.useI18n === "y") {
    const esDictionaryPath = path.join(dictionariesDir, "es.json");
    const esDictionary = `{}`;

    fs.writeFileSync(esDictionaryPath, esDictionary);
  }

  // Install additional dependencies
  console.log("Installing additional dependencies...");
  execSync("npm install", { stdio: "inherit" });
  execSync("npm i --save-dev @types/negotiator", { stdio: "inherit" });
}

function addShadcn() {
  console.log("Installing shadcn...");
  // Init shadcn accepting the first two default values, and the last one as no
  execSync("npx shadcn init", { stdio: "inherit" });

  // Add components/ui/theme-provider.tsx checking if directory exists
  const componentsDir = path.join(process.cwd(), "src", "components");
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  const uiDir = path.join(componentsDir, "ui");
  if (!fs.existsSync(uiDir)) {
    fs.mkdirSync(uiDir, { recursive: true });
  }

  const themeProviderPath = path.join(uiDir, "theme-provider.tsx");
  const themeProvider = `
  "use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
`;

  fs.writeFileSync(themeProviderPath, themeProvider);
}

function addManifest(projectName, shortName, description) {
  const manifestPath = path.join(process.cwd(), "public", "manifest.json");
  const manifest = `
{
  "name": ${projectName},
  "short_name": ${shortName},
  "description": ${description},
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}

`;

  fs.writeFileSync(manifestPath, manifest);
}

function addMiddleware() {
  const middlewarePath = path.join(process.cwd(), "src");

  const middleware = `
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "@/i18n-config";
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
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|service-worker.js|icon-192x192.png|icon-512x512.png|.*\\..*).*)",
  ],
};
`;

  // Here you could potentially write the middleware to a file
  fs.writeFileSync(path.join(middlewarePath, "middleware.ts"), middleware);
}

function addServiceWorker() {
  const serviceWorkerPath = path.join(
    process.cwd(),
    "public",
    "service-worker.js"
  );
  const serviceWorker = `
const CACHE_NAME = 'la-linea-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/script/main.js',
  // Add other assets to cache
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
  );
});
`;

  fs.writeFileSync(serviceWorkerPath, serviceWorker);
}

async function main() {
  const answers = await askQuestions();
  createProject(answers.projectName, answers.shortName);
  customizeProject(path.join(process.cwd(), answers.projectName), answers);
  addShadcn();
  addManifest(answers.projectName, answers.shortName, answers.description);
  addMiddleware();
  addServiceWorker();
  console.log("Project setup complete!");
  rl.close();
}

main().catch(console.error);
