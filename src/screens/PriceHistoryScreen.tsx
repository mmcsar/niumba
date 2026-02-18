// Niumba - Price History Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { usePriceHistory } from '../hooks/usePriceHistory';
import { useProperty } from '../hooks/useProperties';

const { width } = Dimensions.get('window');

interface PriceHistoryScreenProps {
  navigation: any;
  route: {
    params: {
      propertyId: string;
      propertyTitle: string;
      currentPrice: number;
    };
  };
}

const PriceHistoryScreen: React.FC<PriceHistoryScreenProps> = ({ navigation, route }) => {
  const { propertyId, propertyTitle } = route.params;
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year' | 'all' | '6m' | '1y' | '2y'>('year');
  const { property, loading: propertyLoading } = useProperty(propertyId);
  const { history, statistics, loading, error, loadHistory } = usePriceHistory(propertyId);

  const currentPrice = property?.price || route.params.currentPrice;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (selectedPeriod === '6m') {
      loadHistory('month');
    } else if (selectedPeriod === '1y' || selectedPeriod === '2y') {
      loadHistory('year');
    } else {
      loadHistory('all');
    }
  }, [selectedPeriod, loadHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory(selectedPeriod === '6m' ? 'month' : selectedPeriod === '1y' || selectedPeriod === '2y' ? 'year' : 'all');
    setRefreshing(false);
  };

  // Transform history data for display
  const priceHistory = history.map(entry => ({
    date: entry.created_at,
    price: entry.price,
    event: entry.event_description || entry.event_type,
  }));

  // Add current price if not in history
  if (priceHistory.length === 0 || priceHistory[0].price !== currentPrice) {
    priceHistory.unshift({
      date: new Date().toISOString(),
      price: currentPrice,
      event: isEnglish ? 'Current price' : 'Prix actuel',
    });
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR', {
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate statistics from hook or fallback
  const prices = priceHistory.map(p => p.price);
  const maxPrice = statistics?.highestPrice || (prices.length > 0 ? Math.max(...prices, currentPrice) : currentPrice);
  const minPrice = statistics?.lowestPrice || (prices.length > 0 ? Math.min(...prices, currentPrice) : currentPrice);
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : currentPrice;
  const priceChange = statistics?.priceChangePercent || (prices.length > 0 
    ? ((currentPrice - prices[prices.length - 1]) / prices[prices.length - 1]) * 100 
    : 0);

  // Simple chart rendering
  const chartHeight = 200;
  const chartWidth = width - SIZES.screenPadding * 2 - 32;
  const normalizedPrices = prices.map(p => ((p - minPrice) / (maxPrice - minPrice)) * chartHeight);

  const PeriodButton: React.FC<{ period: 'month' | 'year' | 'all'; label: string }> = ({ period, label }) => (
    <TouchableOpacity
      style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
      onPress={() => setSelectedPeriod(period)}
    >
      <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && priceHistory.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>{isEnglish ? 'Price History' : 'Historique des prix'}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{propertyTitle}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>{isEnglish ? 'Price History' : 'Historique des prix'}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{propertyTitle}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Current Price */}
        <View style={styles.currentPriceCard}>
          <Text style={styles.currentPriceLabel}>
            {isEnglish ? 'Current Price' : 'Prix actuel'}
          </Text>
          <Text style={styles.currentPrice}>{formatPrice(currentPrice)}</Text>
          <View style={styles.priceChangeContainer}>
            <Ionicons 
              name={priceChange >= 0 ? 'trending-up' : 'trending-down'} 
              size={18} 
              color={priceChange >= 0 ? COLORS.success : COLORS.error} 
            />
            <Text style={[styles.priceChange, { color: priceChange >= 0 ? COLORS.success : COLORS.error }]}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}% {isEnglish ? 'since first listing' : 'depuis la première mise en vente'}
            </Text>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <PeriodButton period="month" label={isEnglish ? '1 month' : '1 mois'} />
          <PeriodButton period="year" label={isEnglish ? '1 year' : '1 an'} />
          <PeriodButton period="all" label={isEnglish ? 'All' : 'Tout'} />
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartContainer}>
            {/* Y-axis labels */}
            <View style={styles.yAxisLabels}>
              <Text style={styles.axisLabel}>{formatPrice(maxPrice)}</Text>
              <Text style={styles.axisLabel}>{formatPrice((maxPrice + minPrice) / 2)}</Text>
              <Text style={styles.axisLabel}>{formatPrice(minPrice)}</Text>
            </View>
            
            {/* Chart area */}
            <View style={[styles.chartArea, { height: chartHeight }]}>
              {/* Grid lines */}
              <View style={[styles.gridLine, { top: 0 }]} />
              <View style={[styles.gridLine, { top: chartHeight / 2 }]} />
              <View style={[styles.gridLine, { top: chartHeight }]} />
              
              {/* Line chart */}
              <View style={styles.chartLine}>
                {normalizedPrices.map((height, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.chartPoint,
                      { 
                        bottom: height,
                        left: (chartWidth / (prices.length - 1)) * index - 5,
                      }
                    ]}
                  >
                    <View style={styles.chartDot} />
                    {index < normalizedPrices.length - 1 && (
                      <View 
                        style={[
                          styles.chartConnector,
                          {
                            width: chartWidth / (prices.length - 1),
                            transform: [
                              { rotate: `${Math.atan2(normalizedPrices[index + 1] - height, chartWidth / (prices.length - 1)) * 180 / Math.PI}deg` }
                            ]
                          }
                        ]} 
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          {/* X-axis labels */}
          <View style={styles.xAxisLabels}>
            <Text style={styles.axisLabel}>{formatDate(priceHistory[priceHistory.length - 1].date)}</Text>
            <Text style={styles.axisLabel}>{formatDate(priceHistory[0].date)}</Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>{isEnglish ? 'Statistics' : 'Statistiques'}</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{isEnglish ? 'Highest' : 'Plus haut'}</Text>
              <Text style={styles.statValue}>{formatPrice(maxPrice)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{isEnglish ? 'Lowest' : 'Plus bas'}</Text>
              <Text style={styles.statValue}>{formatPrice(minPrice)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{isEnglish ? 'Average' : 'Moyenne'}</Text>
              <Text style={styles.statValue}>{formatPrice(avgPrice)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{isEnglish ? 'Change' : 'Variation'}</Text>
              <Text style={[styles.statValue, { color: priceChange >= 0 ? COLORS.success : COLORS.error }]}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>{isEnglish ? 'Price Timeline' : 'Chronologie des prix'}</Text>
          
          {priceHistory.map((point, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLine}>
                <View style={[styles.timelineDot, point.event && styles.timelineDotEvent]} />
                {index < priceHistory.length - 1 && <View style={styles.timelineConnector} />}
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineDate}>{formatDate(point.date)}</Text>
                  <Text style={styles.timelinePrice}>{formatPrice(point.price)}</Text>
                </View>
                {point.event && (
                  <Text style={styles.timelineEvent}>{point.event}</Text>
                )}
                {index > 0 && (
                  <Text style={[
                    styles.timelineChange,
                    { color: point.price <= priceHistory[index - 1].price ? COLORS.success : COLORS.error }
                  ]}>
                    {point.price <= priceHistory[index - 1].price ? '↓' : '↑'} {formatPrice(Math.abs(point.price - priceHistory[index - 1].price))}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Market Info */}
        <View style={styles.marketCard}>
          <View style={styles.marketHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.marketTitle}>
              {isEnglish ? 'Market Context' : 'Contexte du marché'}
            </Text>
          </View>
          <Text style={styles.marketText}>
            {isEnglish 
              ? 'Property prices in Haut-Katanga have shown steady growth over the past 5 years, with an average annual appreciation of 8-12%.'
              : 'Les prix de l\'immobilier au Haut-Katanga ont montré une croissance régulière au cours des 5 dernières années, avec une appréciation annuelle moyenne de 8-12%.'}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  currentPriceCard: {
    margin: SIZES.screenPadding,
    padding: 24,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
  },
  currentPriceLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  currentPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginVertical: 8,
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  priceChange: {
    fontSize: 13,
    fontWeight: '500',
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: SIZES.screenPadding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 4,
    ...SHADOWS.small,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: SIZES.radius - 4,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  periodTextActive: {
    color: COLORS.white,
  },
  chartCard: {
    margin: SIZES.screenPadding,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    ...SHADOWS.card,
  },
  chartContainer: {
    flexDirection: 'row',
  },
  yAxisLabels: {
    width: 60,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  chartLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  chartPoint: {
    position: 'absolute',
    alignItems: 'center',
  },
  chartDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  chartConnector: {
    position: 'absolute',
    height: 2,
    backgroundColor: COLORS.primary,
    left: 5,
    bottom: 4,
    transformOrigin: 'left center',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingLeft: 60,
  },
  statsCard: {
    marginHorizontal: SIZES.screenPadding,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    ...SHADOWS.card,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  timelineCard: {
    margin: SIZES.screenPadding,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    ...SHADOWS.card,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLine: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.borderLight,
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 1,
  },
  timelineDotEvent: {
    backgroundColor: COLORS.primary,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.borderLight,
    marginTop: -2,
    marginBottom: -2,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  timelinePrice: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  timelineEvent: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: 4,
  },
  timelineChange: {
    fontSize: 12,
    marginTop: 4,
  },
  marketCard: {
    marginHorizontal: SIZES.screenPadding,
    padding: 16,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  marketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  marketTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  marketText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PriceHistoryScreen;

