import { createContext, useContext, useState, useCallback } from 'react';
import en from '../locales/en';
import hi from '../locales/hi';
import mr from '../locales/mr';

const LanguageContext = createContext();

const dictionaries = { en, hi, mr };

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(localStorage.getItem('lang') || 'en');

  const setLanguage = useCallback((lang) => {
    localStorage.setItem('lang', lang);
    setLanguageState(lang);
  }, []);

  const t = useCallback((key) => {
    const dict = dictionaries[language] || en;
    return dict[key] || en[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
export default LanguageContext;
