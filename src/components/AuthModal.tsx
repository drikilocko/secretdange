import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { LocalizedText as Text, LocalizedTextInput as TextInput, useLanguage } from '../context/LanguageContext';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useShop } from '../context/ShopContext';
import { getErrorMessage } from '../lib/supabase';

interface AuthModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
    const { loginWithGoogle, loginWithEmail, signupWithEmail } = useShop();
    const { language } = useLanguage();

    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async () => {
        setError('');
        if (!email || !password) {
            setError(language === 'fr' ? 'Renseignez votre e-mail et votre mot de passe.' : 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'signup') {
                if (!name) {
                    setError(language === 'fr' ? 'Saisissez votre nom complet.' : 'Please enter your full name.');
                    return;
                }
                const hasSession = await signupWithEmail(name, email, password);
                if (!hasSession) {
                    setError(language === 'fr' ? 'Confirmez votre compte avec le lien reçu par e-mail, puis connectez-vous.' : 'Check your email to confirm your account, then log in.');
                    return;
                }
            } else {
                await loginWithEmail(email, password);
            }
            onClose();
        } catch (submitError) {
            setError(getErrorMessage(submitError));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            onClose();
        } catch (signInError) {
            setError(getErrorMessage(signInError));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity style={styles.modalCard} activeOpacity={1}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.brandTitle}>SECRET D’ANGE</Text>
                            <Text style={styles.modalTitle}>
                                {mode === 'login'
                                    ? (language === 'fr' ? 'Connectez-vous' : 'Welcome Back!')
                                    : (language === 'fr' ? 'Créer un compte' : 'Create Your Account')}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Feather name="x" size={20} color="#111111" />
                        </TouchableOpacity>
                    </View>

                    {/* Mode Switch Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabBtn, mode === 'login' && styles.tabBtnActive]}
                            onPress={() => {
                                setMode('login');
                                setError('');
                            }}
                        >
                            <Text style={[styles.tabBtnText, mode === 'login' && styles.tabBtnTextActive]}>
                                {language === 'fr' ? 'CONNEXION' : 'LOG IN'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tabBtn, mode === 'signup' && styles.tabBtnActive]}
                            onPress={() => {
                                setMode('signup');
                                setError('');
                            }}
                        >
                            <Text style={[styles.tabBtnText, mode === 'signup' && styles.tabBtnTextActive]}>
                                {language === 'fr' ? 'CRÉER UN COMPTE' : 'CREATE ACCOUNT'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Official Google Sign-In Button */}
                    <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn} disabled={loading}>
                        <View style={styles.googleIconWrapper}>
                            <Ionicons name="logo-google" size={18} color="#111111" />
                        </View>
                        <Text style={styles.googleBtnText}>
                            {language === 'fr'
                                ? (mode === 'login' ? 'Continuer avec Google' : 'Créer un compte avec Google')
                                : (mode === 'login' ? 'Continue with Google' : 'Sign up with Google')}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>{language === 'fr' ? 'OU PAR E-MAIL' : 'OR WITH EMAIL'}</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Form */}
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {mode === 'signup' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{language === 'fr' ? 'Nom complet' : 'Full Name'}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={language === 'fr' ? 'Ex. Marie Koffi' : 'e.g. Alex Morgan'}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{language === 'fr' ? 'Adresse e-mail' : 'Email Address'}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="alex.morgan@gmail.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{language === 'fr' ? 'Mot de passe' : 'Password'}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity style={styles.primarySubmitBtn} onPress={handleEmailSubmit} disabled={loading}>
                        <Text style={styles.primarySubmitBtnText}>
                            {loading
                                ? (language === 'fr' ? 'VEUILLEZ PATIENTER…' : 'PLEASE WAIT...')
                                : language === 'fr'
                                    ? (mode === 'login' ? 'SE CONNECTER' : 'CRÉER MON COMPTE')
                                    : (mode === 'login' ? 'LOG IN TO SHOP' : 'CREATE ACCOUNT NOW')}
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    modalCard: {
        width: '100%',
        maxWidth: 440,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    brandTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: '#111111',
        letterSpacing: 1,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#111111',
        marginTop: 2,
    },
    closeBtn: {
        padding: 6,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 14,
        padding: 4,
        marginBottom: 20,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    tabBtnActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    tabBtnText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#737373',
    },
    tabBtnTextActive: {
        color: '#111111',
    },
    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#d4d4d4',
        borderRadius: 14,
        paddingVertical: 12,
        gap: 10,
        marginBottom: 16,
    },
    googleIconWrapper: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#262626',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#d4d4d4',
    },
    dividerText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#737373',
        marginHorizontal: 12,
    },
    errorText: {
        color: '#111111',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 14,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: '#737373',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#d4d4d4',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
        fontSize: 14,
        color: '#111111',
    },
    primarySubmitBtn: {
        backgroundColor: '#111111',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    primarySubmitBtnText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
});
