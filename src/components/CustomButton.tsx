import React, { useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Animated, 
  View 
} from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../theme/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
    }).start();
  };

  const getButtonStyles = () => {
    const base: any[] = [styles.button];
    if (disabled) {
      base.push(styles.disabledButton);
      return base;
    }
    
    switch (variant) {
      case 'primary':
        base.push(styles.primaryButton, SHADOWS.accent);
        break;
      case 'secondary':
        base.push(styles.secondaryButton, SHADOWS.premium);
        break;
      case 'outline':
        base.push(styles.outlineButton);
        break;
      case 'danger':
        base.push(styles.dangerButton);
        break;
    }
    return base;
  };

  const getTextStyles = () => {
    const base: any[] = [TYPOGRAPHY.buttonText, styles.text];
    if (disabled) {
      base.push(styles.disabledText);
      return base;
    }

    switch (variant) {
      case 'primary':
        base.push(styles.primaryText);
        break;
      case 'secondary':
        base.push(styles.secondaryText);
        break;
      case 'outline':
        base.push(styles.outlineText);
        break;
      case 'danger':
        base.push(styles.dangerText);
        break;
    }
    return base;
  };

  const getSpinnerColor = () => {
    if (variant === 'primary') return COLORS.textContrast;
    if (variant === 'outline') return COLORS.primary;
    return COLORS.text;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={disabled || loading}
        style={getButtonStyles()}
      >
        {loading ? (
          <ActivityIndicator size="small" color={getSpinnerColor()} />
        ) : (
          <View style={styles.contentContainer}>
            {icon && <View style={styles.iconWrapper}>{icon}</View>}
            <Text style={getTextStyles()}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 10,
  },
  text: {
    letterSpacing: 1.2,
  },
  // Variants
  primaryButton: {
    backgroundColor: COLORS.accent,
  },
  primaryText: {
    color: COLORS.textContrast,
  },
  secondaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryText: {
    color: COLORS.text,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  outlineText: {
    color: COLORS.primaryLight,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  dangerText: {
    color: COLORS.text,
  },
  // Disabled states
  disabledButton: {
    backgroundColor: COLORS.border,
    borderColor: 'transparent',
  },
  disabledText: {
    color: COLORS.textPlaceholder,
  },
});
