import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LocalizedText as Text } from '../context/LanguageContext';
import { Header } from '../components/Header';
import { useShop } from '../context/ShopContext';

export const OrderSuccessScreen: React.FC = () => {
    const { activeOrder, navigateTo } = useShop();
    const paid = activeOrder?.paymentStatus === 'paid' && activeOrder.paymentVerified;

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.successCard}>
                    <View style={styles.check}><Feather name={paid ? 'check' : 'clock'} size={32} color="#ffffff" /></View>
                    <Text style={styles.title}>{paid ? 'Paiement confirmé !' : 'Paiement en attente'}</Text>
                    <Text style={styles.subtitle}>
                        {paid
                            ? 'Votre achat est validé. Vos ebooks sont maintenant disponibles dans votre bibliothèque.'
                            : 'Nous attendons la confirmation de paiement. Vos ebooks seront accessibles dès réception.'}
                    </Text>
                    {activeOrder ? <Text style={styles.orderId}>Référence : {activeOrder.id}</Text> : null}
                </View>
                <TouchableOpacity style={styles.primaryButton} onPress={() => navigateTo(paid ? 'account' : 'shop')}>
                    <Text style={styles.primaryButtonText}>{paid ? 'OUVRIR MES LIVRES' : 'RETOURNER À LA BOUTIQUE'}</Text>
                    <Feather name={paid ? 'book-open' : 'book'} size={17} color="#ffffff" />
                </TouchableOpacity>
                {!paid && (
                    <Text style={styles.note}>Le statut de votre commande sera mis à jour après validation par PayDunya.</Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { width: '100%', maxWidth: 700, alignSelf: 'center', padding: 22, paddingTop: 54 },
    successCard: { alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 24, padding: 32 },
    check: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#6d28d9', alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
    title: { color: '#0f172a', fontSize: 25, fontWeight: '900', textAlign: 'center' },
    subtitle: { color: '#64748b', fontSize: 14, lineHeight: 22, textAlign: 'center', maxWidth: 490, marginTop: 10 },
    orderId: { color: '#6d28d9', fontSize: 12, fontWeight: '800', marginTop: 16 },
    primaryButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, backgroundColor: '#6d28d9', borderRadius: 13, paddingVertical: 15, marginTop: 18 },
    primaryButtonText: { color: '#ffffff', fontWeight: '900', fontSize: 12 },
    note: { color: '#64748b', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 14 },
});
