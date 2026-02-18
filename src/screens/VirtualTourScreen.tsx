// Niumba - Virtual Tour Screen (360° View)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  ScrollView,
  PanResponder,
  Animated,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { usePropertyVirtualTour } from '../hooks/useVirtualTour';
import type { VirtualTourRoom } from '../services/virtualTourService';

const { width, height } = Dimensions.get('window');

// VirtualTourRoom interface is now imported from service
// This local interface is kept for backward compatibility with route params
interface VirtualTourRoomLocal {
  id: string;
  name: string;
  name_en: string;
  panoramaUrl: string;
  thumbnailUrl: string;
  hotspots?: {
    id: string;
    x: number;
    y: number;
    targetRoomId?: string;
    label?: string;
    type: 'navigation' | 'info';
  }[];
}

interface VirtualTourScreenProps {
  navigation: any;
  route: {
    params: {
      propertyId: string;
      propertyTitle: string;
      tourRooms?: VirtualTourRoomLocal[];
    };
  };
}

// Fallback mock data if Supabase doesn't have tour rooms
const MOCK_TOUR_ROOMS: VirtualTourRoomLocal[] = [
  {
    id: 'living',
    name: 'Salon',
    name_en: 'Living Room',
    panoramaUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    hotspots: [
      { id: 'h1', x: 30, y: 50, targetRoomId: 'kitchen', label: 'Cuisine', type: 'navigation' },
      { id: 'h2', x: 70, y: 45, targetRoomId: 'bedroom', label: 'Chambre', type: 'navigation' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Cuisine',
    name_en: 'Kitchen',
    panoramaUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=2000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    hotspots: [
      { id: 'h3', x: 20, y: 50, targetRoomId: 'living', label: 'Salon', type: 'navigation' },
    ],
  },
  {
    id: 'bedroom',
    name: 'Chambre principale',
    name_en: 'Master Bedroom',
    panoramaUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=2000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400',
    hotspots: [
      { id: 'h4', x: 80, y: 50, targetRoomId: 'bathroom', label: 'Salle de bain', type: 'navigation' },
      { id: 'h5', x: 15, y: 50, targetRoomId: 'living', label: 'Salon', type: 'navigation' },
    ],
  },
  {
    id: 'bathroom',
    name: 'Salle de bain',
    name_en: 'Bathroom',
    panoramaUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=2000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400',
    hotspots: [
      { id: 'h6', x: 50, y: 50, targetRoomId: 'bedroom', label: 'Chambre', type: 'navigation' },
    ],
  },
  {
    id: 'exterior',
    name: 'Extérieur',
    name_en: 'Exterior',
    panoramaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
  },
];

const VirtualTourScreen: React.FC<VirtualTourScreenProps> = ({ navigation, route }) => {
  const { propertyId, propertyTitle, tourRooms: routeTourRooms } = route.params;
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  // Fetch tour rooms from Supabase
  const { rooms: supabaseRooms, loading, error } = usePropertyVirtualTour(propertyId);

  // Transform Supabase rooms to local format, or use route params, or fallback to mock
  const transformRoom = (room: VirtualTourRoom): VirtualTourRoomLocal => ({
    id: room.id,
    name: room.name,
    name_en: room.name_en || room.name,
    panoramaUrl: room.panorama_url,
    thumbnailUrl: room.thumbnail_url,
    hotspots: (room.hotspots || []).map((hotspot) => ({
      id: hotspot.id,
      x: hotspot.x,
      y: hotspot.y,
      targetRoomId: hotspot.target_room_id,
      label: isEnglish ? (hotspot.label_en || hotspot.label) : hotspot.label,
      type: hotspot.type,
    })),
  });

  const availableRooms: VirtualTourRoomLocal[] = 
    supabaseRooms.length > 0
      ? supabaseRooms.map(transformRoom)
      : routeTourRooms || MOCK_TOUR_ROOMS;

  const [currentRoom, setCurrentRoom] = useState<VirtualTourRoomLocal | null>(null);
  const [showRoomList, setShowRoomList] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Pan animation for 360 effect
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setShowHelp(false);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        // Keep the position (simulating 360 rotation)
        pan.extractOffset();
      },
    })
  ).current;

  // Update current room when rooms are loaded
  useEffect(() => {
    if (availableRooms.length > 0 && (!currentRoom || !availableRooms.find(r => r.id === currentRoom.id))) {
      setCurrentRoom(availableRooms[0]);
    }
  }, [availableRooms, currentRoom]);

  const navigateToRoom = (roomId: string) => {
    const room = availableRooms.find(r => r.id === roomId);
    if (room) {
      // Reset pan position
      pan.setValue({ x: 0, y: 0 });
      pan.setOffset({ x: 0, y: 0 });
      setCurrentRoom(room);
    }
  };

  const Hotspot: React.FC<{
    hotspot: NonNullable<VirtualTourRoomLocal['hotspots']>[0];
  }> = ({ hotspot }) => (
    <TouchableOpacity
      style={[
        styles.hotspot,
        {
          left: `${hotspot.x}%`,
          top: `${hotspot.y}%`,
        },
      ]}
      onPress={() => {
        if (hotspot.type === 'navigation' && hotspot.targetRoomId) {
          navigateToRoom(hotspot.targetRoomId);
        }
      }}
    >
      <View style={styles.hotspotInner}>
        <Ionicons 
          name={hotspot.type === 'navigation' ? 'arrow-forward-circle' : 'information-circle'} 
          size={28} 
          color={COLORS.white} 
        />
      </View>
      {hotspot.label && (
        <View style={styles.hotspotLabel}>
          <Text style={styles.hotspotLabelText}>{hotspot.label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const RoomThumbnail: React.FC<{ room: VirtualTourRoomLocal }> = ({ room }) => (
    <TouchableOpacity
      style={[
        styles.roomThumbnail,
        currentRoom?.id === room.id && styles.roomThumbnailActive,
      ]}
      onPress={() => {
        navigateToRoom(room.id);
        setShowRoomList(false);
      }}
    >
      <Image source={{ uri: room.thumbnailUrl }} style={styles.thumbnailImage} />
      <View style={styles.thumbnailOverlay}>
        <Text style={styles.thumbnailText}>
          {isEnglish ? room.name_en : room.name}
        </Text>
      </View>
      {currentRoom?.id === room.id && (
        <View style={styles.thumbnailActive}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden={isFullscreen} barStyle="light-content" />
      
      {/* Header */}
      {!isFullscreen && (
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <Text style={styles.title}>{isEnglish ? 'Virtual Tour' : 'Visite Virtuelle'}</Text>
              <Text style={styles.subtitle}>
                {currentRoom ? (isEnglish ? currentRoom.name_en : currentRoom.name) : propertyTitle}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setIsFullscreen(true)}
            >
              <Ionicons name="expand" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {/* 360 Viewer */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.white} />
          <Text style={styles.loadingText}>
            {isEnglish ? 'Loading virtual tour...' : 'Chargement de la visite virtuelle...'}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.white} />
          <Text style={styles.loadingText}>{error}</Text>
        </View>
      ) : currentRoom ? (
        <View style={styles.viewerContainer}>
          <Animated.View
            style={[
              styles.panoramaContainer,
              {
                transform: [
                  { translateX: pan.x },
                  { translateY: Animated.multiply(pan.y, 0.3) }, // Limit vertical movement
                  { scale: scale },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Image
              source={{ uri: currentRoom.panoramaUrl }}
              style={styles.panoramaImage}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Hotspots */}
          {currentRoom.hotspots?.map(hotspot => (
            <Hotspot key={hotspot.id} hotspot={hotspot} />
          ))}

        {/* Help Overlay */}
        {showHelp && (
          <View style={styles.helpOverlay}>
            <View style={styles.helpContent}>
              <Ionicons name="hand-left" size={40} color={COLORS.white} />
              <Text style={styles.helpText}>
                {isEnglish 
                  ? 'Drag to look around\nTap arrows to move between rooms'
                  : 'Glissez pour regarder\nTapez les flèches pour changer de pièce'}
              </Text>
            </View>
          </View>
        )}

        {/* Fullscreen exit button */}
        {isFullscreen && (
          <TouchableOpacity
            style={styles.exitFullscreen}
            onPress={() => setIsFullscreen(false)}
          >
            <Ionicons name="contract" size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}

        {/* Compass indicator */}
        <View style={styles.compassContainer}>
          <Ionicons name="compass" size={28} color={COLORS.white} />
        </View>
        </View>
      ) : null}

      {/* Room selector */}
      {!isFullscreen && (
        <View style={styles.roomSelector}>
          <TouchableOpacity
            style={styles.roomSelectorButton}
            onPress={() => setShowRoomList(!showRoomList)}
          >
            <Ionicons name="grid" size={20} color={COLORS.white} />
            <Text style={styles.roomSelectorText}>
              {isEnglish ? 'All Rooms' : 'Toutes les pièces'} ({availableRooms.length})
            </Text>
            <Ionicons 
              name={showRoomList ? 'chevron-down' : 'chevron-up'} 
              size={20} 
              color={COLORS.white} 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Room List Modal */}
      <Modal
        visible={showRoomList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRoomList(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRoomList(false)}
        >
          <View style={styles.roomListModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {isEnglish ? 'Select Room' : 'Choisir une pièce'}
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roomList}
            >
              {availableRooms.map(room => (
                <RoomThumbnail key={room.id} room={room} />
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Navigation */}
      {!isFullscreen && (
        <View style={styles.bottomNav}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bottomNavContent}
          >
            {availableRooms.map((room, index) => (
              <TouchableOpacity
                key={room.id}
                style={[
                  styles.navDot,
                  currentRoom?.id === room.id && styles.navDotActive,
                ]}
                onPress={() => navigateToRoom(room.id)}
              >
                <Text style={[
                  styles.navDotText,
                  currentRoom?.id === room.id && styles.navDotTextActive,
                ]}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.roomCount}>
            {currentRoom ? availableRooms.findIndex(r => r.id === currentRoom.id) + 1 : 0} / {availableRooms.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerSafeArea: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  viewerContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  panoramaContainer: {
    width: width * 2,
    height: height,
    marginLeft: -width / 2,
  },
  panoramaImage: {
    width: '100%',
    height: '100%',
  },
  hotspot: {
    position: 'absolute',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  hotspotInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 106, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  hotspotLabel: {
    position: 'absolute',
    bottom: -24,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    width: 80,
  },
  hotspotLabelText: {
    color: COLORS.white,
    fontSize: 11,
    textAlign: 'center',
  },
  helpOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpContent: {
    alignItems: 'center',
  },
  helpText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  exitFullscreen: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomSelector: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
  },
  roomSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 8,
  },
  roomSelectorText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  roomListModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 34,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  roomList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  roomThumbnail: {
    width: 140,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  roomThumbnailActive: {
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 8,
  },
  thumbnailText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailActive: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavContent: {
    flexDirection: 'row',
    gap: 8,
  },
  navDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navDotActive: {
    backgroundColor: COLORS.primary,
  },
  navDotText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  navDotTextActive: {
    color: COLORS.white,
  },
  roomCount: {
    position: 'absolute',
    right: 0,
    color: COLORS.white,
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
  },
});

export default VirtualTourScreen;

