import type { Locale } from "@/i18n-config";

const dictionaries = {
  en: () =>
    import("../dictionaries/main/en.json").then((module) => module.default),
  es: () =>
    import("../dictionaries/main/es.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  console.log("At get-dictionary.ts");
  console.log("locale: ", locale);
  return dictionaries[locale];
};
