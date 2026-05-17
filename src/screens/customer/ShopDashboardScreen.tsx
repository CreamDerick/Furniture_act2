import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  TextInput 
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useInventory } from '../../context/InventoryContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { FurnitureItem } from '../../services/api';

interface ShopDashboardScreenProps {
  navigation: any;
}

export const ShopDashboardScreen: React.FC<ShopDashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { furniture, isLoading } = useInventory();
  const { cartCount } = useCart();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Sofas & Armchairs', 'Tables & Desks', 'Beds & Mattresses', 'Chairs & Stools'];

  // --- FILTER INVENTORY (Excludes hidden items and applies query) ---
  const filteredProducts = furniture.filter(item => {
    // 1. Core Rule: Must not be soft-deleted/hidden from User Side
    if (item.is_hidden) return false;
    
    // 2. Category matching
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    
    // 3. Search matching
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
                         
    return matchesCat && matchesQuery;
  });

  const renderProductCard = ({ item }: { item: FurnitureItem }) => (
    <TouchableOpacity
      style={[styles.productCard, SHADOWS.premium]}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
      activeOpacity={0.95}
    >
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <View style={styles.cardInfo}>
        <Text style={styles.productCategory}>{item.category.toUpperCase()}</Text>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>${item.price.toLocaleString()}</Text>
          <View style={styles.arrowBox}>
            <Ionicons name="chevron-forward" size={14} color={COLORS.textContrast} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer isLoading={isLoading} statusMessage="Syncing furniture catalog...">
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Back,</Text>
          <Text style={styles.username}>{user?.username || 'Guest Customer'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartBtn}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.8}
        >
          <Ionicons name="bag-handle-outline" size={24} color={COLORS.text} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Elegant Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search our luxury collection..."
            placeholderTextColor={COLORS.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle-sharp" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Horizontal Category Selectors */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryTab,
                selectedCategory === item && styles.activeCategoryTab
              ]}
              onPress={() => setSelectedCategory(item)}
              activeOpacity={0.8}
            >
              <Text 
                style={[
                  styles.categoryTabText,
                  selectedCategory === item && styles.activeCategoryTabText
                ]}
              >
                {item === 'All' ? 'ALL ITEMS' : item.toUpperCase()}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        />
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={COLORS.border} />
            <Text style={[TYPOGRAPHY.body, styles.emptyText]}>
              No premium items matched your criteria.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  username: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.accent,
    marginTop: 2,
  },
  cartBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textContrast,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginVertical: 12,
  },
  searchContainer: {
    height: 48,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  categoryContainer: {
    height: 38,
    marginVertical: 12,
  },
  categoryTab: {
    height: 34,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  activeCategoryTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  activeCategoryTabText: {
    color: COLORS.text,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  productCard: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    aspectRatio: 1.1,
    backgroundColor: COLORS.inputBg,
  },
  cardInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.accent,
  },
  arrowBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    color: COLORS.textPlaceholder,
    textAlign: 'center',
  },
});
