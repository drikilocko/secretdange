import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LocalizedText as Text, useLanguage } from '../context/LanguageContext';
import { Feather } from '@expo/vector-icons';
import { useShop } from '../context/ShopContext';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';

export const WishlistScreen: React.FC = () => {
    const { products, wishlist, navigateTo } = useShop();
    const { language } = useLanguage();

    const favoriteProducts = (products ?? []).filter((p) => wishlist.includes(p.id));

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.topHeader}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigateTo('shop')}>
                        <Feather name="arrow-left" size={16} color="#475569" />
                        <Text style={styles.backBtnText}>Continue Shopping</Text>
                    </TouchableOpacity>
                    <Text style={styles.pageTitle}>
                        {language === 'fr' ? `Favoris enregistrés (${favoriteProducts.length})` : `Saved Wishlist (${favoriteProducts.length})`}
                    </Text>
                </View>

                {favoriteProducts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Feather name="heart" size={54} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
                        <Text style={styles.emptySub}>
                            Tap the heart icon on any product to save it here for later!
                        </Text>
                        <TouchableOpacity style={styles.shopBtn} onPress={() => navigateTo('shop')}>
                            <Text style={styles.shopBtnText}>DISCOVER CATALOG</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.gridContainer}>
                        {favoriteProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    backBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        backgroundColor: '#f8fafc',
        borderRadius: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
        marginTop: 16,
        marginBottom: 6,
    },
    emptySub: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 20,
    },
    shopBtn: {
        backgroundColor: '#111111',
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 14,
    },
    shopBtnText: {
        color: '#ffffff',
        fontWeight: '900',
        fontSize: 13,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
});
