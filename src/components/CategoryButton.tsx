// Niumba - Category Button Component
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Category } from '../types';

interface CategoryButtonProps {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
  isEnglish: boolean;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({
  category,
  isSelected,
  onPress,
  isEnglish,
}) => {
  const getIcon = (iconName: string, size: number, color: string) => {
    switch (iconName) {
      case 'home':
        return <Ionicons name="home-outline" size={size} color={color} />;
      case 'building':
        return <MaterialCommunityIcons name="office-building-outline" size={size} color={color} />;
      case 'door-closed':
        return <MaterialCommunityIcons name="door" size={size} color={color} />;
      case 'bed':
        return <Ionicons name="bed-outline" size={size} color={color} />;
      case 'home-city':
        return <MaterialCommunityIcons name="home-city-outline" size={size} color={color} />;
      case 'terrain':
        return <MaterialCommunityIcons name="image-filter-hdr" size={size} color={color} />;
      case 'store':
        return <MaterialCommunityIcons name="store-outline" size={size} color={color} />;
      case 'warehouse':
        return <MaterialCommunityIcons name="warehouse" size={size} color={color} />;
      default:
        return <Ionicons name="home-outline" size={size} color={color} />;
    }
  };

  const name = isEnglish ? category.nameEn : category.name;

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
        {getIcon(
          category.icon,
          24,
          isSelected ? COLORS.white : COLORS.primary
        )}
      </View>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 70,
  },
  containerSelected: {},
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  iconContainerSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  labelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default CategoryButton;

