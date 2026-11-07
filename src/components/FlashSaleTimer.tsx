import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LocalizedText as Text, useLanguage } from '../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { useShop } from '../context/ShopContext';

export const FlashSaleTimer: React.FC = () => {
    const { applyPromoCode, appliedPromo, formatPrice } = useShop();
    const { language } = useLanguage();
    const { width } = useWindowDimensions();
    const isMobile = width < 480;
    const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 32, seconds: 15 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                }
                return { hours: 0, minutes: 0, seconds: 0 };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDigit = (num: number) => (num < 10 ? `0${num}` : `${num}`);

    return (
        <View style={[styles.container, isMobile && styles.containerMobile]}>
            <View style={styles.leftRow}>
                <Ionicons name="flame" size={14} color="#ffffff" />
                <Text style={[styles.saleText, isMobile && styles.saleTextMobile]} numberOfLines={1}>
                    <Text style={styles.boldText}>
                        {language === 'fr' ? 'OFFRE SPÉCIALE SECRET D’ANGE :' : 'SECRET D’ANGE SPECIAL OFFER:'}
                    </Text>
                    {` ${formatPrice(20)} ${language === 'fr' ? 'DE RÉDUCTION' : 'OFF'}`}
                </Text>
            </View>

            <View style={styles.rightRow}>
                <Text style={styles.endsLabel}>{language === 'fr' ? 'FIN DANS :' : 'ENDS IN:'}</Text>
                <View style={styles.timeBox}>
                    <Text style={styles.timeDigit}>{formatDigit(timeLeft.hours)}</Text>
                </View>
                <Text style={styles.colon}>:</Text>
                <View style={styles.timeBox}>
                    <Text style={styles.timeDigit}>{formatDigit(timeLeft.minutes)}</Text>
                </View>
                <Text style={styles.colon}>:</Text>
                <View style={styles.timeBox}>
                    <Text style={styles.timeDigit}>{formatDigit(timeLeft.seconds)}</Text>
                </View>

                <TouchableOpacity
                    style={styles.claimBtn}
                    onPress={() => applyPromoCode('PAPY20')}
                >
                    <Text style={styles.claimBtnText}>
                        {appliedPromo === 'PAPY20'
                            ? (language === 'fr' ? 'CODE UTILISÉ ✓' : 'CODE APPLIED ✓')
                            : (language === 'fr' ? 'UTILISER PAPY20' : 'USE PAPY20')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#111111',
        paddingHorizontal: 14,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
    },
    containerMobile: {
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        flexShrink: 1,
        overflow: 'hidden',
    },
    saleText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '500',
        flexShrink: 1,
    },
    saleTextMobile: {
        fontSize: 10,
    },
    boldText: {
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    rightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    endsLabel: {
        color: '#d4d4d4',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
        marginRight: 4,
    },
    timeBox: {
        backgroundColor: '#262626',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#404040',
    },
    timeDigit: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
    },
    colon: {
        color: '#ffffff',
        fontWeight: '900',
        fontSize: 12,
    },
    claimBtn: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
        marginLeft: 8,
    },
    claimBtnText: {
        color: '#111111',
        fontWeight: '900',
        fontSize: 11,
    },
});
