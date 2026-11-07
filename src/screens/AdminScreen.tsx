import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Modal,
} from 'react-native';
import { LocalizedText as Text, LocalizedTextInput as TextInput, useLanguage } from '../context/LanguageContext';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useShop } from '../context/ShopContext';
import { Header } from '../components/Header';
import { CATEGORIES } from '../data/mockData';

export const AdminScreen: React.FC = () => {
    const {
        orders,
        products,
        updateOrderStatus,
        addProduct,
        deleteProduct,
        formatPrice,
        navigateTo,
    } = useShop();
    const { language } = useLanguage();

    const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'coupons'>('orders');
    const [orderFilter, setOrderFilter] = useState<'all' | 'placed' | 'processing' | 'shipped' | 'delivered'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Add Product Modal Form State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newBrand, setNewBrand] = useState('SECRET D’ANGE');
    const [newPrice, setNewPrice] = useState('149');
    const [newCategory, setNewCategory] = useState('ENTREPRENEURIAT');
    const [newProductType, setNewProductType] = useState('Ebook de formation');
    const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800');
    const [newSpecifications, setNewSpecifications] = useState('');
    const [newEbookStoragePath, setNewEbookStoragePath] = useState('');
    const [productFormError, setProductFormError] = useState<string | null>(null);

    // Active Promo Codes State
    const [promoCodes, setPromoCodes] = useState([
        { code: '20100', discount: '$20 OFF $100', active: true },
        { code: 'SALE20', discount: '$20 OFF $50', active: true },
        { code: 'PAPY20', discount: '20% OFF ALL', active: true },
    ]);
    const [newCouponCode, setNewCouponCode] = useState('');

    // Calculations
    const totalRevenue = orders.filter((order) => order.paymentStatus === 'paid' && order.paymentVerified).reduce((sum, order) => sum + order.total, 0);
    const filteredOrders = orders.filter((o) => {
        const matchesStatus = orderFilter === 'all' || o.status === orderFilter;
        const matchesQuery =
            o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (o.shippingAddress?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesQuery;
    });

    const handleCreateProduct = () => {
        if (!newTitle.trim() || !newEbookStoragePath.trim()) {
            setProductFormError('Renseignez le titre et le chemin du PDF dans le bucket privé.');
            return;
        }
        setProductFormError(null);
        addProduct({
            name: newTitle,
            brand: newBrand,
            price: parseFloat(newPrice) || 99,
            originalPrice: (parseFloat(newPrice) || 99) + 30,
            rating: 5.0,
            reviewsCount: 1,
            category: newCategory,
            productType: newProductType,
            colors: [{ name: 'Ebook PDF', hex: '#6d28d9' }],
            images: [newImage],
            description: 'Ebook de formation pratique disponible après confirmation du paiement.',
            specifications: newSpecifications,
            isNewIn: true,
            isBestSeller: false,
            ebookFormat: 'pdf',
            ebookStoragePath: newEbookStoragePath.trim(),
        });
        setShowAddModal(false);
        setNewTitle('');
        setNewEbookStoragePath('');
    };

    const handleAddCoupon = () => {
        if (!newCouponCode) return;
        setPromoCodes((prev) => [
            { code: newCouponCode.toUpperCase(), discount: '$20 OFF', active: true },
            ...prev,
        ]);
        setNewCouponCode('');
    };

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Admin Title & Storefront Switcher */}
                <View style={styles.adminHeaderRow}>
                    <View>
                        <View style={styles.adminTitleBadge}>
                            <Ionicons name="shield-checkmark" size={16} color="#8b72e6" />
                            <Text style={styles.adminBadgeText}>SECRET D’ANGE · ADMINISTRATION</Text>
                        </View>
                        <Text style={styles.pageTitle}>Operations & Fulfillment Center</Text>
                    </View>

                    <TouchableOpacity style={styles.storefrontBtn} onPress={() => navigateTo('shop')}>
                        <Feather name="external-link" size={16} color="#111111" />
                        <Text style={styles.storefrontBtnText}>VIEW CUSTOMER SHOP</Text>
                    </TouchableOpacity>
                </View>

                {/* Analytics Summary Widgets */}
                <View style={styles.analyticsGrid}>
                    <View style={styles.kpiCard}>
                        <View style={[styles.kpiIconWrapper, { backgroundColor: '#f3e8ff' }]}>
                            <Feather name="dollar-sign" size={20} color="#7e22ce" />
                        </View>
                        <Text style={styles.kpiLabel}>Total Revenue</Text>
                        <Text style={styles.kpiValue}>{formatPrice(totalRevenue)}</Text>
                        <Text style={styles.kpiSub}>+18.4% this month</Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={[styles.kpiIconWrapper, { backgroundColor: '#e0f2fe' }]}>
                            <Feather name="shopping-bag" size={20} color="#0284c7" />
                        </View>
                        <Text style={styles.kpiLabel}>Total Orders</Text>
                        <Text style={styles.kpiValue}>{orders.length}</Text>
                        <Text style={styles.kpiSub}>2 pending delivery</Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={[styles.kpiIconWrapper, { backgroundColor: '#dcfce7' }]}>
                            <Feather name="grid" size={20} color="#16a34a" />
                        </View>
                        <Text style={styles.kpiLabel}>Active Catalog</Text>
                        <Text style={styles.kpiValue}>{products.length} Items</Text>
                        <Text style={styles.kpiSub}>In stock & available</Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={[styles.kpiIconWrapper, { backgroundColor: '#fce7f3' }]}>
                            <Feather name="tag" size={20} color="#db2777" />
                        </View>
                        <Text style={styles.kpiLabel}>Promo Coupons</Text>
                        <Text style={styles.kpiValue}>{promoCodes.length} Active</Text>
                        <Text style={styles.kpiSub}>Code: 20100, SALE20</Text>
                    </View>
                </View>

                {/* Admin Section Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'orders' && styles.tabButtonActive]}
                        onPress={() => setActiveTab('orders')}
                    >
                        <Ionicons
                            name="clipboard-outline"
                            size={18}
                            color={activeTab === 'orders' ? '#ffffff' : '#475569'}
                        />
                        <Text style={[styles.tabButtonText, activeTab === 'orders' && styles.tabButtonTextActive]}>
                            {language === 'fr' ? `Gestion des commandes (${orders.length})` : `Orders Management (${orders.length})`}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'products' && styles.tabButtonActive]}
                        onPress={() => setActiveTab('products')}
                    >
                        <Ionicons
                            name="cube-outline"
                            size={18}
                            color={activeTab === 'products' ? '#ffffff' : '#475569'}
                        />
                        <Text style={[styles.tabButtonText, activeTab === 'products' && styles.tabButtonTextActive]}>
                            {language === 'fr' ? `Catalogue d’inventaire (${products.length})` : `Inventory Catalog (${products.length})`}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'coupons' && styles.tabButtonActive]}
                        onPress={() => setActiveTab('coupons')}
                    >
                        <Ionicons
                            name="ticket-outline"
                            size={18}
                            color={activeTab === 'coupons' ? '#ffffff' : '#475569'}
                        />
                        <Text style={[styles.tabButtonText, activeTab === 'coupons' && styles.tabButtonTextActive]}>
                            {language === 'fr' ? `Promotions & Coupons (${promoCodes.length})` : `Promotions & Coupons (${promoCodes.length})`}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* TAB 1: ORDERS MANAGEMENT */}
                {activeTab === 'orders' && (
                    <View style={styles.sectionCard}>
                        {/* Search & Status Filters */}
                        <View style={styles.filterRow}>
                            <View style={styles.searchBox}>
                                <Feather name="search" size={16} color="#94a3b8" />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search by Order ID or Customer Name..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusChipsRow}>
                                {(['all', 'placed', 'processing', 'shipped', 'delivered'] as const).map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        style={[styles.statusChip, orderFilter === status && styles.statusChipActive]}
                                        onPress={() => setOrderFilter(status)}
                                    >
                                        <Text style={[styles.statusChipText, orderFilter === status && styles.statusChipTextActive]}>
                                            {status.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Orders List */}
                        {filteredOrders.length === 0 ? (
                            <Text style={styles.emptyText}>No orders match the selected filter.</Text>
                        ) : (
                            filteredOrders.map((order) => (
                                <View key={order.id} style={styles.orderAdminCard}>
                                    <View style={styles.orderTopRow}>
                                        <View>
                                            <Text style={styles.orderAdminId}>Order #{order.id}</Text>
                                            <Text style={styles.orderAdminDate}>{order.date} • Paiement : {order.paymentStatus.toUpperCase()}</Text>
                                        </View>

                                        {/* Status Modifier Switcher */}
                                        <View style={styles.statusActionGroup}>
                                            {(['placed', 'processing', 'shipped', 'delivered'] as const).map((st) => (
                                                <TouchableOpacity
                                                    key={st}
                                                    style={[
                                                        styles.miniStatusBadge,
                                                        order.status === st && styles.miniStatusBadgeActive,
                                                    ]}
                                                    onPress={() => updateOrderStatus(order.id, st)}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.miniStatusText,
                                                            order.status === st && styles.miniStatusTextActive,
                                                        ]}
                                                    >
                                                        {st}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    <View style={styles.divider} />

                                    {/* Digital order information */}
                                    <View style={styles.customerDetailsRow}>
                                        <View style={styles.customerCol}>
                                            <Text style={styles.colLabel}>Commande numérique</Text>
                                            <Text style={styles.colName}>{order.paymentStatus === 'paid' && order.paymentVerified ? 'Accès ebook activé' : 'Accès en attente du paiement'}</Text>
                                        </View>

                                        <View style={styles.customerColRight}>
                                            <Text style={styles.colLabel}>Total Amount</Text>
                                            <Text style={styles.colTotal}>{formatPrice(order.total)}</Text>
                                        </View>
                                    </View>

                                    {/* Purchased Items */}
                                    <View style={styles.itemsSubList}>
                                        {order.items.map((it, idx) => (
                                            <View key={idx} style={styles.itemSubRow}>
                                                <Image source={{ uri: it.product.images[0] }} style={styles.subItemThumb} />
                                                <Text style={styles.subItemTitle}>
                                                    {it.quantity}x {it.product.name} ({it.selectedColor.name})
                                                </Text>
                                                <Text style={styles.subItemPrice}>{formatPrice(it.product.price * it.quantity)}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                )}

                {/* TAB 2: INVENTORY CATALOG MANAGEMENT */}
                {activeTab === 'products' && (
                    <View style={styles.sectionCard}>
                        <View style={styles.inventoryHeader}>
                            <Text style={styles.sectionTitle}>Catalog Products ({products.length})</Text>

                            <TouchableOpacity style={styles.addProductBtn} onPress={() => setShowAddModal(true)}>
                                <Feather name="plus" size={16} color="#ffffff" />
                                <Text style={styles.addProductBtnText}>ADD NEW PRODUCT</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Products Grid */}
                        <View style={styles.productTable}>
                            {products.map((item) => (
                                <View key={item.id} style={styles.productRow}>
                                    <Image source={{ uri: item.images[0] }} style={styles.productThumb} />

                                    <View style={styles.productMainInfo}>
                                        <Text style={styles.productBrand}>{item.brand}</Text>
                                        <Text style={styles.productTitle}>{item.name}</Text>
                                        <Text style={styles.productCategory}>{item.category} • {item.productType}</Text>
                                    </View>

                                    <Text style={styles.productPriceText}>{formatPrice(item.price)}</Text>

                                    <TouchableOpacity
                                        style={styles.deleteProductBtn}
                                        onPress={() => deleteProduct(item.id)}
                                    >
                                        <Feather name="trash-2" size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* TAB 3: PROMO COUPONS MANAGER */}
                {activeTab === 'coupons' && (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Active Promo Coupons</Text>

                        <View style={styles.addCouponRow}>
                            <TextInput
                                style={styles.couponInput}
                                placeholder="Enter new code (e.g. SUMMER50)"
                                value={newCouponCode}
                                onChangeText={setNewCouponCode}
                            />
                            <TouchableOpacity style={styles.addCouponBtn} onPress={handleAddCoupon}>
                                <Text style={styles.addCouponBtnText}>CREATE COUPON</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.couponsGrid}>
                            {promoCodes.map((cp) => (
                                <View key={cp.code} style={styles.couponCard}>
                                    <Ionicons name="ticket" size={24} color="#8b72e6" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.couponCodeText}>{cp.code}</Text>
                                        <Text style={styles.couponDiscountText}>{cp.discount}</Text>
                                    </View>
                                    <View style={styles.activeBadge}>
                                        <Text style={styles.activeBadgeText}>ACTIVE</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* ADD PRODUCT MODAL */}
                <Modal visible={showAddModal} transparent={true} animationType="slide" onRequestClose={() => setShowAddModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add New Catalog Product</Text>
                                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                    <Feather name="x" size={20} color="#0f172a" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>Product Title</Text>
                                <TextInput style={styles.modalInput} value={newTitle} onChangeText={setNewTitle} placeholder="e.g. Wireless headphones" />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>Catégorie de formation</Text>
                                <View style={styles.rowForm}>
                                    {CATEGORIES.filter((category) => category.id !== 'ALL').map((category) => (
                                        <TouchableOpacity
                                            key={category.id}
                                            style={[styles.statusChip, newCategory === category.id && styles.statusChipActive]}
                                            onPress={() => setNewCategory(category.id)}
                                        >
                                            <Text style={[styles.statusChipText, newCategory === category.id && styles.statusChipTextActive]}>
                                                {category.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>Product Type</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={newProductType}
                                    onChangeText={setNewProductType}
                                    placeholder="Ebook de formation"
                                />
                            </View>

                            <View style={styles.rowForm}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Brand</Text>
                                    <TextInput style={styles.modalInput} value={newBrand} onChangeText={setNewBrand} />
                                </View>

                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Price ($ USD)</Text>
                                    <TextInput style={styles.modalInput} value={newPrice} onChangeText={setNewPrice} keyboardType="numeric" />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>Image URL</Text>
                                <TextInput style={styles.modalInput} value={newImage} onChangeText={setNewImage} />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>Contenu / modules</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={newSpecifications}
                                    onChangeText={setNewSpecifications}
                                    placeholder="PDF • Modules • Exercices pratiques"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>Chemin du PDF dans le bucket privé « ebooks »</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={newEbookStoragePath}
                                    onChangeText={setNewEbookStoragePath}
                                    placeholder="formations/mon-ebook.pdf"
                                    autoCapitalize="none"
                                />
                            </View>

                            {productFormError ? <Text style={styles.orderAdminDate}>{productFormError}</Text> : null}
                            <TouchableOpacity style={styles.saveProductBtn} onPress={handleCreateProduct}>
                                <Text style={styles.saveProductBtnText}>PUBLIER L’EBOOK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        maxWidth: 1100,
        alignSelf: 'center',
        width: '100%',
    },
    adminHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    adminTitleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    adminBadgeText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#8b72e6',
        letterSpacing: 1,
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#0f172a',
    },
    storefrontBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#ffc5d3',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
    },
    storefrontBtnText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#111111',
    },
    analyticsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
    },
    kpiCard: {
        flex: 1,
        minWidth: 140,
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    kpiIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    kpiLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    kpiValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        marginVertical: 4,
    },
    kpiSub: {
        fontSize: 12,
        color: '#16a34a',
        fontWeight: '700',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        padding: 4,
        marginBottom: 20,
        gap: 6,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    tabButtonActive: {
        backgroundColor: '#111111',
    },
    tabButtonText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#475569',
    },
    tabButtonTextActive: {
        color: '#ffffff',
    },
    sectionCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 20,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: '#0f172a',
    },
    statusChipsRow: {
        gap: 8,
    },
    statusChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    statusChipActive: {
        backgroundColor: '#8b72e6',
        borderColor: '#8b72e6',
    },
    statusChipText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#475569',
    },
    statusChipTextActive: {
        color: '#ffffff',
    },
    emptyText: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        paddingVertical: 40,
    },
    orderAdminCard: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    orderTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    orderAdminId: {
        fontSize: 16,
        fontWeight: '900',
        color: '#0f172a',
    },
    orderAdminDate: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    statusActionGroup: {
        flexDirection: 'row',
        gap: 6,
    },
    miniStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
    },
    miniStatusBadgeActive: {
        backgroundColor: '#111111',
    },
    miniStatusText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#64748b',
        textTransform: 'capitalize',
    },
    miniStatusTextActive: {
        color: '#ffffff',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 14,
    },
    customerDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    customerCol: {
        flex: 1,
    },
    customerColRight: {
        alignItems: 'flex-end',
    },
    colLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    colName: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0f172a',
    },
    colSub: {
        fontSize: 12,
        color: '#64748b',
    },
    colAddress: {
        fontSize: 13,
        color: '#334155',
    },
    colTotal: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
    },
    itemsSubList: {
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 8,
    },
    itemSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    subItemThumb: {
        width: 32,
        height: 38,
        borderRadius: 6,
        backgroundColor: '#e2e8f0',
    },
    subItemTitle: {
        flex: 1,
        fontSize: 12,
        fontWeight: '700',
        color: '#334155',
    },
    subItemPrice: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0f172a',
    },
    inventoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
    },
    addProductBtn: {
        backgroundColor: '#111111',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    addProductBtnText: {
        color: '#ffffff',
        fontWeight: '900',
        fontSize: 12,
    },
    productTable: {
        gap: 12,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 14,
    },
    productThumb: {
        width: 48,
        height: 58,
        borderRadius: 10,
        backgroundColor: '#e2e8f0',
    },
    productMainInfo: {
        flex: 1,
    },
    productBrand: {
        fontSize: 10,
        fontWeight: '800',
        color: '#8b72e6',
        textTransform: 'uppercase',
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0f172a',
    },
    productCategory: {
        fontSize: 12,
        color: '#64748b',
    },
    productPriceText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#0f172a',
    },
    deleteProductBtn: {
        padding: 10,
        borderRadius: 12,
        backgroundColor: '#fef2f2',
    },
    addCouponRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    couponInput: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 14,
    },
    addCouponBtn: {
        backgroundColor: '#8b72e6',
        paddingHorizontal: 20,
        justifyContent: 'center',
        borderRadius: 14,
    },
    addCouponBtnText: {
        color: '#ffffff',
        fontWeight: '900',
        fontSize: 12,
    },
    couponsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
    },
    couponCard: {
        flex: 1,
        minWidth: 240,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    couponCodeText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#0f172a',
    },
    couponDiscountText: {
        fontSize: 12,
        color: '#64748b',
    },
    activeBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    activeBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#16a34a',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
    },
    formGroup: {
        marginBottom: 14,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#475569',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    modalInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
    },
    rowForm: {
        flexDirection: 'row',
        gap: 12,
    },
    saveProductBtn: {
        backgroundColor: '#111111',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    saveProductBtnText: {
        color: '#ffffff',
        fontWeight: '900',
        fontSize: 13,
    },
});
