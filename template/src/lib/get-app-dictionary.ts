import type { Locale } from "@/i18n-config";

const dictionaries = {
    en: () => import("../dictionaries/app/en.json").then((module) => module.default),
    es: () => import("../dictionaries/app/es.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};


