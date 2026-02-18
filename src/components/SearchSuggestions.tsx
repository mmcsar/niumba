// Niumba - Search Suggestions Component
// Affiche des suggestions intelligentes pendant la recherche
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SearchSuggestion } from '../services/advancedSearchService';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSelect: (suggestion: SearchSuggestion) => void;
  onClearHistory?: () => void;
  showHistory?: boolean;
  isEnglish?: boolean;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSelect,
  onClearHistory,
  showHistory = false,
  isEnglish = false,
}) => {
  if (suggestions.length === 0) return null;

  const getIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'query':
        return 'time-outline';
      case 'city':
        return 'location-outline';
      case 'type':
        return 'home-outline';
      case 'price_range':
        return 'cash-outline';
      default:
        return 'search-outline';
    }
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => onSelect(item)}
    >
      <Ionicons
        name={getIcon(item.type) as any}
        size={20}
        color={COLORS.textSecondary}
      />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionLabel}>{item.label}</Text>
        {item.count !== undefined && (
          <Text style={styles.suggestionCount}>
            {item.count} {isEnglish ? 'results' : 'résultats'}
          </Text>
        )}
      </View>
      <Ionicons
        name="arrow-forward"
        size={16}
        color={COLORS.textLight}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {showHistory && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEnglish ? 'Recent Searches' : 'Recherches récentes'}
          </Text>
          {onClearHistory && (
            <TouchableOpacity onPress={onClearHistory}>
              <Text style={styles.clearText}>
                {isEnglish ? 'Clear' : 'Effacer'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <FlatList
        data={suggestions}
        keyExtractor={(item, index) => `${item.type}-${item.value}-${index}`}
        renderItem={renderSuggestion}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    maxHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  suggestionCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default SearchSuggestions;


