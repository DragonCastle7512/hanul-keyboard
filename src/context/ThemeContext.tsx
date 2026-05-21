import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeMode, Themes, ThemeColors } from '../types/theme';

interface ThemeContextType {
  themeMode: ThemeMode;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('black');

  return (
    <ThemeContext.Provider value={{ themeMode, colors: Themes[themeMode], setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
