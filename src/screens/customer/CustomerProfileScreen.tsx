import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Platform
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface CustomerProfileScreenProps {
  navigation: any;
}

export const CustomerProfileScreen: React.FC<CustomerProfileScreenProps> = ({ navigation }) => {
  const { user, updateProfile, logout } = useAuth();
  
  // Edit mode toggler
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Local form input states
  const [username, setUsername] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  
  // Feedback states
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Sync state with current user profile
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAvatarUrl(user.avatar_url || '');
      setAddress(user.address || '');
      setMobileNumber(user.mobile_number || '');
    }
  }, [user]);

  // Input Sanitizer
  const sanitize = (text: string): string => {
    if (!text) return '';
    return text.trim().replace(/[\'\";]/g, '').replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  };

  const handleSave = async () => {
    const tempErrors: { [key: string]: string | null } = {};
    let isValid = true;

    // Validate Username
    const cleanUser = sanitize(username);
    if (!cleanUser) {
      tempErrors.username = 'Username is required.';
      isValid = false;
    } else if (cleanUser.length < 3) {
      tempErrors.username = 'Username must be at least 3 characters.';
      isValid = false;
    }

    // Validate Phone Number
    const cleanPhone = mobileNumber.trim();
    if (cleanPhone) {
      const sanitizedPhone = cleanPhone.replace(/[\s()+-]/g, '');
      if (isNaN(Number(sanitizedPhone)) || sanitizedPhone.length < 7) {
        tempErrors.mobileNumber = 'Please input a valid telephone mobile number.';
        isValid = false;
      }
    }

    setErrors(tempErrors);
    if (!isValid) return;

    setLoading(true);
    const error = await updateProfile({
      username: cleanUser,
      avatar_url: avatarUrl.trim(),
      address: sanitize(address),
      mobile_number: cleanPhone,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Modification Rejected', error);
    } else {
      setIsEditing(false);
      Alert.alert('Profile Secured', 'Your personal account adjustments have been saved securely!');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Are you sure you want to end your active secure session?');
      if (confirmLogout) {
        logout();
      }
    } else {
      Alert.alert(
        'Secure Sign-Out',
        'Are you sure you want to end your active secure session?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign Out', 
            style: 'destructive',
            onPress: async () => await logout()
          }
        ]
      );
    }
  };

  return (
    <ScreenContainer scrollable={true} isLoading={loading} statusMessage="Saving account modifications...">
      
      {/* Top Banner Wrapper */}
      <View style={styles.banner}>
        <TouchableOpacity 
          style={styles.editBadge}
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isEditing ? 'checkmark-sharp' : 'create-outline'} 
            size={16} 
            color={COLORS.textContrast} 
          />
          <Text style={styles.badgeText}>
            {isEditing ? 'SAVE' : 'EDIT'}
          </Text>
        </TouchableOpacity>

        {/* User Large Avatar */}
        <View style={[styles.avatarWrapper, SHADOWS.premium]}>
          <Image 
            source={{ 
              uri: avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' 
            }} 
            style={styles.avatar} 
          />
        </View>

        <Text style={styles.userTitle}>{user?.username}</Text>
        <Text style={styles.userRoleText}>MEMBERSHIP: PREMIUM LUXE CUSTOMER</Text>
      </View>

      {/* Profile Form Details */}
      <View style={styles.profileCard}>
        <Text style={styles.sectionHeader}>SECURED CUSTOMER METADATA</Text>

        <CustomInput
          label="Display Name / Username"
          value={username}
          onChangeText={setUsername}
          editable={isEditing}
          error={errors.username}
        />

        <CustomInput
          label="Avatar Photo URL"
          value={avatarUrl}
          onChangeText={setAvatarUrl}
          editable={isEditing}
          error={errors.avatarUrl}
        />

        <CustomInput
          label="Home/Shipping Address"
          value={address}
          onChangeText={setAddress}
          editable={isEditing}
          error={errors.address}
        />

        <CustomInput
          label="Contact Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          placeholder="+1 (555) 000-0000"
          editable={isEditing}
          error={errors.mobileNumber}
          keyboardType="phone-pad"
        />

        {isEditing ? (
          <View style={styles.saveBtnWrapper}>
            {/* Rule 3: Single high-contrast primary button on this panel */}
            <CustomButton
              title="SAVE CHANGES SECURELY"
              onPress={handleSave}
              variant="primary"
            />
            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={() => {
                setIsEditing(false);
                setErrors({});
                if (user) {
                  setUsername(user.username || '');
                  setAvatarUrl(user.avatar_url || '');
                  setAddress(user.address || '');
                  setMobileNumber(user.mobile_number || '');
                }
              }}
            >
              <Text style={styles.cancelText}>CANCEL MODIFICATIONS</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.logoutBtnWrapper}>
            <CustomButton
              title="SECURE LOGOUT"
              onPress={handleLogout}
              variant="danger"
            />
            <Text style={styles.syncNotice}>
              🛡️ ALL SESSION TOKENS AND DATABASE ENTRIES ARE HASHED & GUARDED
            </Text>
          </View>
        )}
      </View>

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.border,
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    top: 16,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textContrast,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2.5,
    borderColor: COLORS.accent,
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  userRoleText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 1.5,
    marginTop: 6,
  },
  profileCard: {
    padding: 24,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  saveBtnWrapper: {
    marginTop: 16,
  },
  cancelBtn: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },
  logoutBtnWrapper: {
    marginTop: 24,
  },
  syncNotice: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textPlaceholder,
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 0.5,
  },
});
