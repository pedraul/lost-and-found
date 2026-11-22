'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import LanguageTranslator from '../components/LanguageTranslator';

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('site-language');
    const savedTheme = localStorage.getItem('site-theme');
    if (['en', 'fr', 'rw'].includes(savedLanguage)) setLanguage(savedLanguage);
    if (['light', 'dark'].includes(savedTheme)) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('site-language', language);
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('site-theme', theme);
  }, [theme]);

  return (
    <PreferencesContext.Provider value={{ language, setLanguage, theme, setTheme }}>
      {children}
      <LanguageTranslator language={language} />
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside PreferencesProvider');
  return context;
}
