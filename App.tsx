import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Platform, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Core Themes & Providers
import { COLORS, TYPOGRAPHY, SHADOWS } from './src/theme/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { InventoryProvider } from './src/context/InventoryContext';
import { CartProvider } from './src/context/CartContext';

// Screens
import { SplashScreen } from './src/screens/shared/SplashScreen';
import { OnboardingScreen } from './src/screens/shared/OnboardingScreen';
import { AuthScreen } from './src/screens/shared/AuthScreen';

// Customer screens
import { ShopDashboardScreen } from './src/screens/customer/ShopDashboardScreen';
import { ProductDetailsScreen } from './src/screens/customer/ProductDetailsScreen';
import { CartScreen } from './src/screens/customer/CartScreen';
import { VisualizerScreen } from './src/screens/customer/VisualizerScreen';
import { CustomerProfileScreen } from './src/screens/customer/CustomerProfileScreen';

// Admin screens
import { AdminDashboardScreen } from './src/screens/admin/AdminDashboardScreen';
import { ActivityLogsScreen } from './src/screens/admin/ActivityLogsScreen';
import { AdminProfileScreen } from './src/screens/admin/AdminProfileScreen';

const Stack = createNativeStackNavigator();
const KEY_ONBOARDING_DONE = '@onboarding_completed';

// =====================================================================
// 🏠 CUSTOMER NAVIGATION CONTAINER (Showroom, Cart, Profile + Stack)
// =====================================================================
const CustomerRoot: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'showroom' | 'cart' | 'profile'>('showroom');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'showroom':
        return <ShopDashboardScreen navigation={navigation} />;
      case 'cart':
        return <CartScreen navigation={navigation} />;
      case 'profile':
        return <CustomerProfileScreen navigation={navigation} />;
    }
  };

  return (
    <View style={styles.flexContainer}>
      
      {/* Active Screen Render */}
      <View style={styles.activeScreenArea}>
        {renderActiveScreen()}
      </View>

      {/* Floating Amethyst Bottom Bar */}
      <View style={[styles.bottomBarContainer, SHADOWS.premium]}>
        <TouchableOpacity 
          style={styles.barTab}
          onPress={() => setActiveTab('showroom')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'showroom' ? 'home' : 'home-outline'} 
            size={22} 
            color={activeTab === 'showroom' ? COLORS.accent : COLORS.textSecondary} 
          />
          <Text style={[styles.tabLabel, activeTab === 'showroom' && styles.activeTabLabel]}>
            SHOWROOM
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.barTab}
          onPress={() => setActiveTab('cart')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'cart' ? 'bag-handle' : 'bag-handle-outline'} 
            size={22} 
            color={activeTab === 'cart' ? COLORS.accent : COLORS.textSecondary} 
          />
          <Text style={[styles.tabLabel, activeTab === 'cart' && styles.activeTabLabel]}>
            MY BAG
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.barTab}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'profile' ? 'person' : 'person-outline'} 
            size={22} 
            color={activeTab === 'profile' ? COLORS.accent : COLORS.textSecondary} 
          />
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.activeTabLabel]}>
            PROFILE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// =====================================================================
// 👑 ADMIN NAVIGATION CONTAINER (Stock Inventory, Logs, Profile)
// =====================================================================
const AdminRoot: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'audits' | 'profile'>('stock');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'stock':
        return <AdminDashboardScreen navigation={navigation} />;
      case 'audits':
        return <ActivityLogsScreen />;
      case 'profile':
        return <AdminProfileScreen />;
    }
  };

  return (
    <View style={styles.flexContainer}>
      
      {/* Active Screen Render */}
      <View style={styles.activeScreenArea}>
        {renderActiveScreen()}
      </View>

      {/* Floating Manager Bottom Bar */}
      <View style={[styles.bottomBarContainer, SHADOWS.premium, styles.adminBottomBar]}>
        <TouchableOpacity 
          style={styles.barTab}
          onPress={() => setActiveTab('stock')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'stock' ? 'cube' : 'cube-outline'} 
            size={22} 
            color={activeTab === 'stock' ? COLORS.accent : COLORS.textSecondary} 
          />
          <Text style={[styles.tabLabel, activeTab === 'stock' && styles.activeTabLabel]}>
            STOCK
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.barTab}
          onPress={() => setActiveTab('audits')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'audits' ? 'shield-checkmark' : 'shield-checkmark-outline'} 
            size={22} 
            color={activeTab === 'audits' ? COLORS.accent : COLORS.textSecondary} 
          />
          <Text style={[styles.tabLabel, activeTab === 'audits' && styles.activeTabLabel]}>
            AUDITS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.barTab}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={activeTab === 'profile' ? 'person' : 'person-outline'} 
            size={22} 
            color={activeTab === 'profile' ? COLORS.accent : COLORS.textSecondary} 
          />
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.activeTabLabel]}>
            PROFILE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// =====================================================================
