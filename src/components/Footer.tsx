import React from 'react';
import { StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LocalizedText as Text } from '../context/LanguageContext';
import { useShop } from '../context/ShopContext';

type FooterProps = {
    horizontalBleed?: number;
};

const serviceHighlights = [
    'Des ebooks conçus pour apprendre des compétences utiles',
    'Paiement mobile simple et sécurisé',
    'Lecture et téléchargement depuis votre bibliothèque',
];

export const Footer: React.FC<FooterProps> = ({ horizontalBleed = 0 }) => {
    const { navigateTo, setFilterState } = useShop();
    const { width } = useWindowDimensions();
    const isMobile = width < 600;
    const year = new Date().getFullYear();

    const openCategory = (category: string) => {
        setFilterState((previous) => ({ ...previous, category }));
        navigateTo('shop');
    };

    const linkColumn = (
        title: string,
        links: { label: string; onPress: () => void }[],
    ) => (
        <View style={[styles.linkColumn, isMobile && styles.linkColumnMobile]}>
            <Text style={styles.columnTitle}>{title}</Text>
            {links.map((link) => (
                <TouchableOpacity
                    key={link.label}
                    accessibilityRole="button"
                    onPress={link.onPress}
                    style={styles.linkButton}
                    activeOpacity={0.7}
                >
                    <Text style={styles.linkText}>{link.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View style={[styles.footer, horizontalBleed > 0 && { marginHorizontal: -horizontalBleed }]}>
            <LinearGradient
                colors={['#17112b', '#080611']}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.content}>
                <View style={[styles.serviceRow, isMobile && styles.serviceRowMobile]}>
                    {serviceHighlights.map((label) => (
                        <View key={label} style={styles.serviceItem}>
                            <Text style={styles.serviceText}>{label}</Text>
                        </View>
                    ))}
                </View>

                <View style={[styles.mainGrid, isMobile && styles.mainGridMobile]}>
                    <View style={[styles.brandColumn, isMobile && styles.brandColumnMobile]}>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Accueil Secret d’Ange"
                            onPress={() => navigateTo('shop')}
                            activeOpacity={0.8}
                            style={styles.brandLockup}
                        >
                            <Text style={styles.brandName}>Secret d’Ange</Text>
                        </TouchableOpacity>
                        <Text style={styles.brandDescription}>
                            Des formations pratiques en ebook pour apprendre à votre rythme et faire avancer vos projets.
                        </Text>
                    </View>

                    {linkColumn('La bibliothèque', [
                        { label: 'Tous les ebooks', onPress: () => navigateTo('shop') },
                        { label: 'Explorer', onPress: () => navigateTo('explore') },
                        { label: 'Entrepreneuriat', onPress: () => openCategory('ENTREPRENEURIAT') },
                        { label: 'Marketing digital', onPress: () => openCategory('MARKETING DIGITAL') },
                    ])}

                    {linkColumn('Mon espace', [
                        { label: 'Mon compte', onPress: () => navigateTo('account') },
                        { label: 'Mes favoris', onPress: () => navigateTo('wishlist') },
                        { label: 'Mon panier', onPress: () => navigateTo('cart') },
                    ])}
                </View>

                <View style={[styles.bottomBar, isMobile && styles.bottomBarMobile]}>
                    <Text style={styles.copyright}>© {year} Secret d’Ange. Tous droits réservés.</Text>
                    <Text style={styles.bottomNote}>Apprendre aujourd’hui, progresser demain.</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        backgroundColor: '#080808',
        marginTop: 52,
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 20,
    },
    content: {
        width: '100%',
        maxWidth: 1200,
        alignSelf: 'center',
    },
    serviceRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
        paddingBottom: 26,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    serviceRowMobile: {
        flexDirection: 'column',
        gap: 14,
    },
    serviceItem: {
        flex: 1,
        minWidth: 210,
        paddingRight: 12,
    },
    serviceText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
        flexShrink: 1,
        fontFamily: 'Montserrat_500Medium',
        lineHeight: 19,
    },
    mainGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
        paddingVertical: 32,
    },
    mainGridMobile: {
        gap: 26,
        paddingVertical: 28,
    },
    brandColumn: {
        width: '34%',
        minWidth: 230,
        paddingRight: 20,
    },
    brandColumnMobile: {
        width: '100%',
        paddingRight: 0,
    },
    brandLockup: {
        alignSelf: 'flex-start',
    },
    brandName: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 0.2,
        fontFamily: 'Montserrat_800ExtraBold',
    },
    brandDescription: {
        color: '#bdbdbd',
        fontSize: 12,
        lineHeight: 20,
        marginTop: 14,
        maxWidth: 310,
        fontFamily: 'Montserrat_400Regular',
    },
    linkColumn: {
        flex: 1,
        minWidth: 145,
    },
    linkColumnMobile: {
        flexBasis: '44%',
        flexGrow: 1,
    },
    columnTitle: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 14,
        fontFamily: 'Montserrat_700Bold',
    },
    linkButton: {
        alignSelf: 'flex-start',
        paddingVertical: 5,
    },
    linkText: {
        color: '#bdbdbd',
        fontSize: 12,
        fontWeight: '500',
        fontFamily: 'Montserrat_500Medium',
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#333333',
        paddingTop: 17,
    },
    bottomBarMobile: {
        flexDirection: 'column',
    },
    copyright: {
        color: '#a6a6a6',
        fontSize: 10,
        fontFamily: 'Montserrat_400Regular',
    },
    bottomNote: {
        color: '#a6a6a6',
        fontSize: 10,
        fontFamily: 'Montserrat_400Regular',
    },
});
