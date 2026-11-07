import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LocalizedText as Text } from '../context/LanguageContext';
import { useShop } from '../context/ShopContext';
import { Header } from '../components/Header';

export const CartScreen: React.FC = () => {
    const { cart, removeFromCart, cartSubtotal, formatPrice, navigateTo } = useShop();
    const { width } = useWindowDimensions();
    const isLarge = width >= 900;

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.back} onPress={() => navigateTo('shop')}>
                    <Feather name="arrow-left" size={16} color="#475569" />
                    <Text style={styles.backText}>Continuer mes achats</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Mon panier ({cart.length})</Text>

                {cart.length === 0 ? (
                    <View style={styles.empty}>
                        <Feather name="book-open" size={44} color="#a78bfa" />
                        <Text style={styles.emptyTitle}>Votre panier est vide</Text>
                        <Text style={styles.emptyText}>Parcourez nos ebooks de formation pour commencer.</Text>
                        <TouchableOpacity style={styles.primaryButton} onPress={() => navigateTo('shop')}>
                            <Text style={styles.primaryButtonText}>DÉCOUVRIR LES EBOOKS</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={[styles.layout, isLarge && styles.layoutRow]}>
                        <View style={styles.items}>
                            {cart.map((item) => (
                                <View key={item.product.id} style={styles.item}>
                                    <Image source={{ uri: item.product.images[0] }} style={styles.cover} />
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.category}>{item.product.category}</Text>
                                        <Text style={styles.name}>{item.product.name}</Text>
                                        <Text style={styles.format}>Ebook PDF · Quantité {item.quantity}</Text>
                                        <Text style={styles.price}>{formatPrice(item.product.price * item.quantity)}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => removeFromCart(item.product.id, item.selectedColor.name)}
                                        accessibilityLabel={`Retirer ${item.product.name} du panier`}
                                    >
                                        <Feather name="trash-2" size={17} color="#b91c1c" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                        <View style={styles.summary}>
                            <Text style={styles.summaryTitle}>Récapitulatif</Text>
                            <View style={styles.summaryLine}>
                                <Text style={styles.summaryLabel}>Sous-total</Text>
                                <Text style={styles.summaryValue}>{formatPrice(cartSubtotal)}</Text>
                            </View>
                            <View style={styles.summaryLine}>
                                <Text style={styles.summaryLabel}>Livraison numérique</Text>
                                <Text style={styles.free}>GRATUITE</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.summaryLine}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.total}>{formatPrice(cartSubtotal)}</Text>
                            </View>
                            <Text style={styles.accessNote}>Vos livres seront ajoutés à « Mes livres » après confirmation du paiement.</Text>
                            <TouchableOpacity style={styles.primaryButton} onPress={() => navigateTo('checkout')}>
                                <Text style={styles.primaryButtonText}>PASSER AU PAIEMENT</Text>
                                <Feather name="arrow-right" size={17} color="#ffffff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { width: '100%', maxWidth: 1100, alignSelf: 'center', padding: 20, paddingBottom: 48 },
    back: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8 },
    backText: { color: '#475569', fontWeight: '700', fontSize: 13 },
    title: { color: '#0f172a', fontSize: 26, fontWeight: '900', marginBottom: 18 },
    empty: { alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 22, padding: 34 },
    emptyTitle: { color: '#0f172a', fontSize: 18, fontWeight: '900', marginTop: 12 },
    emptyText: { color: '#64748b', fontSize: 13, textAlign: 'center', marginTop: 5 },
    layout: { gap: 16 },
    layoutRow: { flexDirection: 'row', alignItems: 'flex-start' },
    items: { flex: 1, gap: 10 },
    item: { flexDirection: 'row', gap: 13, alignItems: 'center', padding: 13, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16 },
    cover: { width: 76, height: 100, borderRadius: 9, backgroundColor: '#ede9fe' },
    itemInfo: { flex: 1 },
    category: { color: '#7c3aed', fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
    name: { color: '#0f172a', fontSize: 14, fontWeight: '800', marginTop: 4 },
    format: { color: '#64748b', fontSize: 11, marginTop: 5 },
    price: { color: '#0f172a', fontSize: 14, fontWeight: '900', marginTop: 8 },
    removeButton: { padding: 9, borderRadius: 9, backgroundColor: '#fef2f2' },
    summary: { width: '100%', maxWidth: 330, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 18, padding: 18 },
    summaryTitle: { color: '#0f172a', fontSize: 17, fontWeight: '900', marginBottom: 14 },
    summaryLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginVertical: 6 },
    summaryLabel: { color: '#64748b', fontSize: 13 },
    summaryValue: { color: '#334155', fontWeight: '700', fontSize: 13 },
    free: { color: '#15803d', fontSize: 11, fontWeight: '900' },
    divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 11 },
    totalLabel: { color: '#0f172a', fontSize: 15, fontWeight: '900' },
    total: { color: '#6d28d9', fontSize: 19, fontWeight: '900' },
    accessNote: { color: '#64748b', fontSize: 11, lineHeight: 17, marginTop: 9 },
    primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#6d28d9', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 15, marginTop: 15 },
    primaryButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '900' },
});
