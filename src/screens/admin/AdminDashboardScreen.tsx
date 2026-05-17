import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  Modal, 
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useInventory } from '../../context/InventoryContext';
import { FurnitureItem } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface AdminDashboardScreenProps {
  navigation: any;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { furniture, createFurniture, updateFurniture, softDeleteFurniture, hardDeleteFurniture, isLoading } = useInventory();

  // Modal toggler
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<FurnitureItem | null>(null);

  // Form input states
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [category, setCategory] = useState<FurnitureItem['category']>('Sofas & Armchairs');
  const [description, setDescription] = useState<string>('');

  // Error state
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const categories: FurnitureItem['category'][] = [
    'Sofas & Armchairs',
    'Tables & Desks',
    'Beds & Mattresses',
    'Chairs & Stools'
  ];

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setPrice('');
    setImageUrl('');
    setCategory('Sofas & Armchairs');
    setDescription('');
    setErrors({});
    setModalVisible(true);
  };

  const openEditModal = (item: FurnitureItem) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setImageUrl(item.image_url);
    setCategory(item.category);
    setDescription(item.description);
    setErrors({});
    setModalVisible(true);
  };

  // Sanitizer
  const sanitize = (text: string) => {
    return text.trim().replace(/[\'\";]/g, '').replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  };

  const handleSubmit = async () => {
    const tempErrors: { [key: string]: string | null } = {};
    let isValid = true;

    // Sanitization & validations
    const cleanName = sanitize(name);
    if (!cleanName) {
      tempErrors.name = 'Product name is required.';
      isValid = false;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      tempErrors.price = 'Please enter a valid non-negative price amount.';
      isValid = false;
    }

    if (!imageUrl.trim()) {
      tempErrors.imageUrl = 'Image URL path is required.';
      isValid = false;
    }

    const cleanDesc = sanitize(description);
    if (!cleanDesc) {
      tempErrors.description = 'Product design description is required.';
      isValid = false;
    }

    setErrors(tempErrors);
    if (!isValid) return;

    setSubmitLoading(true);
    let error: string | null = null;

    if (editingItem) {
      // UPDATE ACTION
      error = await updateFurniture(editingItem.id, {
        name: cleanName,
        price: numericPrice,
        image_url: imageUrl.trim(),
        category,
        description: cleanDesc
      });
    } else {
      // CREATE ACTION
      error = await createFurniture({
        name: cleanName,
        price: numericPrice,
        image_url: imageUrl.trim(),
        category,
        description: cleanDesc
      });
    }

    setSubmitLoading(false);
    if (error) {
      Alert.alert('Database Transaction Denied', error);
    } else {
      setModalVisible(false);
      Alert.alert('Inventory Updated', `Successfully ${editingItem ? 'updated' : 'inserted'} "${cleanName}" in database catalog!`);
    }
  };

  const handleSoftDelete = (id: string, itemName: string) => {
    if (Platform.OS === 'web') {
      const confirmHide = window.confirm(`This action immediately hides "${itemName}" from all customer panels while preserving the database logs. Continue?`);
      if (confirmHide) {
        (async () => {
          const error = await softDeleteFurniture(id);
          if (error) window.alert(error);
        })();
      }
    } else {
      Alert.alert(
        'Confirm Hide (Soft Delete)',
        `This action immediately hides "${itemName}" from all customer panels while preserving the database logs. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Hide Product', 
            style: 'destructive',
            onPress: async () => {
              const error = await softDeleteFurniture(id);
              if (error) Alert.alert('Action Denied', error);
            }
          }
        ]
      );
    }
  };

  const handleUnhide = (id: string, itemName: string) => {
    if (Platform.OS === 'web') {
      const confirmUnhide = window.confirm(`Make "${itemName}" active and visible in the customer showroom again?`);
      if (confirmUnhide) {
        (async () => {
          const error = await updateFurniture(id, { is_hidden: false });
          if (error) window.alert(error);
        })();
      }
    } else {
      Alert.alert(
        'Confirm Unhide',
        `Make "${itemName}" active and visible in the customer showroom again?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Unhide Product', 
            style: 'default',
            onPress: async () => {
              const error = await updateFurniture(id, { is_hidden: false });
              if (error) Alert.alert('Action Denied', error);
            }
          }
        ]
      );
    }
  };

  const handleHardDelete = (id: string, itemName: string) => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`⚠️ WARNING: Permanently delete "${itemName}" from the database catalog? This action is IRREVERSIBLE!`);
      if (confirmDelete) {
        (async () => {
          const error = await hardDeleteFurniture(id);
          if (error) window.alert(error);
        })();
      }
    } else {
      Alert.alert(
        '⚠️ Permanent Deletion',
        `Are you absolutely sure you want to permanently delete "${itemName}" from the database? This action is IRREVERSIBLE!`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete Permanently', 
            style: 'destructive',
            onPress: async () => {
              const error = await hardDeleteFurniture(id);
              if (error) Alert.alert('Action Denied', error);
            }
          }
        ]
      );
    }
  };

  const renderInventoryCard = ({ item }: { item: FurnitureItem }) => (
    <View style={[styles.itemCard, SHADOWS.premium, item.is_hidden && styles.hiddenItemCard]}>
      <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      
      <View style={styles.itemInfo}>
        <View style={styles.statusRow}>
          <Text style={styles.itemCategory}>{item.category.toUpperCase()}</Text>
          <View style={[styles.statusBadge, item.is_hidden ? styles.badgeHidden : styles.badgeActive]}>
            <Text style={[styles.badgeText, item.is_hidden ? styles.badgeTextHidden : styles.badgeTextActive]}>
              {item.is_hidden ? 'HIDDEN / SOFT-DELETED' : 'ACTIVE IN SHOWROOM'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toLocaleString()}</Text>
        
        {/* Action Panel Row */}
        <View style={styles.actionBtnRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => openEditModal(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={16} color={COLORS.text} style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnText}>EDIT</Text>
          </TouchableOpacity>

          {item.is_hidden ? (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.unhideBtn]}
              onPress={() => handleUnhide(item.id, item.name)}
              activeOpacity={0.7}
            >
              <Ionicons name="eye-outline" size={16} color={COLORS.success} style={{ marginRight: 4 }} />
              <Text style={[styles.actionBtnText, { color: COLORS.success }]}>UNHIDE</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => handleSoftDelete(item.id, item.name)}
              activeOpacity={0.7}
            >
              <Ionicons name="eye-off-outline" size={16} color={COLORS.error} style={{ marginRight: 4 }} />
              <Text style={[styles.actionBtnText, { color: COLORS.error }]}>HIDE</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.actionBtn, styles.hardDeleteBtn]}
            onPress={() => handleHardDelete(item.id, item.name)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.error} style={{ marginRight: 4 }} />
            <Text style={[styles.actionBtnText, { color: COLORS.error }]}>DELETE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer isLoading={isLoading} statusMessage="Refreshing manager dashboard...">
      
      {/* Top Banner Control Room */}
      <View style={styles.header}>
        <View>
          <Text style={styles.panelTitle}>STOCK MANAGER</Text>
          <Text style={styles.panelSub}>SECURE ADMINISTRATIVE CONSOLE</Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={openAddModal}
          activeOpacity={0.8}
        >
          <Ionicons name="add-outline" size={24} color={COLORS.textContrast} />
        </TouchableOpacity>
      </View>

      {/* Main Stock List */}
      <FlatList
        data={furniture}
        renderItem={renderInventoryCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={COLORS.border} />
            <Text style={[TYPOGRAPHY.body, styles.emptyText]}>
              No inventory entries found. Insert one above.
            </Text>
          </View>
        }
      />

      {/* --- ADD / EDIT FLOATING MODAL SHEET --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalCentered}>
          <View style={styles.modalView}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'MODIFY CATALOG ITEM' : 'ADD NEW CATALOG ITEM'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBox}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Modal Input Scroll List */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginVertical: 12 }}>
              
              <CustomInput
                label="Furniture Item Name"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Imperial Velvet Ottoman"
                error={errors.name}
              />

              <CustomInput
                label="Price Amount ($)"
                value={price}
                onChangeText={setPrice}
                placeholder="e.g. 599.00"
                keyboardType="numeric"
                error={errors.price}
              />

              <CustomInput
                label="Unsplash/Public Image URL"
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://images.unsplash.com/photo-..."
                error={errors.imageUrl}
              />

              {/* Custom Selector for Categories */}
              <Text style={styles.categoryLabel}>FURNITURE CATEGORY</Text>
              <View style={styles.catSelectorRow}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catBtn,
                      category === cat && styles.activeCatBtn
                    ]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.8}
                  >
                    <Text 
                      style={[
                        styles.catBtnText,
                        category === cat && styles.activeCatBtnText
                      ]}
                    >
                      {cat.replace(' & ', '\n')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <CustomInput
                label="Design & Spec Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Detailed features, sizing materials, and finish specifics."
                error={errors.description}
              />

            </ScrollView>

            {/* Modal Form Submission Button */}
            <View style={styles.modalActions}>
              <CustomButton
                title={editingItem ? 'SAVE PRODUCT CHANGES' : 'CREATE INVENTORY PRODUCT'}
                onPress={handleSubmit}
                loading={submitLoading}
                variant="primary"
              />
            </View>

          </View>
        </View>
      </Modal>

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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  hiddenItemCard: {
    opacity: 0.6,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
  },
  itemInfo: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  badgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  badgeHidden: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  badgeTextActive: {
    color: COLORS.success,
  },
  badgeTextHidden: {
    color: COLORS.error,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.accent,
    marginBottom: 10,
  },
  actionBtnRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: COLORS.inputBg,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editBtn: {
    borderColor: COLORS.border,
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  unhideBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  hardDeleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
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
  // Modal layout
  modalCentered: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalView: {
    backgroundColor: COLORS.modalBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 34,
    height: '85%',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
  closeBox: {
    padding: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginVertical: 10,
  },
  catSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  catBtn: {
    width: '48%',
    height: 46,
    borderRadius: 8,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  activeCatBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 12,
  },
  activeCatBtnText: {
    color: COLORS.text,
  },
  modalActions: {
    marginTop: 10,
  },
});
