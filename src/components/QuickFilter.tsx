// Niumba - Quick Filter Button (Zillow Style)
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

interface QuickFilterProps {
  label: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}

const QuickFilter: React.FC<QuickFilterProps> = ({
  label,
  icon,
  isActive,
  onPress,
}) => {
  const getIcon = () => {
    const iconColor = isActive ? COLORS.white : COLORS.textSecondary;
    const iconSize = 18;

    switch (icon) {
      case 'apps':
        return <Ionicons name="apps" size={iconSize} color={iconColor} />;
      case 'home':
        return <Ionicons name="home-outline" size={iconSize} color={iconColor} />;
      case 'key':
        return <Ionicons name="key-outline" size={iconSize} color={iconColor} />;
      case 'terrain':
        return <MaterialCommunityIcons name="terrain" size={iconSize} color={iconColor} />;
      case 'store':
        return <MaterialCommunityIcons name="store-outline" size={iconSize} color={iconColor} />;
      default:
        return <Ionicons name="apps" size={iconSize} color={iconColor} />;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.containerActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {getIcon()}
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: SIZES.radiusFull,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  containerActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  labelActive: {
    color: COLORS.white,
  },
});

export default QuickFilter;

