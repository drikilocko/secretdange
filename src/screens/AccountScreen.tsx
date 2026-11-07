import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LocalizedText as Text, useLanguage } from '../context/LanguageContext';
import { Header } from '../components/Header';
import { useShop } from '../context/ShopContext';
import { Order, Product } from '../types';
import { getErrorMessage } from '../lib/supabase';

type AccountTab = 'profile' | 'library' | 'orders' | 'settings';

type PurchasedBook = {
    product: Product;
    orderId: string;
};

const isEbookOrder = (order: Order) =>
    order.items.length > 0 && order.items.every((item) => Boolean(item.product.ebookStoragePath));

export const AccountScreen: React.FC = () => {
    const {
        user,
        logout,
        orders,
        navigateTo,
        openBook,
        getEbookUrl,
        confirmOrderPayment,
        formatPrice,
        currency,
        setCurrencyCode,
    } = useShop();
    const [activeTab, setActiveTab] = useState<AccountTab>('library');
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [paymentCheckError, setPaymentCheckError] = useState<string | null>(null);
    const checkedPaymentOrders = useRef(new Set<string>());
    const { language, setLanguage } = useLanguage();

    useEffect(() => {
        orders
            .filter((order) => (
                isEbookOrder(order)
                &&
                (order.paymentStatus === 'pending' || order.paymentStatus === 'initiating')
                && ['card', 'paydunya', 'tmoney', 'flooz'].includes(order.paymentMethod)
            ))
            .forEach((order) => {
                if (checkedPaymentOrders.current.has(order.id)) return;
                checkedPaymentOrders.current.add(order.id);
                void confirmOrderPayment(order.id).catch((error: unknown) => {
                    setPaymentCheckError(getErrorMessage(error));
                });
            });
    }, [orders, confirmOrderPayment]);

    const purchasedBooks = useMemo(() => {
        const books: PurchasedBook[] = [];
        const seen = new Set<string>();
        orders
            .filter((order) => isEbookOrder(order) && order.paymentStatus === 'paid' && order.paymentVerified)
            .forEach((order) => order.items.forEach((item) => {
                if (!seen.has(item.product.id)) {
                    seen.add(item.product.id);
                    books.push({ product: item.product, orderId: order.id });
                }
            }));
        return books;
    }, [orders]);

    const ebookOrders = useMemo(() => orders.filter(isEbookOrder), [orders]);
    const tabs: { id: AccountTab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
        { id: 'library', label: `MES LIVRES (${purchasedBooks.length})`, icon: 'book-open' },
        { id: 'orders', label: `ACHATS (${ebookOrders.length})`, icon: 'credit-card' },
        { id: 'profile', label: 'MON PROFIL', icon: 'user' },
        { id: 'settings', label: 'PARAMÈTRES', icon: 'settings' },
    ];

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' }}
                        style={styles.avatar}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>{user?.name || 'Lecteur'}</Text>
                        <Text style={styles.email}>{user?.email}</Text>
                        <Text style={styles.accessNote}>Vos formations achetées, accessibles à vie.</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={() => void logout()}>
                        <Feather name="log-out" size={16} color="#b91c1c" />
                        <Text style={styles.logoutText}>DÉCONNEXION</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tabs}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Feather name={tab.icon} size={15} color={activeTab === tab.id ? '#ffffff' : '#64748b'} />
                            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {activeTab === 'library' && (
                    <View style={styles.section}>
                        <Text style={styles.heading}>Ma bibliothèque</Text>
                        <Text style={styles.sectionIntro}>Les livres apparaissent ici dès que le paiement est confirmé.</Text>
                        {paymentCheckError ? <Text style={styles.downloadError}>{paymentCheckError}</Text> : null}
                        {purchasedBooks.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Feather name="book" size={35} color="#a78bfa" />
                                <Text style={styles.emptyTitle}>Votre bibliothèque est vide</Text>
                                <Text style={styles.emptyText}>Choisissez une formation et retrouvez-la ici après le paiement.</Text>
                                <TouchableOpacity style={styles.primaryButton} onPress={() => navigateTo('shop')}>
                                    <Text style={styles.primaryButtonText}>DÉCOUVRIR LES EBOOKS</Text>
                                    <Feather name="arrow-right" size={16} color="#ffffff" />
                                </TouchableOpacity>
                            </View>
                        ) : purchasedBooks.map(({ product, orderId }) => (
                            <View key={product.id} style={styles.bookCard}>
                                <Image source={{ uri: product.images[0] }} style={styles.cover} />
                                <View style={styles.bookInfo}>
                                    <Text style={styles.bookCategory}>{product.category}</Text>
                                    <Text style={styles.bookTitle}>{product.name}</Text>
                                    <Text style={styles.bookFormat}>Ebook PDF · Accès à vie</Text>
                                    <View style={styles.bookActions}>
                                        <TouchableOpacity style={styles.readButton} onPress={() => openBook(product, orderId)}>
                                            <Feather name="book-open" size={15} color="#ffffff" />
                                            <Text style={styles.readButtonText}>LIRE</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.downloadButton}
                                            onPress={async () => {
                                                setDownloadError(null);
                                                try {
                                                    const url = await getEbookUrl(orderId, product.id, true);
                                                    await Linking.openURL(url);
                                                } catch (error) {
                                                    setDownloadError(getErrorMessage(error));
                                                }
                                            }}
                                        >
                                            <Feather name="download" size={15} color="#6d28d9" />
                                            <Text style={styles.downloadButtonText}>TÉLÉCHARGER</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {downloadError ? <Text style={styles.downloadError}>{downloadError}</Text> : null}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'orders' && (
                    <View style={styles.section}>
                        <Text style={styles.heading}>Historique des achats</Text>
                        {ebookOrders.length === 0 ? (
                            <Text style={styles.sectionIntro}>Aucun achat d’ebook pour le moment.</Text>
                        ) : ebookOrders.map((order) => (
                            <View key={order.id} style={styles.orderCard}>
                                <View style={styles.orderTop}>
                                    <View>
                                        <Text style={styles.orderNumber}>Achat {order.id}</Text>
                                        <Text style={styles.orderDate}>{order.date}</Text>
                                    </View>
                                    <View style={[styles.status, order.paymentStatus === 'paid' ? styles.paid : order.paymentStatus === 'failed' ? styles.failed : order.paymentStatus === 'unverified' ? styles.unverified : styles.pending]}>
                                        <Text style={styles.statusText}>
                                            {order.paymentStatus === 'paid'
                                                ? 'PAYÉ'
                                                : order.paymentStatus === 'failed'
                                                    ? 'ÉCHOUÉ'
                                                    : order.paymentStatus === 'unverified'
                                                        ? 'NON VÉRIFIÉ'
                                                        : order.paymentStatus === 'initiating'
                                                            ? 'À FINALISER'
                                                            : 'EN ATTENTE'}
                                        </Text>
                                    </View>
                                </View>
                                {order.items.map((item) => (
                                    <View key={item.product.id} style={styles.orderItem}>
                                        <Text style={styles.orderItemName}>{item.product.name}</Text>
                                        <Text style={styles.orderItemPrice}>{formatPrice(item.product.price * item.quantity)}</Text>
                                    </View>
                                ))}
                                <View style={styles.orderTotal}>
                                    <Text style={styles.orderTotalLabel}>Total</Text>
                                    <Text style={styles.orderTotalPrice}>{formatPrice(order.total)}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'profile' && (
                    <View style={styles.section}>
                        <Text style={styles.heading}>Mon profil</Text>
                        <View style={styles.profileDetail}>
                            <Text style={styles.detailLabel}>Nom</Text>
                            <Text style={styles.detailValue}>{user?.name}</Text>
                        </View>
                        <View style={styles.profileDetail}>
                            <Text style={styles.detailLabel}>Adresse e-mail</Text>
                            <Text style={styles.detailValue}>{user?.email}</Text>
                        </View>
                        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigateTo('shop')}>
                            <Text style={styles.secondaryButtonText}>PARCOURIR LES FORMATIONS</Text>
                            <Feather name="arrow-right" size={16} color="#6d28d9" />
                        </TouchableOpacity>
                    </View>
                )}

                {activeTab === 'settings' && (
                    <View style={styles.section}>
                        <Text style={styles.heading}>Préférences</Text>
                        <Text style={styles.sectionIntro}>Langue de l’application</Text>
                        <View style={styles.settingRow}>
                            {(['fr', 'en'] as const).map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[styles.settingButton, language === option && styles.settingButtonActive]}
                                    onPress={() => {
                                        setLanguage(option);
                                        if (option === 'fr' && currency.code === 'USD') setCurrencyCode('FCFA');
                                    }}
                                >
                                    <Text style={[styles.settingButtonText, language === option && styles.settingButtonTextActive]}>
                                        {option === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { width: '100%', maxWidth: 1000, alignSelf: 'center', padding: 20, paddingBottom: 48 },
    profileCard: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 14, padding: 18, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' },
    avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#ede9fe' },
    profileInfo: { flex: 1, minWidth: 180 },
    name: { color: '#0f172a', fontSize: 20, fontWeight: '900' },
    email: { color: '#64748b', fontSize: 13, marginTop: 3 },
    accessNote: { color: '#6d28d9', fontSize: 12, fontWeight: '700', marginTop: 6 },
    logoutButton: { flexDirection: 'row', gap: 7, alignItems: 'center', padding: 10, borderRadius: 11, backgroundColor: '#fef2f2' },
    logoutText: { color: '#b91c1c', fontSize: 11, fontWeight: '900' },
    tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 18 },
    tab: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' },
    tabActive: { backgroundColor: '#6d28d9', borderColor: '#6d28d9' },
    tabText: { color: '#475569', fontSize: 11, fontWeight: '800' },
    tabTextActive: { color: '#ffffff' },
    section: { backgroundColor: '#ffffff', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    heading: { color: '#0f172a', fontSize: 21, fontWeight: '900' },
    sectionIntro: { color: '#64748b', fontSize: 13, lineHeight: 20, marginTop: 6, marginBottom: 16 },
    emptyState: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 12 },
    emptyTitle: { color: '#0f172a', fontSize: 17, fontWeight: '900', marginTop: 12 },
    emptyText: { color: '#64748b', textAlign: 'center', fontSize: 13, lineHeight: 20, maxWidth: 400, marginTop: 6 },
    primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#6d28d9', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, marginTop: 18 },
    primaryButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '900' },
    bookCard: { flexDirection: 'row', gap: 15, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    cover: { width: 92, height: 124, borderRadius: 10, backgroundColor: '#ede9fe' },
    bookInfo: { flex: 1, justifyContent: 'center' },
    bookCategory: { color: '#7c3aed', fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
    bookTitle: { color: '#0f172a', fontSize: 16, fontWeight: '900', marginTop: 4 },
    bookFormat: { color: '#64748b', fontSize: 12, marginTop: 5 },
    bookActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 13 },
    readButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#6d28d9', borderRadius: 9, paddingVertical: 9, paddingHorizontal: 12 },
    readButtonText: { color: '#ffffff', fontSize: 11, fontWeight: '900' },
    downloadButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f3e8ff', borderRadius: 9, paddingVertical: 9, paddingHorizontal: 12 },
    downloadButtonText: { color: '#6d28d9', fontSize: 11, fontWeight: '900' },
    downloadError: { color: '#b91c1c', fontSize: 11, marginTop: 8 },
    orderCard: { marginTop: 14, padding: 15, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' },
    orderTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
    orderNumber: { color: '#0f172a', fontWeight: '900', fontSize: 13 },
    orderDate: { color: '#94a3b8', fontSize: 11, marginTop: 3 },
    status: { paddingVertical: 6, paddingHorizontal: 9, borderRadius: 20 },
    paid: { backgroundColor: '#dcfce7' },
    pending: { backgroundColor: '#fef3c7' },
    failed: { backgroundColor: '#fee2e2' },
    unverified: { backgroundColor: '#e2e8f0' },
    statusText: { color: '#334155', fontWeight: '900', fontSize: 9 },
    orderItem: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 6 },
    orderItemName: { flex: 1, color: '#475569', fontSize: 12 },
    orderItemPrice: { color: '#475569', fontWeight: '700', fontSize: 12 },
    orderTotal: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10, marginTop: 5 },
    orderTotalLabel: { color: '#0f172a', fontWeight: '800' },
    orderTotalPrice: { color: '#6d28d9', fontWeight: '900' },
    profileDetail: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    detailLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '800' },
    detailValue: { color: '#0f172a', fontSize: 14, fontWeight: '700', marginTop: 4 },
    secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#c4b5fd', borderRadius: 12, padding: 13, marginTop: 18 },
    secondaryButtonText: { color: '#6d28d9', fontSize: 12, fontWeight: '900' },
    settingRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    settingButton: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 11, paddingVertical: 11, paddingHorizontal: 14 },
    settingButtonActive: { backgroundColor: '#f3e8ff', borderColor: '#8b5cf6' },
    settingButtonText: { color: '#475569', fontSize: 13, fontWeight: '700' },
    settingButtonTextActive: { color: '#6d28d9' },
});
