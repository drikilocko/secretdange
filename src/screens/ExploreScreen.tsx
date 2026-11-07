import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LocalizedText as Text } from '../context/LanguageContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../data/mockData';
import { useShop } from '../context/ShopContext';

export const ExploreScreen: React.FC = () => {
    const { navigateTo, setFilterState, products } = useShop();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=85' }}
                    style={styles.hero}
                    imageStyle={styles.heroImage}
                >
                    <View style={styles.heroOverlay}>
                        <Text style={styles.eyebrow}>SECRET D’ANGE · FORMATIONS</Text>
                        <Text style={styles.heroTitle}>Apprenez une compétence. Faites-en un projet.</Text>
                        <Text style={styles.heroText}>Des guides numériques pratiques, disponibles à lire dès confirmation de votre paiement.</Text>
                        <TouchableOpacity style={styles.heroButton} onPress={() => navigateTo('shop')}>
                            <Text style={styles.heroButtonText}>VOIR LES EBOOKS</Text>
                            <Feather name="arrow-right" size={16} color="#0f172a" />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Choisir un domaine</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.filter((category) => category.id !== 'ALL').map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[styles.categoryCard, isMobile && styles.categoryCardMobile]}
                                onPress={() => {
                                    setFilterState((state) => ({ ...state, category: category.id }));
                                    navigateTo('shop');
                                }}
                            >
                                <Text style={styles.categoryName}>{category.name}</Text>
                                <Feather name="arrow-up-right" size={17} color="#6d28d9" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.headingRow}>
                        <Text style={styles.sectionTitle}>Les formations populaires</Text>
                        <TouchableOpacity onPress={() => navigateTo('shop')}>
                            <Text style={styles.seeAll}>Tout voir →</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.productGrid}>
                        {products.filter((product) => product.isBestSeller).slice(0, 3).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </View>
                </View>
                <Footer />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    content: { paddingBottom: 20 },
    hero: { minHeight: 370, justifyContent: 'center', backgroundColor: '#1e1b4b' },
    heroImage: { resizeMode: 'cover' },
    heroOverlay: { maxWidth: 680, padding: 28, gap: 12, backgroundColor: 'rgba(15, 23, 42, 0.72)' },
    eyebrow: { color: '#c4b5fd', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    heroTitle: { color: '#ffffff', fontSize: 32, fontWeight: '900', lineHeight: 39 },
    heroText: { color: '#e2e8f0', fontSize: 14, lineHeight: 22, maxWidth: 520 },
    heroButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 13, borderRadius: 12, marginTop: 4 },
    heroButtonText: { color: '#0f172a', fontSize: 12, fontWeight: '900' },
    section: { width: '100%', maxWidth: 1200, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 28 },
    sectionTitle: { color: '#0f172a', fontSize: 21, fontWeight: '900', marginBottom: 14 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    categoryCard: { flex: 1, minWidth: 190, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 16, borderRadius: 14 },
    categoryCardMobile: { minWidth: '46%' },
    categoryName: { flex: 1, color: '#334155', fontSize: 11, fontWeight: '900' },
    headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    seeAll: { color: '#6d28d9', fontSize: 12, fontWeight: '800', marginBottom: 14 },
    productGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
});
