import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity 
} from 'react-native';
import { COLORS, TYPOGRAPHY } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface CustomInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  editable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const getBorderColor = () => {
    if (error) return COLORS.error;
    if (isFocused) return COLORS.primary;
    return COLORS.border;
  };

  return (
    <View style={styles.container}>
      <Text style={[TYPOGRAPHY.caption, styles.label]}>{label}</Text>
      
      <View 
        style={[
          styles.inputWrapper, 
          { borderColor: getBorderColor() },
          !editable && styles.disabledInputWrapper
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textPlaceholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.textInput, 
            { color: editable ? COLORS.text : COLORS.textSecondary }
          ]}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.iconWrapper}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={COLORS.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Renders error message inside fixed height to prevent layout shifts */}
      <View style={styles.errorContainer}>
        {error ? (
          <Text style={styles.errorText}>
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    marginBottom: 6,
    color: COLORS.primaryLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    height: 50,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  disabledInputWrapper: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    opacity: 0.7,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    paddingVertical: 0, // Solves Android text padding alignments
  },
  iconWrapper: {
    paddingLeft: 10,
    height: '100%',
    justifyContent: 'center',
  },
  errorContainer: {
    minHeight: 20,
    justifyContent: 'center',
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '500',
  },
});
