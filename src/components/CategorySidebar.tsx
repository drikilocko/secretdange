import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { LocalizedText as Text } from '../context/LanguageContext';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '../data/mockData';
import { useShop } from '../context/ShopContext';

export const CategorySidebar: React.FC = () => {
    const { filterState, setFilterState, navigateTo, activeScreen } = useShop();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const handleSelectCategory = (categoryId: string) => {
        setFilterState((prev) => ({ ...prev, category: categoryId }));
        if (activeScreen !== 'shop') navigateTo('shop');
    };

    return (
        <View style={isMobile ? styles.containerMobile : styles.container}>
            <ScrollView
                horizontal={isMobile}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={isMobile ? styles.scrollContentMobile : styles.scrollContent}
            >
                {CATEGORIES.map((cat) => {
                    const isActive = filterState.category === cat.id;

                    // HOME item style
                    if (cat.id === 'ALL') {
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.itemBase, isMobile ? styles.itemBaseMobile : null, styles.itemHome, isActive && styles.itemHomeActive]}
                                onPress={() => handleSelectCategory(cat.id)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.homeText}>{cat.name}</Text>
                                {!isMobile && <Feather name="home" size={16} color="#1e293b" />}
                            </TouchableOpacity>
                        );
                    }

                    // NEW IN item style (purple highlighted pill)
                    if (cat.id === 'NEW IN') {
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.itemBase, isMobile ? styles.itemBaseMobile : null, styles.itemNewIn, isActive && styles.itemNewInActive]}
                                onPress={() => handleSelectCategory(cat.id)}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.newInText}>{cat.name}</Text>
                                {!isMobile && <Feather name="zap" size={16} color="#ffffff" />}
                            </TouchableOpacity>
                        );
                    }

                    // Regular category with image thumbnail
                    return (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.itemBase, isMobile ? styles.itemBaseMobile : null, styles.itemRegular, isActive && styles.itemRegularActive]}
                            onPress={() => handleSelectCategory(cat.id)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.regularText, isActive && styles.regularTextActive]}>
                                {cat.name}
                            </Text>
                            {!isMobile && cat.thumbnail && (
                                <Image source={{ uri: cat.thumbnail }} style={styles.categoryImage} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 210,
        paddingRight: 16,
    },
    containerMobile: {
        width: '100%',
        marginBottom: 4,
    },
    scrollContent: {
        gap: 10,
        paddingVertical: 4,
    },
    scrollContentMobile: {
        gap: 8,
        paddingHorizontal: 2,
        paddingVertical: 2,
        alignItems: 'center',
    },
    itemBase: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        backgroundColor: '#f8fafc',
    },
    itemBaseMobile: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        flexShrink: 0,
    },
    itemHome: {
        backgroundColor: '#f1f5f9',
    },
    itemHomeActive: {
        backgroundColor: '#e2e8f0',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    homeText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: 0.5,
    },
    itemNewIn: {
        backgroundColor: '#8b72e6', // Purple Highlight from screenshot
        shadowColor: '#8b72e6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    itemNewInActive: {
        backgroundColor: '#7c5dfa',
        borderWidth: 1.5,
        borderColor: '#ffffff',
    },
    newInText: {
        fontSize: 13,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    itemRegular: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    itemRegularActive: {
        backgroundColor: '#ffffff',
        borderColor: '#8b72e6',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    regularText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#334155',
        letterSpacing: 0.5,
    },
    regularTextActive: {
        color: '#8b72e6',
    },
    categoryImage: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#e2e8f0',
    },
});
