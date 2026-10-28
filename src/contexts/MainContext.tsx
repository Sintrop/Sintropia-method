import React, {createContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';

interface MainContextProviderProps {
  children: React.ReactNode;
}

export interface MainContextProps {
  language: string;
}

export const MainContext = createContext({} as MainContextProps);

export function MainContextProvider({
  children,
}: MainContextProviderProps): React.JSX.Element {
  const [language, setLanguage] = useState(i18next.language);

  useEffect(() => {
    getStoragedLanguage();

    // Portuguese is the default; a language picked in the selector wins.
    const onChange = (next: string) => setLanguage(next);
    i18next.on('languageChanged', onChange);
    return () => i18next.off('languageChanged', onChange);
  }, []);

  async function getStoragedLanguage(): Promise<void> {
    //This function tries to find if there is any record of a language previously chosen by the user
    const response = await AsyncStorage.getItem('language');
    if (!response) return;

    if (i18next.language !== response) {
      i18next.changeLanguage(response);
    }
  }

  return (
    <MainContext.Provider
      value={{
        language,
      }}>
      {children}
    </MainContext.Provider>
  );
}
