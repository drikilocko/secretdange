import React, { useEffect, useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { LocalizedText as Text, useLanguage, translateText } from '../context/LanguageContext';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useShop } from '../context/ShopContext';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { ProductReviews } from '../components/ProductReviews';

export const ProductDetailScreen: React.FC = () => {
    const {
        selectedProduct,
        addToCart,
        toggleWishlist,
        isInWishlist,
        formatPrice,
        navigateTo,
        products,
    } = useShop();
    const { width } = useWindowDimensions();
    const { language } = useLanguage();
    const isLargeScreen = width > 768;

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState(selectedProduct?.colors[0] || null);
    const [quantity, setQuantity] = useState(1);
    const [openAccordion, setOpenAccordion] = useState<'desc' | 'specifications' | 'shipping' | null>('desc');
    const [addedToast, setAddedToast] = useState(false);

    useEffect(() => {
        setActiveImageIndex(0);
        setSelectedColor(selectedProduct?.colors[0] || null);
        setQuantity(1);
        setAddedToast(false);
    }, [selectedProduct?.id]);

    if (!selectedProduct || !selectedColor) {
        return (
            <View style={styles.errorContainer}>
                <Header />
                <Text style={styles.errorText}>No product selected.</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigateTo('shop')}>
                    <Text style={styles.backBtnText}>Return to Shop</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isFavorite = isInWishlist(selectedProduct.id);
    const isEbook = !!selectedProduct.ebookStoragePath || selectedProduct.productType === 'Ebook de formation';

    const handleAddToCart = () => {
        addToCart(selectedProduct, selectedColor, quantity);
        setAddedToast(true);
        setTimeout(() => setAddedToast(false), 2500);
    };

    const handleBuyNow = () => {
        addToCart(selectedProduct, selectedColor, quantity);
        navigateTo('checkout');
    };

    const relatedProducts = products
        .filter((product) => product.category === selectedProduct.category && product.id !== selectedProduct.id)
        .slice(0, 3);

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity style={styles.breadcrumb} onPress={() => navigateTo('shop')}>
                    <Feather name="arrow-left" size={16} color="#475569" />
                    <Text style={styles.breadcrumbText}>
                        {language === 'fr'
                            ? `Retour aux ${translateText(selectedProduct.category, language)}`
                            : `Back to ${selectedProduct.category}`}
                    </Text>
                </TouchableOpacity>

                <View style={[styles.mainLayout, isLargeScreen && styles.mainLayoutRow]}>
                    <View style={styles.galleryContainer}>
                        <View style={styles.mainImageWrapper}>
                            <Image
                                source={{ uri: selectedProduct.images[activeImageIndex] || selectedProduct.images[0] }}
                                style={styles.mainImage}
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                style={styles.floatingWishlistBtn}
                                onPress={() => void toggleWishlist(selectedProduct.id)}
                            >
                                <Ionicons
                                    name={isFavorite ? 'heart' : 'heart-outline'}
                                    size={22}
                                    color={isFavorite ? '#ef4444' : '#0f172a'}
                                />
                            </TouchableOpacity>
                        </View>

                        {selectedProduct.images.length > 1 && (
                            <View style={styles.thumbnailRow}>
                                {selectedProduct.images.map((image, index) => (
                                    <TouchableOpacity
                                        key={image}
                                        style={[styles.thumbnailWrapper, activeImageIndex === index && styles.thumbnailActive]}
                                        onPress={() => setActiveImageIndex(index)}
                                    >
                                        <Image source={{ uri: image }} style={styles.thumbnailImage} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.detailsPanel}>
                        <Text style={styles.brandTitle}>{selectedProduct.brand}</Text>
                        <Text style={styles.productTitle}>
                            {translateText(selectedProduct.name, language)}
                        </Text>

                        <View style={styles.priceRow}>
                            <Text style={styles.priceText}>{formatPrice(selectedProduct.price)}</Text>
                            {selectedProduct.originalPrice ? (
                                <Text style={styles.originalPriceText}>
                                    {formatPrice(selectedProduct.originalPrice)}
                                </Text>
                            ) : null}
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={14} color="#111111" />
                                <Text style={styles.ratingText}>{selectedProduct.rating}</Text>
                                <Text style={styles.reviewsCount}>
                                    ({selectedProduct.reviewsCount} {language === 'fr' ? 'avis' : 'reviews'})
                                </Text>
                            </View>
                        </View>

                        {!isEbook && <View style={styles.section}>
                            <Text style={styles.sectionLabel}>
                                {language === 'fr' ? 'Couleur : ' : 'Color: '}
                                <Text style={styles.sectionLabelValue}>{translateText(selectedColor.name, language)}</Text>
                            </Text>
                            <View style={styles.colorSwatchesRow}>
                                {selectedProduct.colors.map((color) => (
                                    <TouchableOpacity
                                        key={color.name}
                                        style={[
                                            styles.colorSwatch,
                                            { backgroundColor: color.hex },
                                            selectedColor.name === color.name && styles.colorSwatchActive,
                                        ]}
                                        onPress={() => setSelectedColor(color)}
                                    />
                                ))}
                            </View>
                        </View>}

                        {!isEbook && <View style={styles.quantityRow}>
                            <View style={styles.qtyControl}>
                                <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <Feather name="minus" size={16} color="#111" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{quantity}</Text>
                                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
                                    <Feather name="plus" size={16} color="#111" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.addToBagBtn} onPress={handleAddToCart}>
                                <Text style={styles.addToBagBtnText}>
                                    {addedToast ? 'ADDED TO BAG ✓' : 'ADD TO BAG'}
                                </Text>
                            </TouchableOpacity>
                        </View>}

                        {isEbook && (
                            <View style={styles.ebookPerks}>
                                <View style={styles.ebookPerk}><Feather name="download-cloud" size={16} color="#6d28d9" /><Text style={styles.ebookPerkText}>Téléchargement après paiement</Text></View>
                                <View style={styles.ebookPerk}><Feather name="book-open" size={16} color="#6d28d9" /><Text style={styles.ebookPerkText}>Lecture dans votre espace personnel</Text></View>
                                <View style={styles.ebookPerk}><Feather name="zap" size={16} color="#6d28d9" /><Text style={styles.ebookPerkText}>Accès immédiat après confirmation</Text></View>
                            </View>
                        )}

                        <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
                            <Text style={styles.buyNowBtnText}>{isEbook ? 'ACHETER CET EBOOK' : 'BUY IT NOW'}</Text>
                        </TouchableOpacity>

                        <View style={styles.accordionsWrapper}>
                            <TouchableOpacity
                                style={styles.accordionHeader}
                                onPress={() => setOpenAccordion(openAccordion === 'desc' ? null : 'desc')}
                            >
                                <Text style={styles.accordionTitle}>Product Description</Text>
                                <Feather
                                    name={openAccordion === 'desc' ? 'chevron-up' : 'chevron-down'}
                                    size={18}
                                    color="#1e293b"
                                />
                            </TouchableOpacity>
                            {openAccordion === 'desc' && (
                                <Text style={styles.accordionBody}>
                                    {translateText(selectedProduct.description, language)}
                                </Text>
                            )}

                            <TouchableOpacity
                                style={styles.accordionHeader}
                                onPress={() => setOpenAccordion(openAccordion === 'specifications' ? null : 'specifications')}
                            >
                                <Text style={styles.accordionTitle}>Technical Specifications</Text>
                                <Feather
                                    name={openAccordion === 'specifications' ? 'chevron-up' : 'chevron-down'}
                                    size={18}
                                    color="#1e293b"
                                />
                            </TouchableOpacity>
                            {openAccordion === 'specifications' && (
                                <Text style={styles.accordionBody}>
                                    {translateText(selectedProduct.specifications, language)}
                                </Text>
                            )}

                            <TouchableOpacity
                                style={styles.accordionHeader}
                                onPress={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                            >
                                <Text style={styles.accordionTitle}>{isEbook ? 'Accès après achat' : 'Free Delivery &amp; 30-Day Returns'}</Text>
                                <Feather
                                    name={openAccordion === 'shipping' ? 'chevron-up' : 'chevron-down'}
                                    size={18}
                                    color="#1e293b"
                                />
                            </TouchableOpacity>
                            {openAccordion === 'shipping' && (
                                <Text style={styles.accordionBody}>
                                    {isEbook
                                        ? 'Après confirmation du paiement, retrouvez votre livre dans « Mon compte » > « Mes livres » pour le lire ou télécharger le PDF.'
                                        : language === 'fr'
                                        ? `Livraison express gratuite dès ${formatPrice(100)}. Livraison standard sous 2 à 4 jours ouvrés. Les retours sont acceptés sous 30 jours après réception.`
                                        : `Free Express Delivery on orders over ${formatPrice(100)}. Standard delivery 2-4 business days. Returns are accepted within 30 days of receipt.`}
                                </Text>
                            )}
                        </View>

                        <ProductReviews product={selectedProduct} />
                    </View>
                </View>

                {relatedProducts.length > 0 && (
                    <View style={styles.recommendationsContainer}>
                        <Text style={styles.recommendationsTitle}>You Might Also Like</Text>
                        <View style={styles.relatedGrid}>
                            {relatedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </View>
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
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    errorText: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 20,
    },
    backBtn: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#111111',
        borderRadius: 12,
    },
    backBtnText: {
        color: '#ffffff',
        fontWeight: '700',
    },
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    breadcrumbText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
    },
    mainLayout: {
        gap: 32,
    },
    mainLayoutRow: {
        flexDirection: 'row',
    },
    galleryContainer: {
        flex: 1,
    },
    mainImageWrapper: {
        width: '100%',
        height: 480,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#f1f5f9',
        position: 'relative',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    floatingWishlistBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    thumbnailRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    thumbnailWrapper: {
        width: 70,
        height: 70,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    thumbnailActive: {
        borderColor: '#8b72e6',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    detailsPanel: {
        flex: 1,
    },
    brandTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#8b72e6',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    productTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0f172a',
        marginTop: 4,
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    priceText: {
        fontSize: 26,
        fontWeight: '900',
        color: '#0f172a',
    },
    originalPriceText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#94a3b8',
        textDecorationLine: 'line-through',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#d4d4d4',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        marginLeft: 'auto',
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#111111',
    },
    reviewsCount: {
        fontSize: 12,
        color: '#525252',
    },
    section: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: '#334155',
        marginBottom: 10,
    },
    sectionLabelValue: {
        color: '#8b72e6',
    },
    colorSwatchesRow: {
        flexDirection: 'row',
        gap: 12,
    },
    colorSwatch: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    colorSwatchActive: {
        borderColor: '#8b72e6',
        transform: [{ scale: 1.15 }],
    },
    quantityRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        paddingHorizontal: 8,
    },
    qtyBtn: {
        padding: 10,
    },
    qtyText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0f172a',
        paddingHorizontal: 12,
    },
    addToBagBtn: {
        flex: 1,
        backgroundColor: '#111111',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    addToBagBtnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    ebookPerks: {
        gap: 10,
        backgroundColor: '#f5f3ff',
        borderRadius: 16,
        padding: 15,
        marginBottom: 16,
    },
    ebookPerk: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },
    ebookPerkText: {
        color: '#4c1d95',
        fontSize: 12,
        fontWeight: '700',
    },
    buyNowBtn: {
        backgroundColor: '#111111',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        marginBottom: 24,
    },
    buyNowBtnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    accordionsWrapper: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        marginBottom: 28,
    },
    accordionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    accordionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#0f172a',
    },
    accordionBody: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
        paddingBottom: 16,
    },
    recommendationsContainer: {
        marginTop: 48,
    },
    recommendationsTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 16,
    },
    relatedGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
});
