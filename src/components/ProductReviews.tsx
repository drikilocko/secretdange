import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LocalizedText as Text, LocalizedTextInput as TextInput, useLanguage } from '../context/LanguageContext';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Product } from '../types';

interface ProductReviewsProps {
    product: Product;
}

interface Review {
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
    verified: boolean;
    likes: number;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ product }) => {
    const { language } = useLanguage();
    const [reviews, setReviews] = useState<Review[]>([
        {
            id: 'rev-1',
            author: 'Amélie Laurent',
            rating: 5,
            date: '2 days ago',
            comment: 'Obsessed with the quality of this piece! The oversized drop shoulders are so flattering, and the material feels incredibly premium.',
            verified: true,
            likes: 24,
        },
        {
            id: 'rev-2',
            author: 'Marcus Vance',
            rating: 5,
            date: '1 week ago',
            comment: 'Secret d’Ange always delivers practical training content. Clear, useful, and easy to follow.',
            verified: true,
            likes: 18,
        },
        {
            id: 'rev-3',
            author: 'Camille Dupont',
            rating: 4,
            date: '2 weeks ago',
            comment: 'Super stylish and comfortable! Color is slightly warmer than photo but looks even better in person.',
            verified: true,
            likes: 9,
        },
    ]);

    const [showReviews, setShowReviews] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newAuthor, setNewAuthor] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');

    const handleAddReview = () => {
        if (!newAuthor || !newComment) return;
        const newRev: Review = {
            id: `rev-${Date.now()}`,
            author: newAuthor,
            rating: newRating,
            date: 'Just now',
            comment: newComment,
            verified: true,
            likes: 0,
        };
        setReviews([newRev, ...reviews]);
        setShowReviewForm(false);
        setNewAuthor('');
        setNewComment('');
    };

    const renderStars = (rating: number, size = 16) => {
        return (
            <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={size}
                        color="#111111"
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.reviewsToggle}
                onPress={() => setShowReviews((visible) => !visible)}
                accessibilityRole="button"
                accessibilityState={{ expanded: showReviews }}
            >
                <View>
                    <Text style={styles.sectionTitle}>Customer Reviews & Ratings</Text>
                    <Text style={styles.scoreSub}>
                        {product.rating.toFixed(1)} / 5 · {product.reviewsCount} {language === 'fr' ? 'avis' : 'reviews'}
                    </Text>
                </View>
                <Feather name={showReviews ? 'chevron-up' : 'chevron-down'} size={22} color="#111111" />
            </TouchableOpacity>

            {showReviews && (
                <>
            {/* Summary Rating Box */}
            <View style={styles.summaryBox}>
                <View style={styles.scoreCol}>
                    <Text style={styles.scoreNumber}>{product.rating.toFixed(1)}</Text>
                    {renderStars(Math.round(product.rating), 18)}
                    <Text style={styles.scoreSub}>
                        {language === 'fr'
                            ? `Basé sur ${product.reviewsCount + reviews.length - 3} avis`
                            : `Based on ${product.reviewsCount + reviews.length - 3} reviews`}
                    </Text>
                </View>

                <View style={styles.dividerCol} />

                {/* Rating Bars */}
                <View style={styles.barsCol}>
                    {[
                        { stars: '5', percent: '88%' },
                        { stars: '4', percent: '10%' },
                        { stars: '3', percent: '2%' },
                        { stars: '2', percent: '0%' },
                        { stars: '1', percent: '0%' },
                    ].map((bar) => (
                        <View key={bar.stars} style={styles.barRow}>
                            <Text style={styles.barLabel}>{bar.stars}</Text>
                            <Ionicons name="star" size={11} color="#111111" />
                            <View style={styles.barTrack}>
                                <View style={[styles.barFill, { width: bar.percent as any }]} />
                            </View>
                            <Text style={styles.barPercent}>{bar.percent}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Write a Review Action */}
            <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => setShowReviewForm(!showReviewForm)}
            >
                <Feather name="edit-3" size={16} color="#111111" />
                <Text style={styles.writeReviewBtnText}>
                    {showReviewForm ? 'CANCEL REVIEW' : 'WRITE A VERIFIED REVIEW'}
                </Text>
            </TouchableOpacity>

            {/* Review Form */}
            {showReviewForm && (
                <View style={styles.reviewFormCard}>
                    <Text style={styles.formTitle}>Share your feedback with Secret d’Ange readers</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.inputLabel}>Your Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Sarah B."
                            value={newAuthor}
                            onChangeText={setNewAuthor}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.inputLabel}>Select Rating</Text>
                        <View style={styles.starSelectRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
                                    <Ionicons
                                        name={star <= newRating ? 'star' : 'star-outline'}
                                        size={28}
                                        color="#111111"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.inputLabel}>Review Comment</Text>
                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            multiline
                            placeholder="What did you love about the fit, fabric, or style?"
                            value={newComment}
                            onChangeText={setNewComment}
                        />
                    </View>

                    <TouchableOpacity style={styles.submitReviewBtn} onPress={handleAddReview}>
                        <Text style={styles.submitReviewBtnText}>SUBMIT REVIEW</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Reviews List */}
            <View style={styles.reviewsList}>
                {reviews.map((rev) => (
                    <View key={rev.id} style={styles.reviewCard}>
                        <View style={styles.reviewTop}>
                            <View>
                                <View style={styles.authorRow}>
                                    <Text style={styles.authorName}>{rev.author}</Text>
                                    {rev.verified && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={12} color="#111111" />
                                            <Text style={styles.verifiedText}>Verified Buyer</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.reviewDate}>{rev.date}</Text>
                            </View>

                            {renderStars(rev.rating, 14)}
                        </View>

                        <Text style={styles.commentText}>{rev.comment}</Text>

                        <View style={styles.reviewFooter}>
                            <TouchableOpacity style={styles.likeBtn}>
                                <Feather name="thumbs-up" size={12} color="#64748b" />
                                <Text style={styles.likeText}>Helpful ({rev.likes})</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111111',
        marginBottom: 4,
    },
    reviewsToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    summaryBox: {
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#d4d4d4',
    },
    scoreCol: {
        alignItems: 'center',
        paddingRight: 20,
    },
    scoreNumber: {
        fontSize: 36,
        fontWeight: '900',
        color: '#111111',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
        marginVertical: 4,
    },
    scoreSub: {
        fontSize: 11,
        color: '#525252',
        fontWeight: '600',
    },
    dividerCol: {
        width: 1,
        height: 80,
        backgroundColor: '#d4d4d4',
        marginRight: 20,
    },
    barsCol: {
        flex: 1,
        gap: 6,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    barLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#525252',
        width: 24,
    },
    barTrack: {
        flex: 1,
        height: 6,
        backgroundColor: '#d4d4d4',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: '#111111',
        borderRadius: 3,
    },
    barPercent: {
        fontSize: 11,
        fontWeight: '700',
        color: '#525252',
        width: 32,
        textAlign: 'right',
    },
    writeReviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#111111',
        paddingVertical: 12,
        borderRadius: 14,
        marginBottom: 20,
    },
    writeReviewBtnText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    reviewFormCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#d4d4d4',
    },
    formTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#111111',
        marginBottom: 14,
    },
    formGroup: {
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#525252',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d4d4d4',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 13,
    },
    starSelectRow: {
        flexDirection: 'row',
        gap: 8,
    },
    submitReviewBtn: {
        backgroundColor: '#111111',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 6,
    },
    submitReviewBtnText: {
        color: '#ffffff',
        fontWeight: '900',
        fontSize: 12,
    },
    reviewsList: {
        gap: 14,
    },
    reviewCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#d4d4d4',
    },
    reviewTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '800',
        color: '#111111',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    verifiedText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#262626',
    },
    reviewDate: {
        fontSize: 11,
        color: '#737373',
        marginTop: 2,
    },
    commentText: {
        fontSize: 13,
        color: '#262626',
        lineHeight: 20,
        marginVertical: 6,
    },
    reviewFooter: {
        marginTop: 8,
    },
    likeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    likeText: {
        fontSize: 11,
        color: '#525252',
        fontWeight: '600',
    },
});
