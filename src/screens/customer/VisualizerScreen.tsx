import React, { useState, useRef, useEffect, useCallback, createElement } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  PanResponder, 
  Animated, 
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { CustomButton } from '../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../context/InventoryContext';

const { width } = Dimensions.get('window');
const CANVAS_HEIGHT = 380;



interface VisualizerScreenProps {
  route: any;
  navigation: any;
}

export const VisualizerScreen: React.FC<VisualizerScreenProps> = ({ route, navigation }) => {
  const { furniture, refreshInventory } = useInventory();
  
  // Resolve dynamically to the absolute latest version of this product in context state
  const item = furniture.find(f => f.id === route.params.item.id) || route.params.item;

  // Overlay modification states
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);

  // Position animated coordinates
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Pure webcam status tracking ('initializing' | 'active' | 'denied')
  const [cameraStatus, setCameraStatus] = useState<'initializing' | 'active' | 'denied'>('initializing');
  const [cameraError, setCameraError] = useState<string>('');
  const videoStreamRef = useRef<any>(null);

  // Callback ref that guarantees stream binding as soon as the HTML5 video node mounts in DOM!
  const videoRef = useCallback((node: any) => {
    if (node && videoStreamRef.current) {
      node.srcObject = videoStreamRef.current;
    }
  }, []);

  // Request camera and start stream
  const startCamera = async () => {
    setCameraStatus('initializing');
    setCameraError('');
    
    // Check if mediaDevices API is available
    if (Platform.OS === 'web') {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errMsg = 'navigator.mediaDevices is undefined (Insecure context or unsupported browser)';
        console.error(errMsg);
        setCameraError(errMsg);
        setCameraStatus('denied');
        return;
      }

      try {
        let stream;
        try {
          // Try environment/rear camera first (ideal for mobile phone scanning)
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
        } catch (innerErr) {
          console.warn('Environment camera constraint rejected, falling back to standard video:', innerErr);
          // Fall back to standard webcam (ideal for PC webcams and laptops)
          stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
        }
        
        videoStreamRef.current = stream;
        
        // Direct DOM query fallback in case mount lifecycle is in-flight
        setTimeout(() => {
          const videoEl = document.querySelector('video');
          if (videoEl) {
            (videoEl as any).srcObject = stream;
          }
        }, 50);

        setCameraStatus('active');
      } catch (err: any) {
        console.error('Camera access error:', err);
        const errMsg = err.name ? `${err.name}: ${err.message}` : String(err);
        setCameraError(errMsg);
        setCameraStatus('denied');
        
        // Inform user how to manually enable permissions in browser
        Alert.alert(
          'Camera Permission Blocked',
          `Access failed: ${errMsg}. Please click the settings/camera icon (🎥) in your browser address bar to allow camera access, then click ALLOW ACCESS again!`,
          [{ text: 'Acknowledged', style: 'default' }]
        );
      }
    } else {
      // Direct active status for native/webcam mock simulation
      setCameraStatus('active');
    }
  };

  // Securely boot camera on mount and clean up on unmount
  useEffect(() => {
    startCamera();
    refreshInventory(); // Safely sync catalog changes in the background!
    return () => {
      if (videoStreamRef.current) {
        const tracks = videoStreamRef.current.getTracks();
        tracks.forEach((track: any) => track.stop());
      }
    };
  }, []);

  // --- INTERACTIVE DRAGGING: PAN RESPONDER SETUP ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
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
        {cameraStatus === 'initializing' && (
          <View style={styles.placeholderContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.placeholderText}>Initializing AURA AR Camera...</Text>
          </View>
        )}

        {cameraStatus === 'denied' && (
          <View style={styles.placeholderContainer}>
            <Ionicons name="camera-reverse-outline" size={48} color={COLORS.error} style={{ marginBottom: 12 }} />
            <Text style={styles.deniedTitle}>CAMERA LOCKED</Text>
            <Text style={styles.deniedSub}>
              AURA requires camera permissions to overlay furniture on your actual room in real-time.
            </Text>
            
            {cameraError ? (
              <Text style={styles.errorDiagnosisText}>
                DIAGNOSTIC: {cameraError}
              </Text>
            ) : null}

            <TouchableOpacity style={styles.reRequestBtn} onPress={startCamera}>
              <Text style={styles.reRequestBtnText}>ALLOW ACCESS</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Video stream layer */}
        {Platform.OS === 'web' ? (
          <View 
            style={[styles.videoContainer, cameraStatus !== 'active' && { opacity: 0 }]}
            pointerEvents="none"
          >
            {createElement('video', {
              ref: videoRef,
              autoPlay: true,
              playsInline: true,
              style: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
              }
            })}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="sparkles-sharp" size={48} color={COLORS.accent} style={{ marginBottom: 12 }} />
            <Text style={styles.placeholderText}>Live AR Camera Active (Native Mobile)</Text>
          </View>
        )}
        
        {/* Floating Item Canvas Wrapper */}
        {cameraStatus === 'active' && (
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
                source={{ uri: item.ar_image_url || item.image_url }} 
                style={[
                  styles.floatingFurniture,
                  styles.arHologramEffect
                ]} 
              />
            </Animated.View>
          </View>
        )}
      </View>

      {/* Backdrop Selectors Carousel */}
      <Text style={styles.controlHeader}>AR ROOM INSTRUCTIONS</Text>
      <View style={styles.arActiveAlertRow}>
        <Ionicons name="sparkles" size={20} color={COLORS.accent} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.instructionTitle}>HOW TO FIT PRODUCTS:</Text>
          <Text style={styles.arActiveAlertText}>
            1. Stand or hold your device pointing at the floor or wall where you want the furniture.
          </Text>
          <Text style={styles.arActiveAlertText}>
            2. Use one finger to drag the product PNG and place it in position.
          </Text>
          <Text style={styles.arActiveAlertText}>
            3. Tap the Scale and Rotation buttons below to adjust the dimensions to fit your space.
          </Text>
        </View>
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
                onPress={() => setScale(Math.max(0.2, scale - 0.1))}
                activeOpacity={0.7}
              >
                <Ionicons name="remove-circle-outline" size={24} color={COLORS.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.adjustBtn} 
                onPress={() => setScale(Math.min(6.0, scale + 0.1))}
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
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingFurniture: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    opacity: 1.0, // Full solid premium photo overlay!
  },
  controlHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 1.5,
    marginHorizontal: 28,
    marginVertical: 10,
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
  // AR Live Camera Styles
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#0E0D11',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    ...StyleSheet.absoluteFillObject,
  },
  placeholderText: {
    marginTop: 14,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  deniedTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.error,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  deniedSub: {
    fontSize: 12,
    color: '#A19EA9',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  reRequestBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  reRequestBtnText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#000',
  },
  arHologramEffect: {
    shadowColor: COLORS.accent || '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  },
  arActiveAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  instructionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  arActiveAlertText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
    marginTop: 2,
  },
  errorDiagnosisText: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
});
