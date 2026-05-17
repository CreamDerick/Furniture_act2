import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI, CartItem } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (furnitureId: string, quantity?: number) => Promise<string | null>;
  updateQuantity: (furnitureId: string, quantity: number) => Promise<string | null>;
  removeFromCart: (furnitureId: string) => Promise<string | null>;
  clearCart: () => Promise<string | null>;
  checkout: () => Promise<string | null>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshCart = async () => {
    if (!user || user.role !== 'user') {
      setCartItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await cartAPI.list(user.id);
      setCartItems(data);
    } catch (err) {
      console.error('Failed to load shopping cart items', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync cart when user signs in or out
  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (furnitureId: string, quantity = 1): Promise<string | null> => {
    if (!user) return 'Authentication required to add items to cart.';
    if (user.role !== 'user') return 'Only standard customers can perform cart operations.';
    
    try {
      await cartAPI.addToCart(user.id, furnitureId, quantity);
      await refreshCart();
      return null;
    } catch (err: any) {
      return err.message || 'Failed to insert item into cart.';
    }
  };

  const updateQuantity = async (furnitureId: string, quantity: number): Promise<string | null> => {
    if (!user || user.role !== 'user') return 'Unauthorized action.';
    try {
      await cartAPI.updateQuantity(user.id, furnitureId, quantity);
      await refreshCart();
      return null;
    } catch (err: any) {
      return err.message || 'Failed to update item quantity.';
    }
  };

  const removeFromCart = async (furnitureId: string): Promise<string | null> => {
    if (!user || user.role !== 'user') return 'Unauthorized action.';
    try {
      await cartAPI.removeFromCart(user.id, furnitureId);
      await refreshCart();
      return null;
    } catch (err: any) {
      return err.message || 'Failed to remove item from cart.';
    }
  };

  const clearCart = async (): Promise<string | null> => {
    if (!user || user.role !== 'user') return 'Unauthorized action.';
    try {
      await cartAPI.clearCart(user.id);
      await refreshCart();
      return null;
    } catch (err: any) {
      return err.message || 'Failed to clear cart contents.';
    }
  };

  const checkout = async (): Promise<string | null> => {
    if (!user || user.role !== 'user') return 'Unauthorized action.';
    if (cartItems.length === 0) return 'Your shopping cart is currently empty.';
    
    try {
      await cartAPI.clearCart(user.id);
      setCartItems([]);
      return null;
    } catch (err: any) {
      return err.message || 'Checkout transaction failed.';
    }
  };

  // Derive counts and sums
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.furniture?.price || 0;
    return sum + itemPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        isLoading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be called within a CartProvider scope.');
  }
  return context;
};
