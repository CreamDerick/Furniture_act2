import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl 
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useInventory } from '../../context/InventoryContext';
import { Ionicons } from '@expo/vector-icons';
import { ActivityLog } from '../../services/api';

export const ActivityLogsScreen: React.FC = () => {
  const { logs, refreshLogs, isLoading } = useInventory();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLogs();
    setRefreshing(false);
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  const getActionBadgeColor = (action: ActivityLog['action']) => {
    switch (action) {
      case 'CREATE':
        return { bg: 'rgba(16, 185, 129, 0.12)', text: COLORS.success, icon: 'add-circle-outline' as const };
      case 'UPDATE':
        return { bg: 'rgba(59, 130, 246, 0.12)', text: COLORS.info, icon: 'git-compare-outline' as const };
      case 'SOFT_DELETE':
        return { bg: 'rgba(239, 68, 68, 0.12)', text: COLORS.error, icon: 'eye-off-outline' as const };
      case 'HARD_DELETE':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: COLORS.error, icon: 'trash-outline' as const };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  };

  const renderLogCard = ({ item }: { item: ActivityLog }) => {
    const badge = getActionBadgeColor(item.action);

    return (
      <View style={[styles.logCard, SHADOWS.premium]}>
        {/* Left Side Icon Column */}
        <View style={[styles.badgeContainer, { backgroundColor: badge.bg }]}>
          <Ionicons name={badge.icon} size={20} color={badge.text} />
        </View>

        {/* Right Info Column */}
        <View style={styles.logInfo}>
          <View style={styles.headerRow}>
            <View style={[styles.actionBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.actionText, { color: badge.text }]}>
                {item.action}
              </Text>
            </View>
            <Text style={styles.timestampText}>{formatDate(item.created_at)}</Text>
          </View>

          <Text style={styles.logDetailsText}>{item.details}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Ionicons name="person-circle-outline" size={12} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>Admin: <Text style={styles.metaBold}>{item.admin_name}</Text></Text>
            </View>
            <View style={styles.metaCol}>
              <Ionicons name="key-outline" size={12} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>ID: <Text style={styles.metaBold}>{item.target_item_id.substring(0, 8)}...</Text></Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer isLoading={isLoading && logs.length === 0} statusMessage="Pulling administrative activity log files...">
      
      {/* Top Banner Control Room */}
      <View style={styles.header}>
        <View>
          <Text style={styles.panelTitle}>SECURITY AUDIT TRAIL</Text>
          <Text style={styles.panelSub}>CHRONOLOGICAL SYSTEM ACTIVITY LOGS</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshBtn}
          onPress={handleRefresh}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={20} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      {/* Audit List */}
      <FlatList
        data={logs}
        renderItem={renderLogCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={48} color={COLORS.border} />
            <Text style={[TYPOGRAPHY.body, styles.emptyText]}>
              No administrative system records have been logged yet.
            </Text>
          </View>
        }
      />

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
  },
  panelSub: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 1,
    marginTop: 4,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  logCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 14,
  },
  badgeContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  logInfo: {
    flex: 1,
    paddingLeft: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  timestampText: {
    fontSize: 10,
    color: COLORS.textPlaceholder,
    fontWeight: '600',
  },
  logDetailsText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 4,
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  metaBold: {
    fontWeight: '700',
    color: COLORS.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: COLORS.textPlaceholder,
    textAlign: 'center',
    marginTop: 12,
  },
});
