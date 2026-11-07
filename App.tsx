import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import {
    Montserrat_400Regular,
} from '@expo-google-fonts/montserrat/400Regular';
import {
    Montserrat_500Medium,
} from '@expo-google-fonts/montserrat/500Medium';
import {
    Montserrat_600SemiBold,
} from '@expo-google-fonts/montserrat/600SemiBold';
import {
    Montserrat_700Bold,
} from '@expo-google-fonts/montserrat/700Bold';
import {
    Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat/800ExtraBold';
import {
    Montserrat_900Black,
} from '@expo-google-fonts/montserrat/900Black';
import { ShopProvider, useShop } from './src/context/ShopContext';
import { ShopScreen } from './src/screens/ShopScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { CartScreen } from './src/screens/CartScreen';
import { CheckoutScreen } from './src/screens/CheckoutScreen';
import { OrderSuccessScreen } from './src/screens/OrderSuccessScreen';
import { WishlistScreen } from './src/screens/WishlistScreen';
import { AdminScreen } from './src/screens/AdminScreen';
import { AccountScreen } from './src/screens/AccountScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { EbookReaderScreen } from './src/screens/EbookReaderScreen';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider } from './src/context/ThemeContext';

const MainNavigator: React.FC = () => {
    const { activeScreen } = useShop();

    const renderScreen = () => {
        switch (activeScreen) {
            case 'product-detail':
                return <ProductDetailScreen />;
            case 'cart':
                return <CartScreen />;
            case 'checkout':
                return <CheckoutScreen />;
            case 'order-success':
                return <OrderSuccessScreen />;
            case 'wishlist':
                return <WishlistScreen />;
            case 'admin':
                return <AdminScreen />;
            case 'account':
                return <AccountScreen />;
            case 'explore':
                return <ExploreScreen />;
            case 'reader':
                return <EbookReaderScreen />;
            case 'shop':
            default:
                return <ShopScreen />;
        }
    };

    return <View style={styles.appWrapper}>{renderScreen()}</View>;
};

export default function App() {
    const [fontsLoaded, fontError] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold,
        Montserrat_900Black,
    });

    if (fontError) {
        throw fontError;
    }

    if (!fontsLoaded) {
        return null;
    }

    return (
        <LanguageProvider>
            <ThemeProvider>
                <ShopProvider>
                    <SafeAreaView style={styles.safeArea}>
                        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                        <MainNavigator />
                    </SafeAreaView>
                </ShopProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    appWrapper: {
        flex: 1,
    },
});
