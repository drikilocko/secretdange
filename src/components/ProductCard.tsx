import React, { useState } from 'react';
import { View, Image, Pressable, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { LocalizedText as Text } from '../context/LanguageContext';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const {
        openProductDetail,
        isInWishlist,
        toggleWishlist,
        addToCart,
        formatPrice,
    } = useShop();

    const { width } = useWindowDimensions();
    const isLarge = width > 768;
    const [isHovered, setIsHovered] = useState(false);
    // Use percentage width for reliable 2-col mobile layout
    const cardWidthPct: any = isLarge ? '33%' : '50%';
    const isFavorite = isInWishlist(product.id);
    const showImageActions = !isLarge || isHovered;
    return (
        <Pressable
            style={[styles.cardContainer, { width: cardWidthPct }]}
            onPress={() => openProductDetail(product)}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
        >
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: product.images[0] }}
                    style={styles.productImage}
                    resizeMode="cover"
                />

                <View
                    style={[
                        styles.imageActions,
                        !showImageActions && styles.imageActionsHidden,
                        { pointerEvents: showImageActions ? 'auto' : 'none' },
                    ]}
                >
                    {product.isNewIn && (
                        <View style={styles.tagBadge}>
                            <Text style={styles.tagText}>NEW IN</Text>
                        </View>
                    )}
                    {product.originalPrice && !product.isNewIn && (
                        <View style={[styles.tagBadge, styles.saleBadge]}>
                            <Text style={styles.tagText}>
                                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.wishlistButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={18}
                            color="#111111"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickAddButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                        }}
                        activeOpacity={0.8}
                    >
                        <Feather name="plus" size={16} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Product Information */}
            <View style={styles.infoWrapper}>
                <Text style={styles.brandText}>{product.brand}</Text>
                <Text style={styles.titleText} numberOfLines={1}>
                    {product.name}
                </Text>

                {/* Price & Rating */}
                <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
                    {product.originalPrice && (
                        <Text style={styles.originalPriceText}>
                            {formatPrice(product.originalPrice)}
                        </Text>
                    )}
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#111111" />
                        <Text style={styles.ratingText}>{product.rating}</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        margin: 0,
        padding: 5,
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 0.72,
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    imageActions: {
        ...StyleSheet.absoluteFillObject,
        opacity: 1,
    },
    imageActionsHidden: {
        opacity: 0,
    },
    tagBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#111111',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    saleBadge: {
        backgroundColor: '#404040',
    },
    tagText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    wishlistButton: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 3,
    },
    quickAddButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#111111',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    infoWrapper: {
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    brandText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#737373',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    titleText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0f172a',
        marginTop: 2,
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priceText: {
        fontSize: 15,
        fontWeight: '900',
        color: '#0f172a',
    },
    originalPriceText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#737373',
        textDecorationLine: 'line-through',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginLeft: 'auto',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#111111',
    },
});
