import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Dimensions, 
  Animated, 
  Platform
} from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    id: '1',
    title: 'CURATED LUXURY',
    subtitle: 'High-Fidelity Masterpieces',
    description: 'Exquisite furniture pieces handcrafted by master artisans to elevate your living domain into an aura of pure comfort.',
    icon: 'rose-sharp',
  },
  {
    id: '2',
    title: 'REALTIME VISUALIZER',
    subtitle: 'Dynamic Space Fitting',
    description: 'Visualize high-luxury items inside your home using our state-of-the-art interactive furniture placement visualizer.',
    icon: 'cube-sharp',
  },
  {
    id: '3',
    title: 'WHITE-GLOVE SERVICE',
    subtitle: 'Secure Audited Delivery',
    description: 'Enjoy door-to-door premium white-glove logistics, synchronized and fully verified under secure cryptographic protocols.',
    icon: 'shield-checkmark-sharp',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Animation hooks for sleek transitions
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      // Sleek fade-slide transition
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        setCurrentSlide(prev => prev + 1);
        slideAnim.setValue(50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = SLIDES[currentSlide];

  return (
    <View style={styles.container}>
      {/* Upper Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBranding}>A U R A</Text>
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>SKIP</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        <Animated.View 
          style={[
            styles.slideWrapper, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Glassmorphic Icon Circle */}
          <View style={[styles.iconCircle, SHADOWS.premium]}>
            <Ionicons name={slide.icon as any} size={48} color={COLORS.accent} />
          </View>

          {/* Luxury Headings */}
          <Text style={styles.subtitle}>{slide.subtitle.toUpperCase()}</Text>
          <Text style={[TYPOGRAPHY.h1, styles.title]}>{slide.title}</Text>
          <View style={styles.divider} />
          <Text style={styles.description}>{slide.description}</Text>
        </Animated.View>
      </View>

      {/* Footer Navigation Area */}
      <View style={styles.footerContainer}>
        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                index === currentSlide ? styles.activeDot : null
              ]} 
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            currentSlide === SLIDES.length - 1 ? styles.lastSlideBtn : null,
            SHADOWS.accent
          ]} 
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.actionBtnText, 
            currentSlide === SLIDES.length - 1 ? styles.lastSlideBtnText : null
          ]}>
            {currentSlide === SLIDES.length - 1 ? 'ENTER AURA SHOWROOM' : 'CONTINUE'}
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={18} 
            color={currentSlide === SLIDES.length - 1 ? COLORS.textContrast : COLORS.accent} 
            style={styles.btnIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  topBranding: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 4,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideWrapper: {
    alignItems: 'center',
    width: Math.min(width * 0.85, 450),
    textAlign: 'center',
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 3,
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  divider: {
    width: 50,
    height: 2,
    backgroundColor: COLORS.accent,
    marginVertical: 24,
    borderRadius: 1,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  footerContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: COLORS.accent,
    width: 20,
  },
  actionButton: {
    flexDirection: 'row',
    height: 54,
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  lastSlideBtn: {
    backgroundColor: COLORS.accent,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 1.5,
  },
  lastSlideBtnText: {
    color: COLORS.textContrast,
  },
  btnIcon: {
    marginLeft: 8,
  },
});
