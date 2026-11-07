import React, { useEffect, useRef, useState } from 'react';
import {
    ImageBackground,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LocalizedText as Text } from '../context/LanguageContext';
import { useShop } from '../context/ShopContext';
import { Header } from './Header';

const SLIDE_INTERVAL = 5000;

const slides = [
    {
        category: 'ENTREPRENEURIAT',
        image:
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=85',
    },
    {
        category: 'MARKETING DIGITAL',
        image:
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1600&q=85',
    },
    {
        category: 'FINANCES',
        image:
            'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1600&q=85',
    },
];

const carouselSlides = [...slides, slides[0]];

type HeroBannerProps = {
    horizontalBleed: number;
};

export const HeroBanner: React.FC<HeroBannerProps> = ({ horizontalBleed }) => {
    const { setFilterState } = useShop();
    const { width, height } = useWindowDimensions();
    const scrollRef = useRef<ScrollView>(null);
    const activeSlideRef = useRef(0);
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            const nextPosition = activeSlideRef.current + 1;
            activeSlideRef.current = nextPosition;
            setActiveSlide(nextPosition % slides.length);
            scrollRef.current?.scrollTo({ x: width * nextPosition, animated: true });
        }, SLIDE_INTERVAL);

        return () => clearInterval(timer);
    }, [width]);

    const handleSlideChange = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const nextPosition = Math.round(event.nativeEvent.contentOffset.x / width);
        if (nextPosition === slides.length) {
            activeSlideRef.current = 0;
            setActiveSlide(0);
            scrollRef.current?.scrollTo({ x: 0, animated: false });
            return;
        }

        activeSlideRef.current = nextPosition;
        setActiveSlide(nextPosition);
    };

    const goToSlide = (index: number) => {
        activeSlideRef.current = index;
        setActiveSlide(index);
        scrollRef.current?.scrollTo({ x: width * index, animated: true });
    };

    return (
        <View
            style={[
                styles.bannerContainer,
                { width, height, marginHorizontal: -horizontalBleed },
            ]}
        >
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleSlideChange}
            >
                {carouselSlides.map((slide, index) => (
                    <ImageBackground
                        key={`${slide.category}-${index}`}
                        source={{ uri: slide.image }}
                        resizeMode="cover"
                        style={[styles.slide, { width, height }]}
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.78)', 'rgba(0,0,0,0.62)', 'rgba(0,0,0,0.30)', 'rgba(0,0,0,0)']}
                            locations={[0, 0.38, 0.72, 1]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={[styles.leftGradient, { pointerEvents: 'none' }]}
                        />

                        <View style={styles.sticker}>
                            <Text style={styles.stickerText}>EBOOKS DE FORMATION</Text>
                        </View>

                        <View style={[styles.contentWrapper, { width: Math.min(width * 0.72, 640) }]}>
                            <TouchableOpacity
                                onPress={() => setFilterState((prev) => ({ ...prev, category: slide.category }))}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.categoryText}>{slide.category}</Text>
                            </TouchableOpacity>
                            <Text style={styles.titleText}>
                                APPRENEZ, PROGRESSEZ,{'\n'}PASSEZ À L’ACTION
                            </Text>
                            <Text style={styles.subtitleText}>
                                Des formations pratiques en PDF, accessibles dès confirmation du paiement.
                            </Text>

                            <TouchableOpacity
                                style={styles.okButton}
                                onPress={() => setFilterState((prev) => ({ ...prev, category: slide.category }))}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.okButtonText}>DÉCOUVRIR LES LIVRES</Text>
                            </TouchableOpacity>
                        </View>
                    </ImageBackground>
                ))}
            </ScrollView>

            <View style={styles.headerOverlay}>
                <Header overlay />
            </View>

            <View style={styles.pagination}>
                {slides.map((slide, index) => (
                    <TouchableOpacity
                        key={slide.category}
                        accessibilityRole="button"
                        accessibilityLabel={`Show ${slide.category} slide`}
                        onPress={() => goToSlide(index)}
                        style={[styles.paginationDot, activeSlide === index && styles.activeDot]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bannerContainer: {
        overflow: 'hidden',
        position: 'relative',
    },
    slide: {
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    leftGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '100%',
        zIndex: 1,
    },
    sticker: {
        position: 'absolute',
        top: 112,
        left: 28,
        backgroundColor: '#111111',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        transform: [{ rotate: '-8deg' }],
    },
    stickerText: {
        color: '#ffffff',
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    contentWrapper: {
        alignItems: 'flex-start',
        zIndex: 2,
        marginLeft: 28,
        paddingHorizontal: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 2,
        marginBottom: 10,
    },
    titleText: {
        fontSize: 22,
        fontWeight: '900',
        color: '#ffffff',
        textAlign: 'left',
        letterSpacing: -0.5,
        lineHeight: 28,
    },
    subtitleText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#f1f5f9',
        marginTop: 6,
        marginBottom: 14,
    },
    okButton: {
        backgroundColor: '#000000',
        paddingHorizontal: 28,
        paddingVertical: 10,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    okButtonText: {
        color: '#ffffff',
        fontWeight: '900',
        fontSize: 13,
        letterSpacing: 0.5,
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 5,
    },
    pagination: {
        position: 'absolute',
        bottom: 14,
        left: 28,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.55)',
    },
    activeDot: {
        width: 20,
        backgroundColor: '#ffffff',
    },
});
