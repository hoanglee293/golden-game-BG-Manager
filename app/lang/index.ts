import en from './locales/en.json';
import vi from './locales/vi.json';
import kr from './locales/kr.json';
import jp from './locales/jp.json';
import { useLang, useBrowserLanguage, useBrowserLanguageInfo } from './useLang';
import { LangProvider } from './LangProvider';

export type LangCodes = 'en' | 'vi' | 'kr' | 'jp';

// Define data type that can contain nested objects
type Translations = { [key: string]: string | string[] | Translations };

export const langConfig: { 
  listLangs: { id: number; name: string; code: LangCodes; translationKey: string; flag: string }[];
  langsApp: Partial<Record<LangCodes, Translations>>;
} = {
  listLangs: [
    { id: 1, name: "Korea", code: "kr", translationKey: "languages.korea", flag: "https://flagcdn.com/w40/kr.png" },
    { id: 2, name: "English", code: "en", translationKey: "languages.english", flag: "https://flagcdn.com/w40/gb.png" },
  ],
  langsApp: {
    en,
    vi,
    kr,
    jp,
  }
};

// Function to detect browser language
export const detectBrowserLanguage = (): LangCodes => {
  if (typeof window === 'undefined') {
    return 'kr'; // Fallback for SSR
  }

  const browserLang = navigator.language || navigator.languages?.[0] || 'kr';
  
  // Convert browser language codes to application language codes
  const langMap: Record<string, LangCodes> = {
    'ko': 'kr',     // Korean
    'ko-KR': 'kr',  // Korean (Korea)
    'en': 'en',     // English
    'en-US': 'en',  // English (US)
    'en-GB': 'en',  // English (UK)
    'vi': 'vi',     // Vietnamese
    'vi-VN': 'vi',  // Vietnamese (Vietnam)
    'ja': 'jp',     // Japanese
    'ja-JP': 'jp',  // Japanese (Japan)
  };

  // Find the best matching language
  const exactMatch = langMap[browserLang];
  if (exactMatch) {
    return exactMatch;
  }

  // Find language based on primary language code (first 2 characters)
  const primaryLang = browserLang.split('-')[0];
  const primaryMatch = langMap[primaryLang];
  if (primaryMatch) {
    return primaryMatch;
  }

  return 'kr'; // Default fallback
};

// Helper function to get data from nested objects
const getNestedTranslation = (translations: Translations, key: string): string | string[] => {
  const result = key.split('.').reduce((obj: any, k) => {
    if (typeof obj === 'object' && obj !== null && k in obj) {
      return obj[k] as Translations;
    }
    return undefined;
  }, translations as Translations);
  
  return result || key;
};

// Export the translation function that takes language as a parameter
export const getTranslation = (lang: LangCodes) => {
  const translations = langConfig.langsApp[lang] || {};
  
  return (key: string): string => {
    const result = getNestedTranslation(translations, key);
    if (Array.isArray(result)) {
      // For arrays, join them with newlines to make it a string
      return result.join('\n');
    }
    return result as string;
  };
};

// Re-export useLang and LangProvider
export { useLang, useBrowserLanguage, useBrowserLanguageInfo, LangProvider };