// 🛡️ MOBILE DETECTION & SECURITY MANDATES
// =====================================================================
const isMobileDevice = () => {
  if (Platform.OS !== 'web') return true;
  if (typeof navigator !== 'undefined' && navigator.userAgent && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return true;
  return Dimensions.get('window').width < 1024;
};

// =====================================================================
// 🛡️ SECURE ADMINISTRATOR BLOCKED TERMINAL (Blocked on mobile devices)
// =====================================================================
const AdminBlockedScreen: React.FC = () => {
  const { logout } = useAuth();
  
  const handleTermination = () => {
    if (Platform.OS === 'web') {
      window.confirm('Terminate administrative session and log out?') && logout();
    } else {
      logout();
    }
  };

  return (
    <View style={styles.blockedContainer}>
      <View style={styles.blockedCard}>
        <Ionicons name="shield-sharp" size={72} color={COLORS.error} style={{ marginBottom: 20 }} />
        <Text style={styles.blockedTitle}>TERMINAL RESTRICTED</Text>
        <Text style={styles.blockedSub}>
          Security Mandate: The administrative stock manager console is strictly restricted to desktop Web PCs for compliance, data logs, and screen size verification.
        </Text>
        
        <View style={styles.blockedAlertRow}>
          <Ionicons name="warning-outline" size={16} color={COLORS.error} style={{ marginRight: 8 }} />
          <Text style={styles.blockedAlertText}>
            Access via mobile devices, tablets, or phone browsers is blocked.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.terminationBtn} 
          onPress={handleTermination}
          activeOpacity={0.8}
        >
          <Text style={styles.terminationBtnText}>SECURE TERMINATION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// =====================================================================
// 🛰️ MASTER APP ROUTING SWITCHER (RBAC Enforcement router)
// =====================================================================
const AppRouter: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Fading Shared States
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [onboardingChecked, setOnboardingChecked] = useState<boolean>(false);
  const wasAuthenticatedRef = useRef<boolean>(false);

  // Read first-time user slide state
  useEffect(() => {
    const checkOnboardingState = async () => {
      try {
        const completed = await AsyncStorage.getItem(KEY_ONBOARDING_DONE);
        if (completed === 'true') {
          setShowOnboarding(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setOnboardingChecked(true);
      }
    };
    checkOnboardingState();
  }, []);

  // When user logs out (transitions from true to false), reset onboarding display state
  useEffect(() => {
    if (isAuthenticated) {
      wasAuthenticatedRef.current = true;
    } else if (wasAuthenticatedRef.current) {
      setShowOnboarding(true);
      AsyncStorage.removeItem(KEY_ONBOARDING_DONE).catch(console.error);
      wasAuthenticatedRef.current = false;
    }
  }, [isAuthenticated]);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(KEY_ONBOARDING_DONE, 'true');
      setShowOnboarding(false);
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Loading core profile authentication sessions
  if (isLoading || !onboardingChecked) {
    return (
      <View style={styles.centeredLoading}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Syncing Aura Secure Keychains...</Text>
      </View>
    );
  }

  // 2. Fading Brand Splash Screen
  if (showSplash) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  // 3. Sliding Onboarding Screen
  if (showOnboarding && !isAuthenticated) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  const isMobile = isMobileDevice();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        
        {!isAuthenticated ? (
          // AUTH PORTALS
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : user?.role === 'admin' ? (
          // SECURE ADMINISTRATOR ROUTING CONSOLE
          isMobile ? (
            <Stack.Screen name="AdminBlocked" component={AdminBlockedScreen} />
          ) : (
            <Stack.Screen name="AdminRoot" component={AdminRoot} />
          )
        ) : (
          // SECURE STANDARD CUSTOMER ROUTING CONSOLE
          <>
            <Stack.Screen name="CustomerRoot" component={CustomerRoot} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
            <Stack.Screen name="Visualizer" component={VisualizerScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
};

// =====================================================================
// 📦 GLOBAL MAIN SYSTEM EXPORT CONTAINER
// =====================================================================
export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <AuthProvider>
        <InventoryProvider>
          <CartProvider>
            <AppRouter />
          </CartProvider>
        </InventoryProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// =====================================================================
// 🎨 LAYOUT STYLES SHEET
// =====================================================================
const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  activeScreenArea: {
    flex: 1,
  },
  centeredLoading: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Premium Bottom Tab Layout (Glassmorphic obsidian purple floating capsule)
  bottomBarContainer: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 12 : 6,
    paddingTop: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  adminBottomBar: {
    borderTopColor: COLORS.primaryDark,
  },
  barTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 0.8,
  },
  activeTabLabel: {
    color: COLORS.accent,
  },
  // Blocked Admin Layout styling
  blockedContainer: {
    flex: 1,
    backgroundColor: '#0E0D11',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  blockedCard: {
    backgroundColor: '#151419',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 32,
    alignItems: 'center',
    maxWidth: 450,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  blockedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 16,
  },
  blockedSub: {
    fontSize: 13,
    color: '#A19EA9',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  blockedAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    borderColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
  },
  blockedAlertText: {
    fontSize: 11,
    color: COLORS.error,
    fontWeight: '600',
    flex: 1,
  },
  terminationBtn: {
    backgroundColor: COLORS.error,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  terminationBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
