import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Dimensions
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export const AuthScreen: React.FC = () => {
  const { login, signUp } = useAuth();

  const isMobile = Platform.OS !== 'web' || 
                   (typeof navigator !== 'undefined' && navigator.userAgent && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) ||
                   Dimensions.get('window').width < 1024;
  
  // Tab states
  const [isAdminPortal, setIsAdminPortal] = useState<boolean>(false);
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  
  // Input fields
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // Feedback states
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  // --- SECURITY: INPUT SANITIZATION ENGINE ---
  const sanitizeText = (text: string): string => {
    if (!text) return '';
    return text
      .trim()
      // Block common SQL injection tags and scripts
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // XSS tag prevention
      .replace(/[\'\";]/g, '') // strip single quotes, double quotes, semicolons to prevent SQL breaking
      .replace(/\b(UNION|SELECT|INSERT|DELETE|DROP|UPDATE|WHERE|OR|AND)\b/gi, ''); // strip database commands
  };

  // --- SECURITY: CLIENT-SIDE INPUT VALIDATION ---
  const validateForm = (): boolean => {
    const tempErrors: { [key: string]: string | null } = {};
    let isValid = true;

    setGlobalError(null);

    // Email validation
    const sanitizedEmail = sanitizeText(email);
    if (!sanitizedEmail) {
      tempErrors.email = 'Email address is required.';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        tempErrors.email = 'Please submit a valid email address structure.';
        isValid = false;
      }
    }

    // Password validation
    if (!password) {
      tempErrors.password = 'Password input is required.';
      isValid = false;
    } else if (isSignUpMode && password.length < 8) {
      tempErrors.password = 'Password security check: must be at least 8 characters long.';
      isValid = false;
    } else if (!isSignUpMode && password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.';
      isValid = false;
    }

    // Customer Signup Metadata Validation
    if (isSignUpMode && !isAdminPortal) {
      const sanitizedUser = sanitizeText(username);
      if (!sanitizedUser) {
        tempErrors.username = 'Username is required for new accounts.';
        isValid = false;
      } else if (sanitizedUser.length < 3) {
        tempErrors.username = 'Username must be at least 3 characters in length.';
        isValid = false;
      }

      if (password !== confirmPassword) {
        tempErrors.confirmPassword = 'Passwords do not match.';
        isValid = false;
      }
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleAuthAction = async () => {
    if (!validateForm()) return;

    setAuthLoading(true);
    const sanitizedEmail = sanitizeText(email);
    const sanitizedUsername = sanitizeText(username);

    if (isAdminPortal) {
      // ADMIN AUTHENTICATION FLOW
      // Intercept mobile access right at login
      const isMobile = Platform.OS !== 'web' || 
                       (typeof navigator !== 'undefined' && navigator.userAgent && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) ||
                       Dimensions.get('window').width < 1024;
      
      if (isMobile) {
        setGlobalError('ACCESS DENIED: The Stock Manager console is strictly restricted to desktop PCs for security compliance.');
        setAuthLoading(false);
        return;
      }

      setStatusMsg('Authenticating Administrative credentials...');
      const error = await login(sanitizedEmail, password, 'admin');
      if (error) {
        setGlobalError(error);
        setAuthLoading(false);
      } else {
        setAuthLoading(false);
      }
    } else {
      // CUSTOMER FLOW
      if (isSignUpMode) {
        setStatusMsg('Creating secure Customer account...');
        const error = await signUp(sanitizedUsername, sanitizedEmail, password);
        if (error) {
          setGlobalError(error);
          setAuthLoading(false);
        } else {
          setAuthLoading(false);
        }
      } else {
        setStatusMsg('Authenticating Customer credentials...');
        const error = await login(sanitizedEmail, password, 'user');
        if (error) {
          setGlobalError(error);
          setAuthLoading(false);
        } else {
          setAuthLoading(false);
        }
      }
    }
  };

  const togglePortal = (adminMode: boolean) => {
    setIsAdminPortal(adminMode);
    setIsSignUpMode(false);
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setGlobalError(null);
  };

  return (
    <ScreenContainer isLoading={authLoading} statusMessage={statusMsg}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Main Logo Branding */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles-sharp" size={32} color={COLORS.accent} />
            </View>
            <Text style={[TYPOGRAPHY.h1, styles.brandName]}>A U R A</Text>
            <Text style={styles.brandSub}>SECURE ACCESS PORTAL</Text>
          </View>

          {/* Segmented Control Tabs */}
          {!isMobile && (
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, !isAdminPortal && styles.activeTab]}
                onPress={() => togglePortal(false)}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="people-outline" 
                  size={18} 
                  color={!isAdminPortal ? COLORS.accent : COLORS.textSecondary} 
                  style={styles.tabIcon}
                />
                <Text style={[styles.tabText, !isAdminPortal && styles.activeTabText]}>
                  CUSTOMER
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.tab, isAdminPortal && styles.activeTab]}
                onPress={() => togglePortal(true)}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="shield-half-outline" 
                  size={18} 
                  color={isAdminPortal ? COLORS.accent : COLORS.textSecondary} 
                  style={styles.tabIcon}
                />
                <Text style={[styles.tabText, isAdminPortal && styles.activeTabText]}>
                  ADMIN PANEL
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Form Container */}
          <View style={styles.formCard}>
            
            {/* Securitiy Warning Banner for Admin */}
            {isAdminPortal ? (
              <View style={styles.warningBanner}>
                <Ionicons name="shield-sharp" size={20} color={COLORS.accent} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.warningTitle}>MANAGEMENT CONSOLE</Text>
                  <Text style={styles.warningText}>
                    Authorized access only. All CRUD actions (create, edit, hide) are automatically audited in activity logs.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.modeToggleContainer}>
                <Text style={styles.modePrompt}>
                  {isSignUpMode ? 'Already have a customer account?' : 'New to Aura Furniture?'}
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setIsSignUpMode(!isSignUpMode);
                    setErrors({});
                    setGlobalError(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modeToggleText}>
                    {isSignUpMode ? 'Sign In' : 'Create Account'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Global Error Banner */}
            {globalError && (
              <View style={styles.globalErrorCard}>
                <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} style={{ marginRight: 8 }} />
                <Text style={styles.globalErrorText}>{globalError}</Text>
              </View>
            )}

            {/* Input Renders */}
            {isSignUpMode && !isAdminPortal && (
              <CustomInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="Pick a unique username"
                error={errors.username}
              />
            )}

            <CustomInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder={isAdminPortal ? "admin@furniture.com" : "customer@domain.com"}
              keyboardType="email-address"
              error={errors.email}
            />

            <CustomInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter secure password"
              secureTextEntry={true}
              error={errors.password}
            />

            {isSignUpMode && !isAdminPortal && (
              <CustomInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter secure password"
                secureTextEntry={true}
                error={errors.confirmPassword}
              />
            )}

            {/* Submit Action Button */}
            <View style={styles.btnSpacer}>
              <CustomButton
                title={
                  isAdminPortal 
                    ? 'LOGIN TO ADMIN CONSOLE' 
                    : isSignUpMode 
                      ? 'CREATE ACCOUNT SECURELY' 
                      : 'LOGIN TO ACCOUNT'
                }
                onPress={handleAuthAction}
                variant={isAdminPortal ? 'secondary' : 'primary'}
              />
            </View>
            


          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primaryLight,
    letterSpacing: 2,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  activeTab: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },
  activeTabText: {
    color: COLORS.accent,
  },
  formCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modePrompt: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginRight: 6,
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#301808', // Amber-Gold-black tone
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  warningText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  globalErrorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#380F0F',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    marginBottom: 20,
  },
  globalErrorText: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
    fontWeight: '500',
  },
  btnSpacer: {
    marginTop: 10,
  },
  demoCredentialsBox: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 15,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 6,
  },
  demoLine: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  demoText: {
    color: COLORS.text,
    fontWeight: '600',
  },
});
