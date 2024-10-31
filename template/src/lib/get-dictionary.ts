import type { Locale } from "@/i18n-config";

const dictionaries = {
  en: () =>
    import("../dictionaries/main/en.json").then((module) => module.default),
  es: () =>
    import("../dictionaries/main/es.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  console.log("locale", locale);
  if (dictionaries[locale]) {
    return dictionaries[locale]();
  } else {
    console.warn(`Dictionary not found for locale: ${locale}`);
    // Return a default dictionary or handle the case as needed
    return dictionaries["en"](); // Example: fallback to English dictionary
  }
};
