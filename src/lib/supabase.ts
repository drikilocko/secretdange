import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env as Record<string, string | undefined>).EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = (process.env as Record<string, string | undefined>).EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Supabase is not configured. Set the EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
    },
});

export const getErrorMessage = (error: unknown): string => {
    if (
        typeof error === 'object'
        && error !== null
        && 'message' in error
        && typeof error.message === 'string'
        && /(?:orders.*payment_(?:status|verified)|payment_(?:status|verified).*orders)/i.test(error.message)
    ) {
        return 'La base Supabase doit être mise à jour. Exécutez supabase/migrations/20261106000000_add_ebook_payment_status.sql dans l’éditeur SQL Supabase, puis actualisez la page.';
    }
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
        return error.message;
    }
    return String(error);
};

export const isExpiredJwtError = (error: unknown): boolean => {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'PGRST301') {
        return true;
    }

    const message = getErrorMessage(error).toLowerCase();
    return /\b(?:jwt|token|session)\b.*\b(?:expired|invalid)\b/.test(message)
        || /\b(?:expired|invalid)\b.*\b(?:jwt|token|session)\b/.test(message);
};
