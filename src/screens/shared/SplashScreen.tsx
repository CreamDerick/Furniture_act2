import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Animated, 
  Dimensions 
} from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Run compound branding entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 15,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-transition after 2.6 seconds
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.brandContainer,
          { 
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideUpAnim }
            ]
          }
        ]}
      >
        {/* Luxury Icon Crown */}
        <View style={styles.iconCircle}>
          <Ionicons name="sparkles-sharp" size={44} color={COLORS.accent} />
        </View>
        
        {/* Branding Headings */}
        <Text style={[TYPOGRAPHY.h1, styles.title]}>A U R A</Text>
        <Text style={styles.subtitle}>HOME FITTING & DESIGN</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.tagline}>Luxury Comfort, Redefined.</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    width: width * 0.8,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryLight,
    letterSpacing: 4,
    marginTop: 8,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 1.5,
    backgroundColor: COLORS.accent,
    marginVertical: 20,
    borderRadius: 1,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
