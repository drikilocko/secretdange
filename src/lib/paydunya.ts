import {
    FunctionsFetchError,
    FunctionsHttpError,
    FunctionsRelayError,
} from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface PayDunyaOperator {
    key: string;
    name: string;
    short: string;
    color: string;
    textColor?: string;
    minPhoneDigits?: number;
    maxPhoneDigits?: number;
    phonePlaceholder?: string;
}

export interface PayDunyaCountry {
    id: string;
    name: string;
    flag: string;
    dialCode: string;
    phonePlaceholder: string;
    minDigits: number;
    maxDigits: number;
    operators: PayDunyaOperator[];
}

export const PAYDUNYA_COUNTRIES: PayDunyaCountry[] = [
    {
        id: 'TG', name: 'Togo', flag: '🇹🇬', dialCode: '+228',
        phonePlaceholder: '90 12 34 56', minDigits: 8, maxDigits: 8,
        operators: [
            { key: 'tmoney-tg', name: 'T-Money', short: 'TM', color: '#eab308', textColor: '#000' },
            { key: 'flooz-tg', name: 'Moov Flooz', short: 'FL', color: '#3b82f6', textColor: '#fff' },
        ],
    },
    {
        id: 'SN', name: 'Sénégal', flag: '🇸🇳', dialCode: '+221',
        phonePlaceholder: '77 123 45 67', minDigits: 9, maxDigits: 9,
        operators: [
            { key: 'orange-sn', name: 'Orange Money', short: 'OM', color: '#f97316', textColor: '#fff' },
            { key: 'expresso-sn', name: 'Expresso', short: 'EX', color: '#dc2626', textColor: '#fff' },
            { key: 'wave-sn', name: 'Wave Sénégal', short: 'WV', color: '#06b6d4', textColor: '#fff' },
            { key: 'free-sn', name: 'Free Money', short: 'FR', color: '#ef4444', textColor: '#fff' },
            { key: 'djamo-sn', name: 'Djamo', short: 'DJ', color: '#111827', textColor: '#fff' },
        ],
    },
    {
        id: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', dialCode: '+225',
        phonePlaceholder: '07 12 34 56 78', minDigits: 10, maxDigits: 10,
        operators: [
            { key: 'orange-ci', name: 'Orange Money', short: 'OM', color: '#f97316', textColor: '#fff' },
            { key: 'mtn-ci', name: 'MTN MoMo', short: 'MTN', color: '#eab308', textColor: '#000' },
            { key: 'moov-ci', name: 'Moov Money', short: 'MV', color: '#3b82f6', textColor: '#fff' },
            { key: 'wave-ci', name: 'Wave Côte d’Ivoire', short: 'WV', color: '#06b6d4', textColor: '#fff' },
            { key: 'djamo-ci', name: 'Djamo', short: 'DJ', color: '#111827', textColor: '#fff' },
        ],
    },
    {
        id: 'BF', name: 'Burkina Faso', flag: '🇧🇫', dialCode: '+226',
        phonePlaceholder: '70 12 34 56', minDigits: 8, maxDigits: 8,
        operators: [
            { key: 'orange-bf', name: 'Orange Money', short: 'OM', color: '#f97316', textColor: '#fff' },
            { key: 'moov-bf', name: 'Moov Money', short: 'MV', color: '#3b82f6', textColor: '#fff' },
        ],
    },
    {
        id: 'ML', name: 'Mali', flag: '🇲🇱', dialCode: '+223',
        phonePlaceholder: '70 12 34 56', minDigits: 8, maxDigits: 8,
        operators: [
            { key: 'orange-ml', name: 'Orange Money', short: 'OM', color: '#f97316', textColor: '#fff' },
        ],
    },
    {
        id: 'BJ', name: 'Bénin', flag: '🇧🇯', dialCode: '+229',
        phonePlaceholder: '97 12 34 56', minDigits: 8, maxDigits: 10,
        operators: [
            { key: 'moov-bj', name: 'Moov Money', short: 'MV', color: '#3b82f6', textColor: '#fff', minPhoneDigits: 8, maxPhoneDigits: 10, phonePlaceholder: '99 66 78 08' },
            { key: 'celtiis-bj', name: 'Celtiis Cash', short: 'CC', color: '#16a34a', textColor: '#fff', minPhoneDigits: 10, maxPhoneDigits: 10, phonePlaceholder: '01 40 00 00 00' },
        ],
    },
    {
        id: 'CM', name: 'Cameroun', flag: '🇨🇲', dialCode: '+237',
        phonePlaceholder: '6 70 00 00 00', minDigits: 9, maxDigits: 9,
        operators: [
            { key: 'mtn-cm', name: 'MTN Cameroun', short: 'MTN', color: '#eab308', textColor: '#000' },
        ],
    },
];

export function getPayDunyaPhoneRules(country: PayDunyaCountry, operatorKey?: string) {
    const operator = country.operators.find((item) => item.key === operatorKey);
    return {
        minDigits: operator?.minPhoneDigits ?? country.minDigits,
        maxDigits: operator?.maxPhoneDigits ?? country.maxDigits,
        placeholder: operator?.phonePlaceholder ?? country.phonePlaceholder,
    };
}

