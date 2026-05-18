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
  const [username, setUsername] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Feedback states
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  // Sync profile details
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleSave = async () => {
    const tempErrors: { [key: string]: string | null } = {};
    let isValid = true;

    if (!username.trim()) {
      tempErrors.username = 'Username is required.';
      isValid = false;
    } else if (username.trim().length < 3) {
      tempErrors.username = 'Username must be at least 3 characters.';
      isValid = false;
    }

    if (!avatarUrl.trim()) {
      tempErrors.avatarUrl = 'Avatar URL is required.';
      isValid = false;
    }

    setErrors(tempErrors);
    if (!isValid) return;

    setLoading(true);
    const err = await updateProfile({
      username: username.trim(),
      avatar_url: avatarUrl.trim()
    });
    setLoading(false);

    if (err) {
      Alert.alert('Action Denied', err);
    } else {
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Administrator profile details have been modified successfully!');
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

        <Text style={styles.sectionHeader}>SECURED MANAGEMENT ID</Text>

        <CustomInput
          label="Administrator Username"
          value={username}
          onChangeText={setUsername}
          editable={isEditing}
          error={errors.username}
        />

        <CustomInput
          label="Profile Photo Avatar URL"
          value={avatarUrl}
          onChangeText={setAvatarUrl}
          editable={isEditing}
          error={errors.avatarUrl}
        />

        {isEditing ? (
          <View style={styles.saveBtnWrapper}>
            <CustomButton
              title="SAVE PROFILE CHANGES"
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
