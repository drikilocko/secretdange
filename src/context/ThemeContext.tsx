import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeName = 'light' | 'dark' | 'cream';

export type ThemePalette = {
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    muted: string;
    border: string;
    accent: string;
    accentText: string;
    coverFrame: string;
    shadow: string;
};

const THEME_STORAGE_KEY = '@secret-ange/theme';

const palettes: Record<ThemeName, ThemePalette> = {
    light: {
        background: '#f7f8f6',
        surface: '#ffffff',
        surfaceAlt: '#edf2f0',
        text: '#183332',
        muted: '#71817d',
        border: '#e3e9e5',
        accent: '#d9bc63',
        accentText: '#183332',
        coverFrame: '#edf2f0',
        shadow: '#173734',
    },
    dark: {
        background: '#101c1d',
        surface: '#172829',
        surfaceAlt: '#203738',
        text: '#edf5f1',
        muted: '#9bafaa',
        border: '#2b4141',
        accent: '#e2c76f',
        accentText: '#142323',
        coverFrame: '#203738',
        shadow: '#000000',
    },
    cream: {
        background: '#f2eadc',
        surface: '#fffaf0',
        surfaceAlt: '#e9dfcd',
        text: '#44372b',
        muted: '#8b7b68',
        border: '#e3d6c1',
        accent: '#a77c43',
        accentText: '#fffaf0',
        coverFrame: '#e9dfcd',
        shadow: '#624d35',
    },
};

type ThemeContextValue = {
    theme: ThemeName;
    palette: ThemePalette;
    setTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeName>('light');

    useEffect(() => {
        let mounted = true;
        AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
            if (mounted && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'cream')) {
                setThemeState(savedTheme);
            }
        }).catch((error: unknown) => {
            console.error('Unable to load saved theme preference', error);
        });
        return () => {
            mounted = false;
        };
    }, []);

    const setTheme = (nextTheme: ThemeName) => {
        setThemeState(nextTheme);
        AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme).catch((error: unknown) => {
            console.error('Unable to save theme preference', error);
        });
    };

    const value = useMemo(() => ({
        theme,
        palette: palettes[theme],
        setTheme,
    }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};