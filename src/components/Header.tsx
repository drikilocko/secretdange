import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, FlatList, useWindowDimensions, Image } from 'react-native';
import { LocalizedText as Text, LocalizedTextInput as TextInput, useLanguage } from '../context/LanguageContext';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useShop } from '../context/ShopContext';
import { CURRENCIES } from '../data/mockData';
import { AuthModal } from './AuthModal';

export const Header: React.FC<{ overlay?: boolean }> = ({ overlay = false }) => {
    const { language, setLanguage } = useLanguage();
    const {
        cartCount,
        wishlist,
        currency,
        setCurrencyCode,
        navigateTo,
        activeScreen,
        filterState,
        setFilterState,
        user,
        backendError,
        clearBackendError,
        showAuthModal,
        setShowAuthModal,
    } = useShop();

    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const { width } = useWindowDimensions();
    const isMobile = width < 480;
    const isSmall = width < 380;

    return (
        <View style={[styles.headerContainer, overlay && styles.overlayHeader]}>
            <View style={styles.topRow}>
                {/* Brand Logo */}
                {!isMobile && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigateTo('shop')}
                        style={styles.logoContainer}
                    >
                        <Text style={[styles.logoText, overlay && styles.overlayLogoText, isSmall && styles.logoTextSmall]}>
                            Secret d’Ange
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Desktop Search Input Bar */}
                {!isMobile && (
                    <View style={[styles.searchBoxDesktop, overlay && styles.overlaySearchBox]}>
                        <Feather name="search" size={18} color={overlay ? '#ffffff' : '#888888'} style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, overlay && styles.overlayText]}
                            placeholder={language === 'fr' ? 'Rechercher une formation…' : 'Search training ebooks…'}
                            placeholderTextColor={overlay ? '#d4d4d4' : '#999999'}
                            value={filterState.searchQuery}
                            onChangeText={(text) => {
                                setFilterState((prev) => ({ ...prev, searchQuery: text }));
                                if (activeScreen !== 'shop') navigateTo('shop');
                            }}
                        />
                        {filterState.searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
                            >
                                <Feather name="x" size={16} color={overlay ? '#ffffff' : '#888888'} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Action Controls Right */}
                <View style={styles.actionsContainer}>
                    <View style={[styles.languageSwitcher, overlay && styles.overlayLanguageSwitcher]}>
                        {(['en', 'fr'] as const).map((option) => (
                            <TouchableOpacity
                                key={option}
                                accessibilityRole="button"
                                onPress={() => {
                                    setLanguage(option);
                                    if (option === 'fr' && currency.code === 'USD') {
                                        setCurrencyCode('FCFA');
                                    }
                                }}
                                style={[
                                    styles.languageOption,
                                    overlay && styles.overlayLanguageOption,
                                    language === option && styles.languageOptionActive,
                                    overlay && language === option && styles.overlayLanguageOptionActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.languageOptionText,
                                        overlay && styles.overlayText,
                                        language === option && styles.languageOptionTextActive,
                                        overlay && language === option && styles.overlayLanguageOptionTextActive,
                                    ]}
                                >
                                    {option.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* User Profile / Auth Button */}
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            overlay && styles.overlayIconButton,
                            user && styles.userIconButtonActive,
                            overlay && user && styles.overlayUserIconButtonActive,
                        ]}
                        onPress={() => {
                            if (user) {
                                navigateTo('account');
                            } else {
                                setShowAuthModal(true);
                            }
                        }}
                        activeOpacity={0.7}
                        accessibilityLabel={language === 'fr' ? 'Mon compte et mes livres' : 'My account and books'}
                    >
                        {user && activeScreen !== 'shop' && !overlay ? (
                            <Image
                                source={{
                                    uri:
                                        user.avatar ||
                                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                                }}
                                style={styles.userAvatarHeader}
                            />
                        ) : (
                            <Feather name="user" size={18} color={overlay ? '#ffffff' : '#111111'} />
                        )}
                    </TouchableOpacity>

                    {/* Wishlist Heart Icon */}
                    <TouchableOpacity
                        style={[styles.iconButton, overlay && styles.overlayIconButton]}
                        onPress={() => navigateTo('wishlist')}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={wishlist.length > 0 ? 'heart' : 'heart-outline'}
                            size={20}
                            color={overlay ? '#ffffff' : '#111111'}
                        />
                        {wishlist.length > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{wishlist.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Shopping Cart Bag Icon */}
                    <TouchableOpacity
                        style={[styles.iconButton, overlay && styles.overlayIconButton]}
                        onPress={() => navigateTo('cart')}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`Shopping cart, ${cartCount} items`}
                    >
                        <View style={styles.cartIconWrapper}>
                            <Feather name="shopping-cart" size={19} color={overlay ? '#ffffff' : '#111111'} />
                            {cartCount > 0 && (
                                <View style={styles.cartCountBadge}>
                                    <Text style={styles.cartCountBadgeText}>{cartCount}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>

                    {user?.role === 'admin' && (
                        <TouchableOpacity
                            style={[
                                styles.adminButton,
                                overlay && styles.overlayAdminButton,
                                activeScreen === 'admin' && styles.adminButtonActive,
                            ]}
                            onPress={() => navigateTo(activeScreen === 'admin' ? 'shop' : 'admin')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="shield-checkmark" size={15} color={overlay || activeScreen === 'admin' ? '#ffffff' : '#111111'} />
                            {!isMobile && (
                                <Text
                                    style={[
                                        styles.adminButtonText,
                                        overlay && styles.overlayText,
                                        activeScreen === 'admin' && styles.adminButtonTextActive,
                                    ]}
                                >
                                    ADMIN
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Currency Switcher Dropdown */}
                    {!isSmall && (
                        <TouchableOpacity
                            style={[styles.currencyButton, overlay && styles.overlayCurrencyButton]}
                            onPress={() => setShowCurrencyModal(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.currencyText, overlay && styles.overlayText]}>{currency.code}</Text>
                            <Feather name="chevron-down" size={12} color={overlay ? '#ffffff' : '#111111'} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {backendError ? (
                <View style={styles.backendErrorBanner}>
                    <Text style={styles.backendErrorText}>{backendError}</Text>
                    <TouchableOpacity onPress={clearBackendError} accessibilityLabel="Dismiss error">
                        <Feather name="x" size={18} color="#111111" />
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* Mobile Search Input Bar (Full Width Row 2) */}
            {isMobile && (
                <View style={[styles.searchBoxMobile, overlay && styles.overlaySearchBoxMobile]}>
                    <Feather name="search" size={18} color={overlay ? '#ffffff' : '#888888'} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, overlay && styles.overlayText]}
                        placeholder={language === 'fr' ? 'Rechercher une formation…' : 'Search training ebooks…'}
                        placeholderTextColor={overlay ? '#d4d4d4' : '#999999'}
                        value={filterState.searchQuery}
                        onChangeText={(text) => {
                            setFilterState((prev) => ({ ...prev, searchQuery: text }));
                            if (activeScreen !== 'shop') navigateTo('shop');
                        }}
                    />
                    {filterState.searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
                        >
                            <Feather name="x" size={16} color={overlay ? '#ffffff' : '#888888'} />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Currency Select Modal */}
            <Modal
                visible={showCurrencyModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCurrencyModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCurrencyModal(false)}
                >
                    <View style={styles.currencyDropdownMenu}>
                        <Text style={styles.dropdownTitle}>Select Currency</Text>
                        <FlatList
                            data={CURRENCIES}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.currencyOption,
                                        currency.code === item.code && styles.currencyOptionActive,
                                    ]}
                                    onPress={() => {
                                        setCurrencyCode(item.code);
                                        setShowCurrencyModal(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.currencyOptionText,
                                            currency.code === item.code && styles.currencyOptionTextActive,
                                        ]}
                                    >
                                        {item.code} ({item.symbol})
                                    </Text>
                                    {currency.code === item.code && (
                                        <Feather name="check" size={16} color="#111111" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Auth Login / Register Modal */}
            <AuthModal
                visible={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
        paddingHorizontal: 16,
        paddingVertical: 12,
        zIndex: 10,
    },
    overlayHeader: {
        backgroundColor: 'rgba(0,0,0,0.12)',
        borderBottomWidth: 0,
        overflow: 'hidden',
    },
    overlayText: {
        color: '#ffffff',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    backendErrorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        backgroundColor: '#f5f5f5',
        borderColor: '#d4d4d4',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 10,
    },
    backendErrorText: {
        flex: 1,
        color: '#111111',
        fontSize: 12,
        fontWeight: '600',
    },
    logoContainer: {
        paddingRight: 8,
    },
    logoText: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.5,
        color: '#000000',
    },
    overlayLogoText: {
        color: '#ffffff',
    },
    logoTextSmall: {
        fontSize: 17,
    },
    searchBoxDesktop: {
        flex: 1,
        maxWidth: 480,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: '#d4d4d4',
    },
    overlaySearchBox: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderColor: 'rgba(255,255,255,0.55)',
    },
    searchBoxMobile: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#d4d4d4',
    },
    overlaySearchBoxMobile: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderColor: 'rgba(255,255,255,0.55)',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: '#111111',
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    languageSwitcher: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        padding: 2,
        marginRight: 4,
    },
    overlayLanguageSwitcher: {
        backgroundColor: 'rgba(255,255,255,0.16)',
    },
    languageOption: {
        paddingHorizontal: 7,
        paddingVertical: 5,
        borderRadius: 14,
    },
    languageOptionActive: {
        backgroundColor: '#111111',
    },
    overlayLanguageOptionActive: {
        backgroundColor: '#ffffff',
    },
    overlayLanguageOption: {
        backgroundColor: 'transparent',
    },
    languageOptionText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#525252',
    },
    languageOptionTextActive: {
        color: '#ffffff',
    },
    overlayLanguageOptionTextActive: {
        color: '#111111',
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        position: 'relative',
    },
    overlayIconButton: {
        backgroundColor: 'rgba(255,255,255,0.16)',
    },
    userIconButtonActive: {
        borderWidth: 2,
        borderColor: '#111111',
    },
    overlayUserIconButtonActive: {
        borderColor: '#ffffff',
    },
    userAvatarHeader: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#111111',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 9,
        fontWeight: '700',
    },
    cartIconWrapper: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    cartCountBadge: {
        position: 'absolute',
        top: -4,
        right: -5,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        paddingHorizontal: 3,
        backgroundColor: '#111111',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ffffff',
    },
    cartCountBadgeText: {
        color: '#ffffff',
        fontSize: 9,
        fontWeight: '800',
    },
    adminButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#d4d4d4',
    },
    overlayAdminButton: {
        backgroundColor: 'rgba(255,255,255,0.16)',
        borderColor: 'rgba(255,255,255,0.55)',
    },
    adminButtonActive: {
        backgroundColor: '#111111',
        borderColor: '#111111',
    },
    adminButtonText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#111111',
    },
    adminButtonTextActive: {
        color: '#ffffff',
    },
    currencyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
    },
    overlayCurrencyButton: {
        backgroundColor: 'rgba(255,255,255,0.16)',
    },
    currencyText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111111',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 65,
        paddingRight: 16,
    },
    currencyDropdownMenu: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        width: 180,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    dropdownTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#737373',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    currencyOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    currencyOptionActive: {
        backgroundColor: '#f5f5f5',
    },
    currencyOptionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#262626',
    },
    currencyOptionTextActive: {
        color: '#111111',
        fontWeight: '700',
    },
});
