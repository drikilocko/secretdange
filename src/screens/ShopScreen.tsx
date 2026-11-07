import React, { useMemo } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text as AppText,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { useShop } from '../context/ShopContext';
import { ThemeName, ThemePalette, useTheme } from '../context/ThemeContext';
import { Product } from '../types';
import { AuthModal } from '../components/AuthModal';

const themeChoices: { id: ThemeName; label: string; color: string }[] = [
    { id: 'light', label: 'Blanc', color: '#ffffff' },
    { id: 'dark', label: 'Noir', color: '#172829' },
    { id: 'cream', label: 'Crème', color: '#f2eadc' },
];

type BookCardProps = {
    product: Product;
    palette: ThemePalette;
    price: string;
    onPress: () => void;
    compact?: boolean;
};

const BookCard: React.FC<BookCardProps> = ({ product, palette, price, onPress, compact = false }) => (
    <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Ouvrir ${product.name}`}
        activeOpacity={0.82}
        onPress={onPress}
        style={[styles.bookCard, compact && styles.compactBookCard]}
    >
        <View style={[styles.coverFrame, compact && styles.compactCoverFrame, { backgroundColor: palette.coverFrame }]}>
            <Image source={{ uri: product.images[0] }} style={styles.coverImage} resizeMode="cover" />
            {product.isNewIn ? (
                <View style={[styles.bookTag, { backgroundColor: palette.accent }]}>
                    <Ionicons name="sparkles" size={10} color={palette.accentText} />
                    <AppText style={[styles.bookTagText, { color: palette.accentText }]}>NOUVEAU</AppText>
                </View>
            ) : null}
        </View>
        <AppText style={[styles.bookCategory, { color: palette.muted }]} numberOfLines={1}>
            {product.category}
        </AppText>
        <AppText style={[styles.bookTitle, { color: palette.text }]} numberOfLines={2}>
            {product.name}
        </AppText>
        <View style={styles.bookMetaRow}>
            <AppText style={[styles.bookPrice, { color: palette.text }]}>{price}</AppText>
            {!compact ? (
                <View style={[styles.rating, { backgroundColor: palette.surfaceAlt }]}>
                    <Ionicons name="star" size={11} color={palette.accent} />
                    <AppText style={[styles.ratingText, { color: palette.text }]}>{product.rating.toFixed(1)}</AppText>
                </View>
            ) : null}
        </View>
    </TouchableOpacity>
);

export const ShopScreen: React.FC = () => {
    const {
        products,
        filterState,
        setFilterState,
        navigateTo,
        openProductDetail,
        formatPrice,
        user,
        setShowAuthModal,
        showAuthModal,
        cartCount,
        wishlist,
        orders,
    } = useShop();
    const { width } = useWindowDimensions();
    const { theme, palette, setTheme } = useTheme();
    const { language, setLanguage } = useLanguage();
    const isDesktop = width >= 1120;
    const isTablet = width >= 720;

    const filteredProducts = useMemo(() => products.filter((product) => {
        if (filterState.category !== 'ALL' && product.category !== filterState.category) return false;
        if (filterState.searchQuery.trim()) {
            const query = filterState.searchQuery.trim().toLocaleLowerCase();
            if (![product.name, product.category, product.brand].some((value) => value.toLocaleLowerCase().includes(query))) {
                return false;
            }
        }
        if (filterState.productType !== 'ALL' && product.productType !== filterState.productType) return false;
        if (product.price > filterState.maxPrice) return false;
        return true;
    }).sort((a, b) => {
        if (filterState.sortBy === 'price-low') return a.price - b.price;
        if (filterState.sortBy === 'price-high') return b.price - a.price;
        if (filterState.sortBy === 'rating') return b.rating - a.rating;
        if (filterState.sortBy === 'newest') return Number(Boolean(b.isNewIn)) - Number(Boolean(a.isNewIn));
        return 0;
    }), [filterState, products]);

    const readingBooks = useMemo(() => {
        const catalog = new Map(products.map((product) => [product.id, product]));
        const seen = new Set<string>();
        return orders
            .filter((order) => order.paymentStatus === 'paid' && order.paymentVerified)
            .flatMap((order) => order.items
                .filter((item) => item.product.ebookStoragePath && !seen.has(item.product.id))
                .map((item) => {
                    seen.add(item.product.id);
                    return catalog.get(item.product.id) || item.product;
                }));
    }, [orders, products]);

    const recentBooks = readingBooks.length > 0
        ? readingBooks.slice(0, 5)
        : products.filter((product) => product.isBestSeller).slice(0, 5);
    const popularBooks = products.filter((product) => product.isBestSeller).slice(0, 4);
    const newBooks = filteredProducts.filter((product) => product.isNewIn);
    const displayedBooks = filterState.searchQuery || filterState.category !== 'ALL'
        ? filteredProducts
        : newBooks.length > 0
            ? newBooks
            : filteredProducts;

    const openBook = (product: Product) => openProductDetail(product);
    const chooseCategory = (categoryId: string) => {
        setFilterState((current) => ({ ...current, category: categoryId }));
    };

    const navButton = (icon: keyof typeof Feather.glyphMap, label: string, screen: 'shop' | 'account' | 'wishlist' | 'explore') => (
        <TouchableOpacity
            key={screen}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => navigateTo(screen)}
            style={[styles.railButton, { backgroundColor: screen === 'shop' ? palette.surfaceAlt : 'transparent' }]}
        >
            <Feather name={icon} size={19} color={screen === 'shop' ? palette.text : palette.muted} />
        </TouchableOpacity>
    );

    const sectionTitle = (title: string, action?: string, onAction?: () => void) => (
        <View style={styles.sectionHeading}>
            <AppText style={[styles.sectionTitle, { color: palette.text }]}>{title}</AppText>
            {action && onAction ? (
                <TouchableOpacity onPress={onAction} style={styles.showAllButton}>
                    <AppText style={[styles.showAllText, { color: palette.accent }]}>{action}</AppText>
                    <Feather name="arrow-right" size={14} color={palette.accent} />
                </TouchableOpacity>
            ) : null}
        </View>
    );

    return (
        <View style={[styles.app, { backgroundColor: palette.background }]}>
            {isDesktop ? (
                <View style={[styles.sideRail, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                    <TouchableOpacity onPress={() => navigateTo('shop')} style={styles.railBrand}>
                        <Feather name="book-open" size={23} color={palette.accent} />
                    </TouchableOpacity>
                    {navButton('grid', 'Boutique', 'shop')}
                    {navButton('book-open', 'Mes livres', 'account')}
                    {navButton('heart', 'Favoris', 'wishlist')}
                    {navButton('compass', 'Explorer', 'explore')}
                    <View style={styles.railSpacer} />
                    <TouchableOpacity onPress={() => setShowAuthModal(true)} style={styles.railButton} accessibilityLabel="Connexion">
                        <Feather name="user" size={19} color={palette.muted} />
                    </TouchableOpacity>
                </View>
            ) : null}

            <View style={styles.main}>
                <View style={[styles.topBar, !isTablet && styles.topBarMobile, { backgroundColor: palette.background, borderColor: palette.border }]}>
                    <View style={styles.topBarBrand}>
                        {!isDesktop ? <Feather name="book-open" size={21} color={palette.accent} /> : null}
                        <View>
                            <AppText style={[styles.brandName, { color: palette.text }]}>Secret d’Ange</AppText>
                            <AppText style={[styles.brandCaption, { color: palette.muted }]}>BIBLIOTHÈQUE DE FORMATIONS</AppText>
                        </View>
                    </View>

                    <View style={[styles.searchBox, !isTablet && styles.searchBoxMobile, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                        <Feather name="search" size={17} color={palette.muted} />
                        <TextInput
                            accessibilityLabel="Rechercher un ebook"
                            placeholder={language === 'fr' ? 'Rechercher un ebook…' : 'Search ebooks…'}
                            placeholderTextColor={palette.muted}
                            value={filterState.searchQuery}
                            onChangeText={(searchQuery) => setFilterState((current) => ({ ...current, searchQuery }))}
                            style={[styles.searchInput, { color: palette.text }]}
                        />
                        {filterState.searchQuery ? (
                            <TouchableOpacity onPress={() => setFilterState((current) => ({ ...current, searchQuery: '' }))}>
                                <Feather name="x" size={16} color={palette.muted} />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            accessibilityLabel="Changer la langue"
                            onPress={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                            style={[styles.headerIcon, { backgroundColor: palette.surface, borderColor: palette.border }]}
                        >
                            <AppText style={[styles.languageCode, { color: palette.text }]}>{language.toUpperCase()}</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => user ? navigateTo('account') : setShowAuthModal(true)}
                            accessibilityLabel="Mon compte"
                            style={[styles.headerIcon, { backgroundColor: palette.surface, borderColor: palette.border }]}
                        >
                            {user?.avatar ? (
                                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                            ) : (
                                <Feather name="user" size={17} color={palette.text} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigateTo('wishlist')}
                            accessibilityLabel="Mes favoris"
                            style={[styles.headerIcon, { backgroundColor: palette.surface, borderColor: palette.border }]}
                        >
                            <Feather name="heart" size={17} color={palette.text} />
                            {wishlist.length > 0 ? <View style={[styles.countBadge, { backgroundColor: palette.accent }]} /> : null}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigateTo('cart')}
                            accessibilityLabel={`Panier, ${cartCount} article(s)`}
                            style={[styles.headerIcon, { backgroundColor: palette.surface, borderColor: palette.border }]}
                        >
                            <Feather name="shopping-bag" size={17} color={palette.text} />
                            {cartCount > 0 ? <View style={[styles.countBadge, { backgroundColor: palette.accent }]} /> : null}
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingHorizontal: isTablet ? 30 : 18 }]}>
                    <View style={[styles.contentColumns, !isDesktop && styles.contentColumnsStacked]}>
                        <View style={styles.primaryColumn}>
                            <View style={[styles.welcomeRow, !isTablet && styles.welcomeRowMobile]}>
                                <View style={styles.welcomeText}>
                                    <AppText style={[styles.eyebrow, { color: palette.accent }]}>LIRE · APPRENDRE · ÉVOLUER</AppText>
                                    <AppText style={[styles.pageTitle, { color: palette.text }]}>
                                        {user ? `Bonjour ${user.name.split(' ')[0]}` : 'Votre prochaine idée commence ici.'}
                                    </AppText>
                                    <AppText style={[styles.pageIntro, { color: palette.muted }]}>
                                        Des ebooks pratiques pour faire grandir vos projets, à votre rythme.
                                    </AppText>
                                </View>
                                <TouchableOpacity
                                    onPress={() => user ? navigateTo('account') : setShowAuthModal(true)}
                                    style={[styles.profileButton, { backgroundColor: palette.surface, borderColor: palette.border }]}
                                >
                                    <Feather name="book-open" size={16} color={palette.accent} />
                                    <AppText style={[styles.profileButtonText, { color: palette.text }]}>
                                        {user ? 'Ma bibliothèque' : 'Se connecter'}
                                    </AppText>
                                </TouchableOpacity>
                            </View>

                            {sectionTitle(
                                readingBooks.length > 0 ? 'Reprendre ma lecture' : 'À découvrir',
                                'Tout voir',
                                () => readingBooks.length > 0 ? navigateTo('account') : chooseCategory('ALL'),
                            )}
                            <View style={[styles.recentPanel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookStrip}>
                                    {recentBooks.map((product) => (
                                        <BookCard
                                            key={product.id}
                                            product={product}
                                            palette={palette}
                                            price={formatPrice(product.price)}
                                            onPress={() => openBook(product)}
                                        />
                                    ))}
                                </ScrollView>
                            </View>

                            {sectionTitle('Explorer par thème')}
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.filter((category) => category.id !== 'ALL').map((category, index) => {
                                    const count = products.filter((product) => product.category === category.id).length;
                                    const active = filterState.category === category.id;
                                    const icons: (keyof typeof Feather.glyphMap)[] = ['briefcase', 'trending-up', 'pie-chart', 'sun', 'monitor'];
                                    return (
                                        <TouchableOpacity
                                            key={category.id}
                                            onPress={() => chooseCategory(active ? 'ALL' : category.id)}
                                            style={[
                                                styles.categoryCard,
                                                { backgroundColor: active ? palette.accent : palette.surfaceAlt, borderColor: active ? palette.accent : palette.border },
                                            ]}
                                        >
                                            <View style={styles.categoryTitleRow}>
                                                <AppText style={[styles.categoryName, { color: active ? palette.accentText : palette.text }]} numberOfLines={2}>
                                                    {category.name}
                                                </AppText>
                                                <AppText style={[styles.categoryCount, { color: active ? palette.accentText : palette.accent }]}>
                                                    {count}
                                                </AppText>
                                            </View>
                                            <View style={styles.categoryFoot}>
                                                <Feather name={icons[index % icons.length]} size={20} color={active ? palette.accentText : palette.muted} />
                                                <AppText style={[styles.categoryCaption, { color: active ? palette.accentText : palette.muted }]}>
                                                    {count === 1 ? 'ebook disponible' : 'ebooks disponibles'}
                                                </AppText>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {sectionTitle(
                                filterState.searchQuery || filterState.category !== 'ALL' ? 'Résultats' : 'Nouveautés',
                                filterState.category !== 'ALL' || filterState.searchQuery ? 'Effacer les filtres' : 'Voir le catalogue',
                                () => {
                                    setFilterState((current) => ({ ...current, category: 'ALL', searchQuery: '' }));
                                },
                            )}
                            {displayedBooks.length > 0 ? (
                                <View style={styles.newBooksGrid}>
                                    {displayedBooks.map((product) => (
                                        <BookCard
                                            key={product.id}
                                            product={product}
                                            palette={palette}
                                            price={formatPrice(product.price)}
                                            onPress={() => openBook(product)}
                                        />
                                    ))}
                                </View>
                            ) : (
                                <View style={[styles.emptyState, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                                    <Feather name="search" size={24} color={palette.muted} />
                                    <AppText style={[styles.emptyTitle, { color: palette.text }]}>Aucun ebook trouvé</AppText>
                                    <AppText style={[styles.emptyCopy, { color: palette.muted }]}>Essayez un autre mot ou une autre catégorie.</AppText>
                                </View>
                            )}
                        </View>

                        <View style={[styles.secondaryColumn, !isDesktop && styles.secondaryColumnStacked]}>
                            {sectionTitle('Les plus populaires', 'Voir tout', () => {
                                setFilterState((current) => ({ ...current, sortBy: 'rating', category: 'ALL' }));
                            })}
                            <View style={[styles.popularPanel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                                {popularBooks.map((product, index) => (
                                    <TouchableOpacity
                                        key={product.id}
                                        onPress={() => openBook(product)}
                                        style={[styles.popularRow, index < popularBooks.length - 1 && { borderBottomColor: palette.border, borderBottomWidth: 1 }]}
                                    >
                                        <Image source={{ uri: product.images[0] }} style={styles.popularCover} />
                                        <View style={styles.popularInfo}>
                                            <AppText style={[styles.popularName, { color: palette.text }]} numberOfLines={2}>{product.name}</AppText>
                                            <AppText style={[styles.popularCategory, { color: palette.muted }]} numberOfLines={1}>{product.category}</AppText>
                                            <View style={styles.popularRating}>
                                                <Ionicons name="star" size={11} color={palette.accent} />
                                                <AppText style={[styles.popularRatingText, { color: palette.text }]}>{product.rating.toFixed(1)}</AppText>
                                            </View>
                                        </View>
                                        <AppText style={[styles.popularPrice, { color: palette.accent }]}>{formatPrice(product.price)}</AppText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {sectionTitle('Votre espace')}
                            <View style={[styles.libraryPanel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                                <View style={[styles.libraryIcon, { backgroundColor: palette.surfaceAlt }]}>
                                    <Feather name="book-open" size={19} color={palette.accent} />
                                </View>
                                <AppText style={[styles.libraryTitle, { color: palette.text }]}>
                                    {user ? 'Vos lectures, au même endroit.' : 'Gardez vos ebooks près de vous.'}
                                </AppText>
                                <AppText style={[styles.libraryCopy, { color: palette.muted }]}>
                                    Retrouvez vos achats et reprenez chaque formation quand vous le souhaitez.
                                </AppText>
                                <TouchableOpacity
                                    onPress={() => user ? navigateTo('account') : setShowAuthModal(true)}
                                    style={[styles.libraryAction, { backgroundColor: palette.accent }]}
                                >
                                    <AppText style={[styles.libraryActionText, { color: palette.accentText }]}>
                                        {user ? 'Ouvrir ma bibliothèque' : 'Connexion / inscription'}
                                    </AppText>
                                    <Feather name="arrow-up-right" size={15} color={palette.accentText} />
                                </TouchableOpacity>
                            </View>

                            {sectionTitle('Choisir une ambiance')}
                            <View style={[styles.themePanel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                                {themeChoices.map((choice) => {
                                    const selected = theme === choice.id;
                                    return (
                                        <TouchableOpacity
                                            key={choice.id}
                                            accessibilityRole="button"
                                            accessibilityState={{ selected }}
                                            onPress={() => setTheme(choice.id)}
                                            style={[
                                                styles.themeChoice,
                                                { borderColor: selected ? palette.accent : palette.border, backgroundColor: palette.surface },
                                            ]}
                                        >
                                            <View style={[styles.themeSwatch, { backgroundColor: choice.color, borderColor: palette.border }]} />
                                            <AppText style={[styles.themeLabel, { color: palette.text }]}>{choice.label}</AppText>
                                            {selected ? <Feather name="check" size={15} color={palette.accent} /> : null}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    <View style={[styles.footerNote, { borderColor: palette.border }]}>
                        <AppText style={[styles.footerBrand, { color: palette.text }]}>Secret d’Ange</AppText>
                        <AppText style={[styles.footerCopy, { color: palette.muted }]}>Des idées utiles, à lire à votre rythme.</AppText>
                    </View>
                </ScrollView>
            </View>
            <AuthModal visible={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    app: { flex: 1, flexDirection: 'row' },
    main: { flex: 1, minWidth: 0 },
    sideRail: {
        width: 76,
        alignItems: 'center',
        paddingTop: 22,
        paddingBottom: 18,
        borderRightWidth: 1,
    },
    railBrand: { height: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
    railButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
    railSpacer: { flex: 1 },
    topBar: {
        minHeight: 82,
        paddingHorizontal: 28,
        paddingVertical: 13,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        borderBottomWidth: 1,
    },
    topBarMobile: { flexWrap: 'wrap', paddingHorizontal: 18, gap: 10 },
    topBarBrand: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 190 },
    brandName: { fontSize: 17, fontWeight: '900', letterSpacing: -0.5 },
    brandCaption: { fontSize: 8, fontWeight: '800', letterSpacing: 1.5, marginTop: 3 },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 44,
        flex: 1,
        maxWidth: 430,
        gap: 10,
    },
    searchBoxMobile: { flexBasis: '100%', maxWidth: '100%' },
    searchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    headerIcon: { width: 40, height: 40, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    languageCode: { fontSize: 10, fontWeight: '900' },
    avatar: { width: 32, height: 32, borderRadius: 16 },
    countBadge: { width: 8, height: 8, borderRadius: 4, position: 'absolute', top: 8, right: 8 },
    scrollContent: { paddingTop: 24, paddingBottom: 40 },
    contentColumns: { flexDirection: 'row', alignItems: 'flex-start', gap: 28, maxWidth: 1450, width: '100%', alignSelf: 'center' },
    contentColumnsStacked: { flexDirection: 'column' },
    primaryColumn: { flex: 1, minWidth: 0 },
    secondaryColumn: { width: 310 },
    secondaryColumnStacked: { width: '100%' },
    welcomeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 25 },
    welcomeRowMobile: { flexDirection: 'column', alignItems: 'flex-start' },
    welcomeText: { flex: 1, minWidth: 0 },
    eyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 9 },
    pageTitle: { fontSize: 26, lineHeight: 32, fontWeight: '800', letterSpacing: -0.8, maxWidth: '100%' },
    pageIntro: { fontSize: 13, lineHeight: 20, marginTop: 7, maxWidth: '100%' },
    profileButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 13 },
    profileButtonText: { fontSize: 11, fontWeight: '800' },
    sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 15 },
    sectionTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
    showAllButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5 },
    showAllText: { fontSize: 10, fontWeight: '800' },
    recentPanel: { borderWidth: 1, borderRadius: 18, padding: 14, overflow: 'hidden' },
    bookStrip: { gap: 13, paddingRight: 4 },
    bookCard: { width: 128, paddingBottom: 3 },
    compactBookCard: { width: '100%' },
    coverFrame: { width: '100%', aspectRatio: 0.72, borderRadius: 10, overflow: 'hidden', position: 'relative', marginBottom: 8 },
    compactCoverFrame: { aspectRatio: 0.75 },
    coverImage: { width: '100%', height: '100%' },
    bookTag: { position: 'absolute', top: 7, left: 7, borderRadius: 7, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 4 },
    bookTagText: { fontSize: 7, fontWeight: '900', letterSpacing: 0.4 },
    bookCategory: { fontSize: 8, fontWeight: '800', letterSpacing: 0.7, marginBottom: 4 },
    bookTitle: { fontSize: 11, lineHeight: 15, fontWeight: '800', minHeight: 30 },
    bookMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, gap: 5 },
    bookPrice: { fontSize: 11, fontWeight: '900' },
    rating: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
    ratingText: { fontSize: 9, fontWeight: '800' },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
    categoryCard: { width: '31.5%', minHeight: 82, borderWidth: 1, borderRadius: 14, padding: 12, justifyContent: 'space-between', flexGrow: 1, flexBasis: 140 },
    categoryTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 },
    categoryName: { fontSize: 10, lineHeight: 13, fontWeight: '900', flex: 1 },
    categoryCount: { fontSize: 15, fontWeight: '900' },
    categoryFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    categoryCaption: { fontSize: 8, fontWeight: '600' },
    newBooksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
    emptyState: { borderWidth: 1, borderRadius: 16, alignItems: 'center', padding: 28, gap: 8 },
    emptyTitle: { fontSize: 14, fontWeight: '800' },
    emptyCopy: { fontSize: 11, textAlign: 'center' },
    popularPanel: { borderWidth: 1, borderRadius: 17, paddingHorizontal: 12 },
    popularRow: { minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11 },
    popularCover: { width: 52, height: 68, borderRadius: 7 },
    popularInfo: { flex: 1, minWidth: 0 },
    popularName: { fontSize: 10, lineHeight: 14, fontWeight: '800' },
    popularCategory: { fontSize: 8, marginTop: 4, fontWeight: '700' },
    popularRating: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 5 },
    popularRatingText: { fontSize: 9, fontWeight: '800' },
    popularPrice: { fontSize: 9, fontWeight: '900' },
    libraryPanel: { borderWidth: 1, borderRadius: 17, padding: 17 },
    libraryIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
    libraryTitle: { fontSize: 14, lineHeight: 19, fontWeight: '900' },
    libraryCopy: { fontSize: 10, lineHeight: 16, marginTop: 7 },
    libraryAction: { borderRadius: 11, minHeight: 39, paddingHorizontal: 12, marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    libraryActionText: { fontSize: 10, fontWeight: '900' },
    themePanel: { borderWidth: 1, borderRadius: 15, padding: 8, gap: 6 },
    themeChoice: { minHeight: 37, borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
    themeSwatch: { width: 17, height: 17, borderWidth: 1, borderRadius: 6 },
    themeLabel: { fontSize: 10, fontWeight: '800', flex: 1 },
    footerNote: { maxWidth: 1450, alignSelf: 'center', width: '100%', borderTopWidth: 1, marginTop: 35, paddingTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    footerBrand: { fontSize: 12, fontWeight: '900' },
    footerCopy: { fontSize: 10 },
});