export function formatPayDunyaPhone(phone: string, country: PayDunyaCountry, operatorKey?: string): string | null {
    const digits = phone.replace(/\D/g, '');
    const dialDigits = country.dialCode.replace(/\D/g, '');
    const localDigits = digits.startsWith(dialDigits) ? digits.slice(dialDigits.length) : digits;
    const { minDigits, maxDigits } = getPayDunyaPhoneRules(country, operatorKey);

    if (localDigits.length < minDigits || localDigits.length > maxDigits) {
        return null;
    }

    return `${dialDigits}${localDigits}`;
}

export function requiresPayDunyaOtp(operatorKey: string): boolean {
    return operatorKey === 'orange-ci' || operatorKey === 'orange-bf';
}

export interface PayDunyaInvoiceResult {
    success: boolean;
    message?: string;
    amountXOF?: number;
    invoiceToken?: string;
    paymentUrl?: string;
    error?: string;
}

async function callEdgeFunction(
    fnName: string,
    body: Record<string, unknown>
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
    try {
        const { data, error } = await supabase.functions.invoke(fnName, { body });

        if (error instanceof FunctionsHttpError) {
            try {
                const responseBody = await error.context.json() as { error?: unknown };
                if (typeof responseBody.error === 'string') {
                    return { data: null, error: responseBody.error };
                }
            } catch {
                return {
                    data: null,
                    error: `Le service de paiement a répondu avec une erreur (HTTP ${error.context.status}).`,
                };
            }
            return {
                data: null,
                error: `Le service de paiement a répondu avec une erreur (HTTP ${error.context.status}).`,
            };
        }

        if (error instanceof FunctionsFetchError || error instanceof FunctionsRelayError) {
            return {
                data: null,
                error: 'Impossible de joindre le service de paiement. Vérifiez votre connexion et que la fonction Supabase paydunya-checkout est déployée.',
            };
        }

        if (error) {
            return { data: null, error: error.message };
        }

        return { data: data as Record<string, unknown>, error: null };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { data: null, error: 'Impossible de joindre le service de paiement. Vérifiez votre connexion. (' + msg + ')' };
    }
}

export async function initiatePayDunyaPayment(
    orderId: string,
    operatorKey: string,
    paymentPhone: string,
    extra?: { amountXOF?: number; customerName?: string; customerEmail?: string; otp?: string },
    retryCount: number = 0
): Promise<PayDunyaInvoiceResult> {
    const paymentMethod = operatorKey === 'tmoney-tg'
        ? 'tmoney'
        : operatorKey === 'flooz-tg'
            ? 'flooz'
            : 'paydunya';
    const body = { orderId, operatorKey, paymentMethod, paymentPhone, ...extra };
    const { data, error } = await callEdgeFunction('paydunya-checkout', body);

    if (error) {
        // Handle PayDunya "Session invalide" - retry once with fresh token
        if (error.includes('Session invalide') && retryCount === 0) {
            console.log('PayDunya session expired, retrying...');
            return initiatePayDunyaPayment(orderId, operatorKey, paymentPhone, extra, retryCount + 1);
        }
        return { success: false, error };
    }

    if (typeof data?.message !== 'string' || typeof data?.amountXOF !== 'number') {
        return {
            success: false,
            error: 'Le service de paiement a renvoye une reponse invalide.',
        };
    }

    return {
        success: true,
        message: data.message,
        amountXOF: data.amountXOF as number,
        invoiceToken: typeof data.invoiceToken === 'string' ? data.invoiceToken : undefined,
        paymentUrl: typeof data.paymentUrl === 'string' ? data.paymentUrl : undefined,
    };
}

export async function initiatePayDunyaCardPayment(
    orderId: string,
    customerName: string
): Promise<PayDunyaInvoiceResult> {
    const { data, error } = await callEdgeFunction('paydunya-checkout', {
        action: 'card-checkout',
        orderId,
        customerName,
    });
    if (error) return { success: false, error };
    if (
        typeof data?.message !== 'string'
        || typeof data.amountXOF !== 'number'
        || typeof data.paymentUrl !== 'string'
        || typeof data.invoiceToken !== 'string'
    ) {
        return { success: false, error: 'Le service de paiement par carte a renvoyé une réponse invalide.' };
    }
    return {
        success: true,
        message: data.message,
        amountXOF: data.amountXOF,
        invoiceToken: data.invoiceToken,
        paymentUrl: data.paymentUrl,
    };
}

export async function checkPayDunyaOrderStatus(orderId: string): Promise<{ success: boolean; status?: 'initiating' | 'paid' | 'pending' | 'failed' | 'unverified'; error?: string }> {
    const { data, error } = await callEdgeFunction('paydunya-checkout', {
        action: 'check-order-status',
        orderId,
    });
    if (error) return { success: false, error };
    if (
        data?.status !== 'initiating'
        && data?.status !== 'paid'
        && data?.status !== 'pending'
        && data?.status !== 'failed'
        && data?.status !== 'unverified'
    ) {
        return { success: false, error: 'Le service de paiement a renvoyé un statut invalide.' };
    }
    return { success: true, status: data.status };
}

export function isValidTogoMobileNumber(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    const localNumber = digits.startsWith('228') && digits.length === 11
        ? digits.slice(3)
        : digits;
    return /^\d{8}$/.test(localNumber);
}

/**
 * Convertit un montant USD en XOF (FCFA)
 * 1 USD = 600 FCFA
 */
export function usdToXOF(amountUSD: number): number {
    return Math.round(amountUSD * 600);
}
