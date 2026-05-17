import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Alert,
  Platform
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export const AdminProfileScreen: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  
  // Modifiers
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  
  // Feedback states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync avatar url
  useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleSave = async () => {
    setError(null);
    if (!avatarUrl.trim()) {
      setError('Avatar URL cannot be empty.');
      return;
    }

    setLoading(true);
    // Explicitly update only avatar. System blocks username modifications in context and services.
    const err = await updateProfile({
      avatar_url: avatarUrl.trim()
    });
    setLoading(false);

    if (err) {
      Alert.alert('Action Denied', err);
    } else {
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Administrator profile photo has been modified successfully!');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Are you sure you want to exit the management console? Audit logs will capture this session termination.');
      if (confirmLogout) {
        logout();
      }
    } else {
      Alert.alert(
        'Administrative Sign-Out',
        'Are you sure you want to exit the management console? Audit logs will capture this session termination.',
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
    <ScreenContainer scrollable={true} isLoading={loading} statusMessage="Saving profile updates...">
      
      {/* Top Banner Control Room */}
      <View style={styles.banner}>
        
        {/* User Edit Trigger Badge */}
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

        {/* Large Admin Avatar */}
        <View style={[styles.avatarWrapper, SHADOWS.premium]}>
          <Image 
            source={{ 
              uri: avatarUrl || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80' 
            }} 
            style={styles.avatar} 
          />
        </View>

        <Text style={styles.userTitle}>{user?.username}</Text>
        <Text style={styles.userRoleText}>ROLE: SYSTEM ADMINISTRATOR</Text>
      </View>

      {/* Info & Inputs Cards */}
      <View style={styles.profileCard}>
        
        {/* Secure Padlocked Administrative Metadata (Rule 1: Fixed Username) */}
        <Text style={styles.sectionHeader}>SECURED MANAGEMENT ID</Text>

        <View style={styles.lockedUsernameCard}>
          <View style={styles.labelRow}>
            <Text style={styles.lockedLabel}>ADMINISTRATOR USERNAME</Text>
            <View style={styles.padlockBadge}>
              <Ionicons name="lock-closed" size={10} color={COLORS.textContrast} style={{ marginRight: 4 }} />
              <Text style={styles.padlockText}>LOCKED FIELD</Text>
            </View>
          </View>
          <View style={styles.usernameBox}>
            <Text style={styles.usernameText}>{user?.username}</Text>
          </View>
          
          {/* Security Notice Explanation */}
          <View style={styles.lockedNotice}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.success} style={{ marginRight: 6 }} />
            <Text style={styles.noticeText}>
              Security Mandate: Admin Usernames are permanently locked to preserve audit trail integrity.
            </Text>
          </View>
        </View>

        <CustomInput
          label="Profile Photo Avatar URL"
          value={avatarUrl}
          onChangeText={setAvatarUrl}
          editable={isEditing}
          error={error}
        />

        {isEditing ? (
          <View style={styles.saveBtnWrapper}>
            <CustomButton
              title="SAVE PHOTO CHANGES"
              onPress={handleSave}
              variant="primary"
            />
            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={() => {
                setIsEditing(false);
                setError(null);
                if (user) {
                  setAvatarUrl(user.avatar_url || '');
                }
              }}
            >
              <Text style={styles.cancelText}>CANCEL CHANGES</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.logoutBtnWrapper}>
            <CustomButton
              title="SECURE LOGOUT CONSOLE"
              onPress={handleLogout}
              variant="danger"
            />
            <Text style={styles.syncNotice}>
              🔒 AUDITED MANAGEMENT INTERFACE • IP ADDRESSES AND DATABASE QUERY LOGS ENABLED
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
    color: COLORS.accent,
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
    marginBottom: 12,
  },
  lockedUsernameCard: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lockedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  padlockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  padlockText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.textContrast,
    letterSpacing: 0.5,
  },
  usernameBox: {
    height: 48,
    backgroundColor: COLORS.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  usernameText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  noticeText: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 14,
    fontWeight: '500',
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
    marginTop: 16,
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
