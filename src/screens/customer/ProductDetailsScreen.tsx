import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  Alert 
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { CustomButton } from '../../components/CustomButton';
import { useInventory } from '../../context/InventoryContext';
import { useCart } from '../../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ProductDetailsScreenProps {
  route: any;
  navigation: any;
}

export const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({ route, navigation }) => {
  const { productId } = route.params;
  const { furniture } = useInventory();
  const { addToCart } = useCart();
  
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Find targeted item
  const item = furniture.find(f => f.id === productId);

  if (!item) {
    return (
      <ScreenContainer>
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={[TYPOGRAPHY.h3, styles.errorText]}>Selected item was not found.</Text>
          <CustomButton title="GO BACK" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </ScreenContainer>
    );
  }

  const handleAddToCart = async () => {
    setActionLoading(true);
    const error = await addToCart(item.id, 1);
    setActionLoading(false);
    
    if (error) {
      Alert.alert('System Alert', error);
    } else {
      setSuccessBanner('Product added to cart successfully!');
      setTimeout(() => setSuccessBanner(null), 3000);
    }
  };

  const handleBuyNow = async () => {
    setActionLoading(true);
    const error = await addToCart(item.id, 1);
    setActionLoading(false);
    
    if (error) {
      Alert.alert('System Alert', error);
    } else {
      navigation.navigate('Cart');
    }
  };

  return (
    <ScreenContainer scrollable={true}>
      {/* Top Interactive Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity 
          style={styles.circleBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        
        <Text style={styles.navTitle}>Luxury Showroom</Text>
        
        <TouchableOpacity 
          style={styles.circleBtn}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.8}
        >
          <Ionicons name="bag-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Floating Success Indicator (Rule 4: System Visibility) */}
      {successBanner && (
        <View style={styles.successBar}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.text} style={{ marginRight: 8 }} />
          <Text style={styles.successText}>{successBanner}</Text>
        </View>
      )}

      {/* Hero Display Panel */}
      <View style={styles.imagePanel}>
        <Image source={{ uri: item.image_url }} style={styles.largeImage} />
        
        {/* Category Label Overlay */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
        </View>
      </View>

      {/* Product Content Body */}
      <View style={styles.detailsCard}>
        <View style={styles.titleRow}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.priceText}>${item.price.toLocaleString()}</Text>
        </View>

        <View style={styles.divider} />

        {/* Room Visualizer Access Banner (Interactive placement feature link) */}
        <TouchableOpacity
          style={[styles.visualizerLink, SHADOWS.premium]}
          onPress={() => navigation.navigate('Visualizer', { item })}
          activeOpacity={0.9}
        >
          <Ionicons name="scan-outline" size={22} color={COLORS.accent} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.visTitle}>VISUALIZE IN YOUR ROOM</Text>
            <Text style={styles.visDesc}>Test item scales, placements, and fit inside your living space.</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.accent} />
        </TouchableOpacity>

        {/* Information text description */}
        <Text style={styles.sectionHeader}>DESIGN INSPIRATION</Text>
        <Text style={styles.descriptionText}>{item.description}</Text>

        <View style={styles.specsContainer}>
          <View style={styles.specBox}>
            <Ionicons name="cube-outline" size={18} color={COLORS.primaryLight} />
            <Text style={styles.specLabel}>Premium Grade</Text>
          </View>
          <View style={styles.specBox}>
            <Ionicons name="ribbon-outline" size={18} color={COLORS.primaryLight} />
            <Text style={styles.specLabel}>5-Year Warranty</Text>
          </View>
          <View style={styles.specBox}>
            <Ionicons name="leaf-outline" size={18} color={COLORS.primaryLight} />
            <Text style={styles.specLabel}>Eco-Sourced</Text>
          </View>
        </View>

        {/* Form Action Buttons (Rule 3: Visual hierarchy is maintained. Gold is Buy Now, Add to cart is outlined) */}
        <View style={styles.actionsPanel}>
          <View style={styles.halfBtn}>
            <CustomButton
              title="ADD TO CART"
              variant="outline"
              loading={actionLoading}
              onPress={handleAddToCart}
            />
          </View>
          <View style={styles.halfBtn}>
            <CustomButton
              title="BUY NOW"
              variant="primary"
              loading={actionLoading}
              onPress={handleBuyNow}
            />
          </View>
        </View>

      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: COLORS.error,
    marginVertical: 16,
    textAlign: 'center',
  },
  successBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.success,
    marginHorizontal: 24,
    marginVertical: 8,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  imagePanel: {
    height: 320,
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  largeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 1.2,
  },
  detailsCard: {
    marginTop: 20,
    paddingHorizontal: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
    marginRight: 16,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.accent,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  visualizerLink: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  visTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 0.8,
  },
  visDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
    letterSpacing: 1,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  specsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  specBox: {
    flex: 1,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  actionsPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  halfBtn: {
    width: '48%',
  },
});
