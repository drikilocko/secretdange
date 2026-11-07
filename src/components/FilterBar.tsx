import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LocalizedText as Text } from '../context/LanguageContext';
import { useShop } from '../context/ShopContext';
import { CATEGORIES } from '../data/mockData';

interface FilterBarProps {
    onToggleCompactView?: () => void;
    isCompactView?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onToggleCompactView, isCompactView }) => {
    const { filterState, setFilterState } = useShop();
    const sortOptions: { key: typeof filterState.sortBy; label: string }[] = [
        { key: 'featured', label: 'À la une' },
        { key: 'newest', label: 'Nouveautés' },
        { key: 'price-low', label: 'Prix croissant' },
        { key: 'price-high', label: 'Prix décroissant' },
        { key: 'rating', label: 'Mieux notés' },
    ];
    const nextSort = () => {
        const index = sortOptions.findIndex((option) => option.key === filterState.sortBy);
        const option = sortOptions[(index + 1) % sortOptions.length];
        setFilterState((state) => ({ ...state, sortBy: option.key }));
    };
    const selectedSort = sortOptions.find((option) => option.key === filterState.sortBy) ?? sortOptions[0];

    return (
        <View style={styles.container}>
            <View style={styles.headingRow}>
                <View>
                    <Text style={styles.title}>Nos ebooks de formation</Text>
                    <Text style={styles.subtitle}>Des connaissances concrètes pour passer à l’action.</Text>
                </View>
                {onToggleCompactView && (
                    <TouchableOpacity style={styles.viewButton} onPress={onToggleCompactView}>
                        <Feather name={isCompactView ? 'grid' : 'layout'} size={17} color="#6d28d9" />
                    </TouchableOpacity>
                )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {CATEGORIES.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[styles.chip, filterState.category === category.id && styles.chipActive]}
                        onPress={() => setFilterState((state) => ({ ...state, category: category.id }))}
                    >
                        <Text style={[styles.chipText, filterState.category === category.id && styles.chipTextActive]}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.sortChip} onPress={nextSort}>
                    <Feather name="sliders" size={13} color="#6d28d9" />
                    <Text style={styles.sortText}>{selectedSort.label}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginVertical: 22 },
    headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
    title: { color: '#0f172a', fontSize: 22, fontWeight: '900' },
    subtitle: { color: '#64748b', fontSize: 12, marginTop: 4 },
    viewButton: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center' },
    chips: { gap: 8, paddingRight: 8, alignItems: 'center' },
    chip: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff' },
    chipActive: { backgroundColor: '#6d28d9', borderColor: '#6d28d9' },
    chipText: { color: '#475569', fontSize: 10, fontWeight: '800' },
    chipTextActive: { color: '#ffffff' },
    sortChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#f3e8ff' },
    sortText: { color: '#6d28d9', fontSize: 10, fontWeight: '800' },
});
