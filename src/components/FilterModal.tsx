import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LocalizedText as Text } from '../context/LanguageContext';
import { Feather } from '@expo/vector-icons';
import { useShop } from '../context/ShopContext';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
}

const PRICE_LIMITS = [100, 300, 500, 1000, 2000];

export const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose }) => {
    const { products, filterState, setFilterState, resetFilters, formatPrice } = useShop();
    const productTypes = ['ALL', ...new Set(products.map((product) => product.productType).filter(Boolean) as string[])];
    const colors = ['ALL', ...new Set(products.flatMap((product) => product.colors.map((color) => color.name)))];

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Filters & Refinements</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Feather name="x" size={20} color="#111111" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Max Price Cap */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Maximum price:</Text>
                            <Text style={styles.sectionTitle}>{formatPrice(filterState.maxPrice)}</Text>
                            <View style={styles.priceRow}>
                                {PRICE_LIMITS.map((price) => (
                                    <TouchableOpacity
                                        key={price}
                                        style={[
                                            styles.priceChip,
                                            filterState.maxPrice === price && styles.priceChipActive,
                                        ]}
                                        onPress={() =>
                                            setFilterState((prev) => ({ ...prev, maxPrice: price }))
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                filterState.maxPrice === price && styles.chipTextActive,
                                            ]}
                                        >
                                            {formatPrice(price)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Product Types */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Product Type</Text>
                            <View style={styles.chipGrid}>
                                {productTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.chip,
                                            filterState.productType === type && styles.chipActive,
                                        ]}
                                        onPress={() =>
                                            setFilterState((prev) => ({ ...prev, productType: type }))
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                filterState.productType === type && styles.chipTextActive,
                                            ]}
                                        >
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Colors */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Color</Text>
                            <View style={styles.chipGrid}>
                                {colors.map((col) => (
                                    <TouchableOpacity
                                        key={col}
                                        style={[
                                            styles.chip,
                                            filterState.selectedColor === col && styles.chipActive,
                                        ]}
                                        onPress={() =>
                                            setFilterState((prev) => ({ ...prev, selectedColor: col }))
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                filterState.selectedColor === col && styles.chipTextActive,
                                            ]}
                                        >
                                            {col}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.clearBtn} onPress={resetFilters}>
                            <Text style={styles.clearBtnText}>Reset All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
                            <Text style={styles.applyBtnText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: '85%',
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111111',
    },
    closeButton: {
        padding: 6,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },
    content: {
        paddingVertical: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#262626',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    priceRow: {
        flexDirection: 'row',
        gap: 8,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#d4d4d4',
    },
    chipActive: {
        backgroundColor: '#111111',
        borderColor: '#111111',
    },
    priceChip: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 14,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#d4d4d4',
    },
    priceChipActive: {
        backgroundColor: '#111111',
        borderColor: '#111111',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#525252',
    },
    chipTextActive: {
        color: '#ffffff',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5',
    },
    clearBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    clearBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#525252',
    },
    applyBtn: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: '#111111',
        alignItems: 'center',
    },
    applyBtnText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#ffffff',
    },
});
