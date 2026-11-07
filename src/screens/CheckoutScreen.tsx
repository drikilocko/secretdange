import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LocalizedText as Text, LocalizedTextInput as TextInput } from '../context/LanguageContext';
import { useShop } from '../context/ShopContext';
import { Header } from '../components/Header';
import {
    formatPayDunyaPhone,
    initiatePayDunyaCardPayment,
    initiatePayDunyaPayment,
    PAYDUNYA_COUNTRIES,
    requiresPayDunyaOtp,
    usdToXOF,
} from '../lib/paydunya';
import { getErrorMessage } from '../lib/supabase';
import { Order } from '../types';

export const CheckoutScreen: React.FC = () => {
    const {
        cart,
        cartSubtotal,
        cartTotal,
        user,
        authLoading,
        setShowAuthModal,
        placeOrder,
        confirmOrderPayment,
        formatPrice,
        navigateTo,
    } = useShop();
    const [countryId, setCountryId] = useState('TG');
    const [operatorKey, setOperatorKey] = useState('tmoney-tg');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [paymentType, setPaymentType] = useState<'card' | 'mobile'>('card');
    const [order, setOrder] = useState<Order | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const country = PAYDUNYA_COUNTRIES.find((item) => item.id === countryId) ?? PAYDUNYA_COUNTRIES[0];
    const operator = country.operators.find((item) => item.key === operatorKey) ?? country.operators[0];
    const phoneRules = {
        min: operator.minPhoneDigits ?? country.minDigits,
        max: operator.maxPhoneDigits ?? country.maxDigits,
        example: operator.phonePlaceholder ?? country.phonePlaceholder,
    };

    useEffect(() => {
        if (!authLoading && !user) setShowAuthModal(true);
    }, [authLoading, user, setShowAuthModal]);

    const handlePay = async () => {
        setError(null);
        setMessage(null);
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        if (cart.length === 0 && !order) {
            setError('Votre panier est vide. Choisissez un ebook avant de payer.');
            return;
        }
        let paymentMethod: Order['paymentMethod'] = 'card';
        let formattedPhone = '';
        if (paymentType === 'mobile') {
            formattedPhone = formatPayDunyaPhone(phone, country, operator.key) || '';
            if (!formattedPhone) {
                setError(`Saisissez un numéro valide (${phoneRules.min}${phoneRules.min === phoneRules.max ? '' : ` à ${phoneRules.max}`} chiffres, ex. ${phoneRules.example}).`);
                return;
            }
            if (requiresPayDunyaOtp(operator.key) && !otp.trim()) {
                setError('Saisissez le code de paiement demandé par votre opérateur.');
                return;
            }
            paymentMethod = operator.key === 'tmoney-tg'
                ? 'tmoney'
                : operator.key === 'flooz-tg'
                    ? 'flooz'
                    : 'paydunya';
        }

        setBusy(true);
        try {
            const currentOrder = order ?? await placeOrder(undefined, paymentMethod);
            if (!currentOrder) return;
            setOrder(currentOrder);

            if (paymentType === 'card') {
                const result = await initiatePayDunyaCardPayment(currentOrder.id, user.name);
                if (!result.success || !result.paymentUrl) {
                    throw new Error(result.error || 'Le paiement par carte n’a pas pu être démarré.');
                }
                const paymentUrl = new URL(result.paymentUrl);
                if (paymentUrl.protocol !== 'https:') {
                    throw new Error('Le lien de paiement PayDunya est invalide.');
                }
                await Linking.openURL(paymentUrl.toString());
                setMessage(`Paiement sécurisé par carte ouvert. Montant : ${result.amountXOF?.toLocaleString()} FCFA. Revenez ici après le paiement pour vérifier sa confirmation.`);
                return;
            }

            const result = await initiatePayDunyaPayment(
                currentOrder.id,
                operator.key,
                formattedPhone,
                {
                    amountXOF: usdToXOF(currentOrder.total),
                    customerName: user.name,
                    customerEmail: user.email,
                    otp: otp.trim(),
                }
            );
            if (!result.success) {
                throw new Error(result.error || 'Le paiement n’a pas pu être démarré.');
            }
            if (result.paymentUrl) {
                const paymentUrl = new URL(result.paymentUrl);
                if (paymentUrl.protocol !== 'https:') {
                    throw new Error('Le lien de paiement PayDunya est invalide.');
                }
                await Linking.openURL(paymentUrl.toString());
            }
            setMessage(`${result.message} Montant : ${result.amountXOF?.toLocaleString()} FCFA. Après validation sur votre téléphone, vérifiez le paiement ici.`);
        } catch (paymentError) {
            setError(getErrorMessage(paymentError));
        } finally {
            setBusy(false);
        }
    };

    const handleCheckPayment = async () => {
        if (!order) return;
        setBusy(true);
        setError(null);
        try {
            const status = await confirmOrderPayment(order.id);
            if (status === 'paid') {
                navigateTo('order-success');
                return;
            }
            if (status === 'failed') {
                setError('Le paiement a échoué ou a été annulé. Vous pouvez réessayer.');
                setOrder((current) => current ? { ...current, paymentStatus: 'failed' } : null);
                return;
            }
            setMessage(status === 'pending'
                ? 'Le paiement est toujours en attente. Validez la demande sur votre téléphone puis réessayez.'
                : status === 'unverified'
                    ? 'Le statut de cette ancienne commande ne peut pas être vérifié. Contactez le support avant tout nouvel achat.'
                    : 'Aucune facture de paiement n’a encore été créée. Vous pouvez relancer le paiement.');
        } catch (paymentError) {
            setError(getErrorMessage(paymentError));
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigateTo('cart')}>
                    <Feather name="arrow-left" size={17} color="#475569" />
                    <Text style={styles.backText}>Retour au panier</Text>
                </TouchableOpacity>

                <View style={styles.intro}>
                    <View style={styles.iconCircle}><Feather name="book-open" size={24} color="#ffffff" /></View>
                    <Text style={styles.title}>Paiement sécurisé</Text>
                    <Text style={styles.subtitle}>Après confirmation du paiement, vos ebooks seront disponibles dans « Mes livres ».</Text>
                </View>

                {cart.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Votre sélection</Text>
                        {cart.map((item) => (
                            <View key={item.product.id} style={styles.line}>
                                <Text style={styles.lineName}>{item.product.name}</Text>
                                <Text style={styles.linePrice}>{formatPrice(item.product.price * item.quantity)}</Text>
                            </View>
                        ))}
                        <View style={styles.separator} />
                        <View style={styles.line}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.total}>{formatPrice(cartTotal || cartSubtotal)}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Choisissez votre mode de paiement</Text>
                    <View style={styles.paymentChoices}>
                        <TouchableOpacity
                            style={[styles.paymentChoice, paymentType === 'card' && styles.paymentChoiceActive]}
                            onPress={() => setPaymentType('card')}
                        >
                            <Feather name="credit-card" size={20} color={paymentType === 'card' ? '#6d28d9' : '#64748b'} />
                            <View style={styles.choiceTextGroup}>
                                <Text style={styles.choiceTitle}>Carte bancaire</Text>
                                <Text style={styles.choiceSubtitle}>Paiement sécurisé sur PayDunya</Text>
                            </View>
                            {paymentType === 'card' && <Feather name="check-circle" size={17} color="#6d28d9" />}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.paymentChoice, paymentType === 'mobile' && styles.paymentChoiceActive]}
                            onPress={() => setPaymentType('mobile')}
                        >
                            <Feather name="smartphone" size={20} color={paymentType === 'mobile' ? '#6d28d9' : '#64748b'} />
                            <View style={styles.choiceTextGroup}>
                                <Text style={styles.choiceTitle}>Mobile Money</Text>
                                <Text style={styles.choiceSubtitle}>T-Money, Flooz et opérateurs disponibles</Text>
                            </View>
                            {paymentType === 'mobile' && <Feather name="check-circle" size={17} color="#6d28d9" />}
                        </TouchableOpacity>
                    </View>

                    {paymentType === 'mobile' ? (
                    <>
                    <Text style={styles.helper}>Choisissez votre pays et votre opérateur, puis confirmez la demande sur votre téléphone.</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
                        {PAYDUNYA_COUNTRIES.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.countryButton, countryId === item.id && styles.optionActive]}
                                onPress={() => {
                                    setCountryId(item.id);
                                    setOperatorKey(item.operators[0].key);
                                }}
                            >
                                <Text style={[styles.optionText, countryId === item.id && styles.optionTextActive]}>
                                    {item.flag} {item.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.operatorList}>
                        {country.operators.map((item) => (
                            <TouchableOpacity
                                key={item.key}
                                style={[styles.operatorButton, operatorKey === item.key && styles.optionActive]}
                                onPress={() => setOperatorKey(item.key)}
                            >
                                <Text style={[styles.optionText, operatorKey === item.key && styles.optionTextActive]}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Numéro {operator.name}</Text>
                    <View style={styles.phoneRow}>
                        <Text style={styles.prefix}>{country.dialCode}</Text>
                        <TextInput
                            style={styles.phoneInput}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholder={phoneRules.example}
                        />
                    </View>

                    {requiresPayDunyaOtp(operator.key) && (
                        <>
                            <Text style={styles.label}>Code de paiement</Text>
                            <TextInput
                                style={styles.input}
                                value={otp}
                                onChangeText={setOtp}
                                secureTextEntry
                                placeholder="Code demandé par l’opérateur"
                            />
                        </>
                    )}
                    </>
                    ) : (
                        <Text style={styles.cardInfo}>Vous serez redirigé vers la page officielle PayDunya pour saisir les informations de votre carte. Secret d’Ange ne conserve aucune donnée bancaire.</Text>
                    )}

                    <TouchableOpacity
                        style={[styles.primaryButton, busy && styles.disabledButton]}
                        onPress={handlePay}
                        disabled={busy}
                    >
                        {busy ? <ActivityIndicator color="#ffffff" /> : <Feather name="lock" size={17} color="#ffffff" />}
                        <Text style={styles.primaryButtonText}>
                            {busy
                                ? 'TRAITEMENT…'
                                : order
                                    ? 'RÉESSAYER LE PAIEMENT'
                                    : paymentType === 'card'
                                        ? 'PAYER PAR CARTE'
                                        : 'PAYER PAR MOBILE MONEY'}
                        </Text>
                    </TouchableOpacity>

                    {order && (
                        <TouchableOpacity style={styles.checkButton} onPress={handleCheckPayment} disabled={busy}>
                            <Feather name="check-circle" size={17} color="#6d28d9" />
                            <Text style={styles.checkButtonText}>J’ai payé — vérifier la confirmation</Text>
                        </TouchableOpacity>
                    )}
                    {error ? <Text style={styles.error}>{error}</Text> : null}
                    {message ? <Text style={styles.message}>{message}</Text> : null}
                </View>
                <Text style={styles.secureNote}>Les livres numériques sont délivrés uniquement après confirmation du paiement par PayDunya.</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, paddingBottom: 48 },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
    backText: { color: '#475569', fontWeight: '700' },
    intro: { alignItems: 'center', paddingVertical: 22 },
    iconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#6d28d9', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    title: { color: '#0f172a', fontSize: 26, fontWeight: '900' },
    subtitle: { color: '#64748b', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8, maxWidth: 520 },
    card: { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 20, padding: 20, marginTop: 16 },
    cardTitle: { color: '#0f172a', fontSize: 18, fontWeight: '900', marginBottom: 12 },
    helper: { color: '#64748b', fontSize: 13, lineHeight: 19, marginBottom: 14 },
    paymentChoices: { gap: 9, marginBottom: 16 },
    paymentChoice: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 13, padding: 13, backgroundColor: '#ffffff' },
    paymentChoiceActive: { borderColor: '#8b5cf6', backgroundColor: '#faf5ff' },
    choiceTextGroup: { flex: 1 },
    choiceTitle: { color: '#0f172a', fontSize: 13, fontWeight: '900' },
    choiceSubtitle: { color: '#64748b', fontSize: 11, marginTop: 3 },
    cardInfo: { color: '#475569', backgroundColor: '#f8fafc', borderRadius: 11, padding: 12, fontSize: 12, lineHeight: 18, marginBottom: 13 },
    line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginVertical: 6 },
    lineName: { flex: 1, color: '#334155', fontSize: 13, fontWeight: '600' },
    linePrice: { color: '#334155', fontWeight: '700' },
    separator: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 10 },
    totalLabel: { color: '#0f172a', fontWeight: '800', fontSize: 15 },
    total: { color: '#6d28d9', fontWeight: '900', fontSize: 20 },
    options: { gap: 8, paddingBottom: 10 },
    countryButton: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingVertical: 9, paddingHorizontal: 12 },
    optionActive: { backgroundColor: '#f3e8ff', borderColor: '#8b5cf6' },
    optionText: { color: '#475569', fontSize: 12, fontWeight: '700' },
    optionTextActive: { color: '#6d28d9' },
    operatorList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
    operatorButton: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 11, paddingVertical: 9, paddingHorizontal: 12 },
    label: { color: '#334155', fontSize: 12, fontWeight: '800', marginBottom: 7, marginTop: 3 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, marginBottom: 14, paddingHorizontal: 13, backgroundColor: '#ffffff' },
    prefix: { color: '#6d28d9', fontWeight: '800', borderRightWidth: 1, borderRightColor: '#e2e8f0', paddingRight: 12 },
    phoneInput: { flex: 1, color: '#0f172a', paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
    input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a', marginBottom: 14 },
    primaryButton: { minHeight: 50, backgroundColor: '#6d28d9', borderRadius: 14, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    disabledButton: { opacity: 0.65 },
    primaryButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '900', letterSpacing: 0.3 },
    checkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
    checkButtonText: { color: '#6d28d9', fontWeight: '800', fontSize: 13 },
    error: { color: '#dc2626', backgroundColor: '#fef2f2', padding: 12, borderRadius: 10, marginTop: 8, fontSize: 13, lineHeight: 19 },
    message: { color: '#166534', backgroundColor: '#f0fdf4', padding: 12, borderRadius: 10, marginTop: 8, fontSize: 13, lineHeight: 19 },
    secureNote: { color: '#64748b', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 18 },
});
