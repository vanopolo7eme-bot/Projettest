import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export interface AccentColor {
  id: string;
  label: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryGlow: string;
  gold: string;
  goldLight: string;
  goldGlow: string;
}

export const accentPresets: AccentColor[] = [
  {
    id: 'ocean',
    label: 'Océan',
    primary: '#1e3a5f',
    primaryDark: '#0f2137',
    primaryLight: '#2d5a8e',
    primaryGlow: 'rgba(30,58,95,0.15)',
    gold: '#f4a623',
    goldLight: '#f6b94d',
    goldGlow: 'rgba(244,166,35,0.2)',
  },
  {
    id: 'emerald',
    label: 'Émeraude',
    primary: '#065f46',
    primaryDark: '#022c22',
    primaryLight: '#059669',
    primaryGlow: 'rgba(6,95,70,0.15)',
    gold: '#fbbf24',
    goldLight: '#fde68a',
    goldGlow: 'rgba(251,191,36,0.2)',
  },
  {
    id: 'royal',
    label: 'Royal',
    primary: '#4c1d95',
    primaryDark: '#2e1065',
    primaryLight: '#7c3aed',
    primaryGlow: 'rgba(76,29,149,0.15)',
    gold: '#f59e0b',
    goldLight: '#fbbf24',
    goldGlow: 'rgba(245,158,11,0.2)',
  },
  {
    id: 'crimson',
    label: 'Cramoisi',
    primary: '#991b1b',
    primaryDark: '#450a0a',
    primaryLight: '#dc2626',
    primaryGlow: 'rgba(153,27,27,0.15)',
    gold: '#f59e0b',
    goldLight: '#fbbf24',
    goldGlow: 'rgba(245,158,11,0.2)',
  },
  {
    id: 'slate',
    label: 'Ardoise',
    primary: '#334155',
    primaryDark: '#0f172a',
    primaryLight: '#475569',
    primaryGlow: 'rgba(51,65,85,0.15)',
    gold: '#38bdf8',
    goldLight: '#7dd3fc',
    goldGlow: 'rgba(56,189,248,0.2)',
  },
  {
    id: 'teal',
    label: 'Sarcelle',
    primary: '#115e59',
    primaryDark: '#042f2e',
    primaryLight: '#0d9488',
    primaryGlow: 'rgba(17,94,89,0.15)',
    gold: '#fb923c',
    goldLight: '#fdba74',
    goldGlow: 'rgba(251,146,60,0.2)',
  },
  {
    id: 'indigo',
    label: 'Indigo',
    primary: '#312e81',
    primaryDark: '#1e1b4b',
    primaryLight: '#4f46e5',
    primaryGlow: 'rgba(49,46,129,0.15)',
    gold: '#e879f9',
    goldLight: '#f0abfc',
    goldGlow: 'rgba(232,121,249,0.2)',
  },
  {
    id: 'sunset',
    label: 'Coucher de soleil',
    primary: '#9a3412',
    primaryDark: '#431407',
    primaryLight: '#ea580c',
    primaryGlow: 'rgba(154,52,18,0.15)',
    gold: '#facc15',
    goldLight: '#fde047',
    goldGlow: 'rgba(250,204,21,0.2)',
  },
];

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyAccentColors(color: AccentColor) {
  const root = document.documentElement;
  root.style.setProperty('--primary', color.primary);
  root.style.setProperty('--primary-dark', color.primaryDark);
  root.style.setProperty('--primary-light', color.primaryLight);
  root.style.setProperty('--primary-glow', color.primaryGlow);
  root.style.setProperty('--gold', color.gold);
  root.style.setProperty('--gold-light', color.goldLight);
  root.style.setProperty('--gold-glow', color.goldGlow);
  root.style.setProperty('--shadow-glow-primary', `0 0 20px ${color.primaryGlow}`);
  root.style.setProperty('--shadow-glow-gold', `0 0 20px ${color.goldGlow}`);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('le-guide-theme');
    return (saved === 'dark' ? 'dark' : 'light') as Theme;
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const savedId = localStorage.getItem('le-guide-accent');
    return accentPresets.find(p => p.id === savedId) || accentPresets[0];
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('le-guide-theme', theme);
  }, [theme]);

  useEffect(() => {
    applyAccentColors(accentColor);
    localStorage.setItem('le-guide-accent', accentColor.id);
  }, [accentColor]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const setAccentColor = useCallback((color: AccentColor) => {
    setAccentColorState(color);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark', accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

export default ThemeContext;
