import React from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  ScrollView, 
  StatusBar, 
  ActivityIndicator, 
  Text 
} from 'react-native';
import { COLORS, TYPOGRAPHY } from '../theme/theme';
import { IS_REAL_SUPABASE } from '../services/supabaseClient';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  isLoading?: boolean;
  statusMessage?: string; // Rule 1 & 4: Explicit system/agent state visibility
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  isLoading = false,
  statusMessage,
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={[TYPOGRAPHY.body, styles.loadingText]}>
            {statusMessage || 'Loading secure system data...'}
          </Text>
        </View>
      );
    }

    return scrollable ? (
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    ) : (
      <View style={styles.flexContent}>
        {children}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Dynamic Connectivity & RBAC State Bar (Rule 4: Visibility of State) */}
      <View style={styles.stateBar}>
        <View style={[styles.stateDot, { backgroundColor: IS_REAL_SUPABASE ? COLORS.success : COLORS.warning }]} />
        <Text style={styles.stateText}>
          {IS_REAL_SUPABASE 
            ? 'Supabase Real-Time Secure Cloud Active' 
            : 'Fidelity Offline Local Cache Mode Active'}
        </Text>
      </View>

      <View style={styles.container}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  flexContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.accent,
    textAlign: 'center',
  },
  stateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBg,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stateText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
