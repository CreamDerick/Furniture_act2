import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { CustomButton } from '../../components/CustomButton';
import { useCart } from '../../context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../../services/api';

const { width } = Dimensions.get('window');

interface CartScreenProps {
  navigation: any;
}

export const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const { 
    cartItems, 
    cartTotal, 
    updateQuantity, 
    removeFromCart, 
    checkout,
    isLoading 
  } = useCart();
  
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);

  const handleQtyChange = async (furnitureId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    await updateQuantity(furnitureId, newQty);
  };

  const handleRemove = async (furnitureId: string, itemName: string) => {
    if (Platform.OS === 'web') {
      const confirmRemove = window.confirm(`Are you sure you want to remove "${itemName}" from your shopping cart?`);
      if (confirmRemove) {
        await removeFromCart(furnitureId);
      }
    } else {
      Alert.alert(
        'Remove Item',
        `Are you sure you want to remove "${itemName}" from your shopping cart?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: async () => await removeFromCart(furnitureId)
          }
        ]
      );
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setCheckoutLoading(true);
    // Simulating secure banking transactions
    setTimeout(async () => {
      const error = await checkout();
      setCheckoutLoading(false);
      
      if (error) {
        Alert.alert('Checkout Denied', error);
      } else {
        setCheckoutSuccess(true);
      }
    }, 1500);
  };

  const renderCartCard = ({ item }: { item: CartItem }) => {
    const product = item.furniture;
    if (!product) return null;

    return (
      <View style={[styles.cartCard, SHADOWS.premium]}>
        <Image source={{ uri: product.image_url }} style={styles.cartImage} />
        
        <View style={styles.cartInfo}>
          <Text style={styles.itemCategory}>{product.category.toUpperCase()}</Text>
          <Text style={styles.itemName} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.itemPrice}>${product.price.toLocaleString()}</Text>
          
          {/* Quantity Controls */}
          <View style={styles.quantityRow}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.qtyBtn} 
                onPress={() => handleQtyChange(product.id, item.quantity, -1)}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={16} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity 
                style={styles.qtyBtn} 
                onPress={() => handleQtyChange(product.id, item.quantity, 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.deleteBtn}
              onPress={() => handleRemove(product.id, product.name)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (checkoutSuccess) {
    return (
      <ScreenContainer>
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark-sharp" size={48} color={COLORS.textContrast} />
          </View>
          <Text style={[TYPOGRAPHY.h1, styles.successTitle]}>ORDER PLACED SECURELY</Text>
          <Text style={[TYPOGRAPHY.body, styles.successSub]}>
            Thank you for purchasing with Aura Home! Your high-luxury order is currently being synchronized and processed by our logistics team.
          </Text>
          <View style={{ width: '100%', marginTop: 20 }}>
            <CustomButton 
              title="RETURN TO SHOWROOM" 
              onPress={() => {
                setCheckoutSuccess(false);
                navigation.navigate('CustomerRoot');
              }} 
              variant="primary" 
            />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer isLoading={isLoading} statusMessage="Syncing your shopping bag...">
      
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.circleBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Bag</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Cart List */}
      <FlatList
        data={cartItems}
        renderItem={renderCartCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-handle-outline" size={64} color={COLORS.border} />
            <Text style={[TYPOGRAPHY.h3, styles.emptyText]}>Your bag is currently empty.</Text>
            <Text style={[TYPOGRAPHY.body, styles.emptySub]}>
              Explore our exquisite furniture collections to add luxury to your living space.
            </Text>
            <View style={{ width: 200, marginTop: 16 }}>
              <CustomButton 
                title="SHOP COLLECTION" 
                onPress={() => navigation.navigate('CustomerRoot')} 
                variant="outline" 
              />
            </View>
          </View>
        }
      />

      {/* Bottom Summary Invoice Panel */}
      {cartItems.length > 0 && (
        <View style={styles.checkoutPanel}>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>SUBTOTAL</Text>
            <Text style={styles.invoiceValue}>${cartTotal.toLocaleString()}</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>SHIPPING</Text>
            <Text style={styles.invoiceFree}>FREE DELUXE</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.invoiceRow}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.totalValue}>${cartTotal.toLocaleString()}</Text>
          </View>

          {/* Secure Transaction Action Button */}
          <View style={styles.checkoutBtnWrapper}>
            <CustomButton
              title="CHECKOUT SECURELY"
              onPress={handleCheckout}
              variant="primary"
              loading={checkoutLoading}
            />
          </View>
          
          {/* Security Subtext */}
          <Text style={styles.securitySub}>
            💳 SECURE ENCRYPTED GATEWAY POWERED BY SUPABASE SHIELDS
          </Text>
        </View>
      )}

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  listContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cartImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
  },
  cartInfo: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  itemCategory: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.accent,
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 4,
    height: 32,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 12,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: COLORS.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  checkoutPanel: {
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  invoiceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  invoiceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  invoiceFree: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.accent,
  },
  checkoutBtnWrapper: {
    marginTop: 16,
  },
  securitySub: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textPlaceholder,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 10,
  },
  // Success state layout
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    color: COLORS.text,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  successSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
});
