import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  platformName: string;
  supportEmail: string;
  isLoading: boolean;
}

const defaultSettings: SettingsContextType = {
  platformName: 'ViewPro',
  supportEmail: 'support@example.com',
  isLoading: true
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsContextType>(defaultSettings);

  // useEffect(() => {
  //   const fetchSettings = async () => {
  //     try {
  //       const response = await fetch('/api/settings');
  //       if (response.ok) {
  //         const data = await response.json();
  //         setSettings({
  //           platformName: data.platformName || defaultSettings.platformName,
  //           supportEmail: data.supportEmail || defaultSettings.supportEmail,
  //           isLoading: false
  //         });
  //       } else {
  //         setSettings({...defaultSettings, isLoading: false});
  //       }
  //     } catch (error) {
  //       console.error('Error fetching settings:', error);
  //       setSettings({...defaultSettings, isLoading: false});
  //     }
  //   };

  //   fetchSettings();
  // }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}; 