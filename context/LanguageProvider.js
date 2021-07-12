import { createContext, useContext, useEffect } from 'react';
import { useState } from 'react';
import { config } from '../lib/config';
import { lang } from '../lib/lang';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(config.LANG_ENGLISH);

    useEffect(() => {
        const lang = navigator.language.toLowerCase();
        if (["de", "de-de", "de-at", "de-ch"].includes(lang)) {
            setLanguage(config.LANG_GERMAN);
        } else {
            setLanguage(config.LANG_ENGLISH);
        }
    }, []);

    const dictionary = (key) => {
        return lang[language][key] ?? lang["en"][key];
    }

    return (
        <LanguageContext.Provider value={{ dictionary, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguageContext() {
    return useContext(LanguageContext);
}