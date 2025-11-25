import { createContext, useContext, useState, useEffect } from 'react';
import esTranslations from '../i18n/es.json';
import enTranslations from '../i18n/en.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Cargar idioma desde localStorage o usar 'es' por defecto
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'es';
  });

  const translations = {
    es: esTranslations,
    en: enTranslations,
  };

  // Función para traducir textos
  const t = (path, params = {}) => {
    const keys = path.split('.');
    let value = translations[language];

    for (const key of keys) {
      if (value && value[key]) {
        value = value[key];
      } else {
        console.warn(`Translation missing for path: ${path}`);
        return path;
      }
    }

    // Si el valor es un string y tiene parámetros, reemplazarlos
    if (typeof value === 'string' && params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match;
      });
    }

    return value;
  };

  const changeLanguage = (lang) => {
    if (lang === 'es' || lang === 'en') {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};


