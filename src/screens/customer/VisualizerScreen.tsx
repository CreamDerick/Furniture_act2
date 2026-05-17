import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  PanResponder, 
  Animated, 
  Alert 
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { CustomButton } from '../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CANVAS_HEIGHT = 380;

interface VisualizerScreenProps {
  route: any;
  navigation: any;
}

interface RoomTemplate {
  id: number;
  name: string;
  url: string;
}

const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 1,
    name: 'Luxury Living Room',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'Royal Master Bedroom',
    url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'Elegant Studio Lounge',
    url: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=800&q=80'
  }
];

export const VisualizerScreen: React.FC<VisualizerScreenProps> = ({ route, navigation }) => {
  const { item } = route.params;

  // Active room backdrop template
  const [selectedRoom, setSelectedRoom] = useState<RoomTemplate>(ROOM_TEMPLATES[0]);

  // Overlay modification states
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);

  // Position animated coordinates
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // --- INTERACTIVE DRAGGING: PAN RESPONDER SETUP ---
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          // Capture offset to prevent item snapping on subsequent touches
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false } // Required for animated coordinates
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;

  // Reset modifiers
  const handleReset = () => {
    setScale(1.0);
    setRotation(0);
    pan.setValue({ x: 0, y: 0 });
  };

  const handleCaptureFit = () => {
    Alert.alert(
      'Visualization Preserved',
      'The custom furniture placement has been calculated and locked successfully! Take a screenshot to save this preview.',
      [{ text: 'Acknowledged', style: 'default' }]
    );
  };

  return (
    <ScreenContainer scrollable={true}>
      
      {/* Top Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity 
          style={styles.circleBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Room Fitting</Text>
        <TouchableOpacity 
          style={styles.circleBtn} 
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={20} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      {/* Product Information Overlay Card */}
      <View style={styles.prodOverlayCard}>
        <Image source={{ uri: item.image_url }} style={styles.thumbnail} />
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <Text style={styles.prodName}>{item.name}</Text>
          <Text style={styles.prodPrice}>${item.price.toLocaleString()}</Text>
        </View>
        <View style={styles.draggingNotice}>
          <Ionicons name="hand-right-outline" size={16} color={COLORS.accent} style={{ marginRight: 4 }} />
          <Text style={styles.noticeText}>Drag product to place</Text>
        </View>
      </View>

      {/* --- ROOM VISUALIZER INTERACTIVE CANVAS --- */}
      <View style={styles.canvasFrame}>
        {/* Backdrop Room Photo */}
        <Image source={{ uri: selectedRoom.url }} style={styles.canvasBackground} />
        
        {/* Floating Item Canvas Wrapper */}
        <View style={styles.overlayContainer}>
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              pan.getLayout(),
              {
                transform: [
                  { scale: scale },
                  { rotate: `${rotation}deg` }
                ]
              }
            ]}
          >
            <Image 
              source={{ uri: item.image_url }} 
              style={styles.floatingFurniture} 
            />
          </Animated.View>
        </View>
      </View>

      {/* Backdrop Selectors Carousel */}
      <Text style={styles.controlHeader}>SELECT BACKDROP SCENARIO</Text>
      <View style={styles.backdropList}>
        {ROOM_TEMPLATES.map((room) => (
          <TouchableOpacity
            key={room.id}
            style={[
              styles.backdropCard,
              selectedRoom.id === room.id && styles.activeBackdropCard
            ]}
            onPress={() => setSelectedRoom(room)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: room.url }} style={styles.backdropThumb} />
            <Text 
              style={[
                styles.backdropName,
                selectedRoom.id === room.id && styles.activeBackdropName
              ]}
              numberOfLines={1}
            >
              {room.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- SCALING & ROTATION CONTROL WORKSTATION --- */}
      <View style={styles.controlDashboard}>
        <Text style={styles.controlHeader}>AR COMPONENT CONTROLS</Text>
        
        <View style={styles.controlPanelRow}>
          {/* SCALE ADJUSTMENTS */}
          <View style={styles.controlBox}>
            <Text style={styles.controlLabel}>FURNITURE SCALE ({scale.toFixed(1)}x)</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity 
                style={styles.adjustBtn} 
                onPress={() => setScale(Math.max(0.4, scale - 0.1))}
                activeOpacity={0.7}
              >
                <Ionicons name="remove-circle-outline" size={24} color={COLORS.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.adjustBtn} 
                onPress={() => setScale(Math.min(2.5, scale + 0.1))}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={24} color={COLORS.accent} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ROTATION ADJUSTMENTS */}
          <View style={styles.controlBox}>
            <Text style={styles.controlLabel}>ROTATION ({rotation}°)</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity 
                style={styles.adjustBtn} 
                onPress={() => setRotation(rotation - 15)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back-circle-outline" size={24} color={COLORS.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.adjustBtn} 
                onPress={() => setRotation(rotation + 15)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward-circle-outline" size={24} color={COLORS.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Lock Overlay Calculations */}
        <View style={styles.saveBtnWrapper}>
          <CustomButton 
            title="PRESERVE PLACEMENT VIEW" 
            onPress={handleCaptureFit} 
            variant="primary" 
          />
        </View>
      </View>

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  prodOverlayCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 24,
    marginVertical: 8,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  thumbnail: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: COLORS.inputBg,
  },
  prodName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  prodPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accent,
    marginTop: 2,
  },
  draggingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  noticeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 0.5,
  },
  canvasFrame: {
    height: CANVAS_HEIGHT,
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 24,
    marginVertical: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  canvasBackground: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingFurniture: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    // Slight opacity to make it look like a holographic AR projection
    opacity: 0.95,
  },
  controlHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 1.5,
    marginHorizontal: 28,
    marginVertical: 10,
  },
  backdropList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  backdropCard: {
    width: (width - 64) / 3,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 6,
    alignItems: 'center',
    overflow: 'hidden',
  },
  activeBackdropCard: {
    borderColor: COLORS.accent,
  },
  backdropThumb: {
    width: '100%',
    height: 54,
    borderRadius: 8,
  },
  backdropName: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  activeBackdropName: {
    color: COLORS.accent,
  },
  controlDashboard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    marginHorizontal: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  controlPanelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  controlBox: {
    width: '47%',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustBtn: {
    padding: 6,
    marginHorizontal: 12,
  },
  saveBtnWrapper: {
    marginTop: 16,
    width: '100%',
  },
});
