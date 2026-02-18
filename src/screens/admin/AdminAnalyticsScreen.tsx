// Niumba - Admin Analytics Screen
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
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { getAnalyticsStats, getTopProperties, getDailyStats, AnalyticsStats, TopProperty, DailyStats } from '../../services/analyticsStatsService';
import { errorLog } from '../../utils/logHelper';

const { width } = Dimensions.get('window');

type Period = 'day' | 'week' | 'month' | 'year';

const AdminAnalyticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const [period, setPeriod] = useState<Period>('month');
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [topProperties, setTopProperties] = useState<TopProperty[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, topProps, daily] = await Promise.all([
        getAnalyticsStats(period),
        getTopProperties(10),
        getDailyStats(period === 'day' ? 'week' : period),
      ]);
      setStats(statsData);
      setTopProperties(topProps);
      setDailyStats(daily);
    } catch (error) {
      errorLog('Error loading analytics', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const StatBox: React.FC<{
    label: string;
    value: number | string;
    growth: number;
    icon: string;
    color: string;
  }> = ({ label, value, growth, icon, color }) => (
    <View style={styles.statBox}>
      <View style={[styles.statIconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.growthRow}>
        <Ionicons 
          name={growth >= 0 ? 'trending-up' : 'trending-down'} 
          size={14} 
          color={growth >= 0 ? COLORS.success : COLORS.error} 
        />
        <Text style={[styles.growthText, { color: growth >= 0 ? COLORS.success : COLORS.error }]}>
          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
        </Text>
      </View>
    </View>
  );

  const SimpleBarChart: React.FC<{ data: DailyStats[]; maxValue: number }> = ({ data, maxValue }) => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.chartPlaceholder}>
          <Ionicons name="bar-chart-outline" size={48} color={COLORS.textLight} />
          <Text style={styles.chartPlaceholderText}>
            {isEnglish ? 'No data available' : 'Aucune donnée disponible'}
          </Text>
        </View>
      );
    }

    const maxBarHeight = 120;
    const barWidth = (width - SIZES.screenPadding * 2 - 40) / Math.min(data.length, 14);

    return (
      <View style={styles.chartContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartContent}>
            {data.slice(-14).map((item, index) => {
              const barHeight = maxValue > 0 ? (item.views / maxValue) * maxBarHeight : 0;
              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(barHeight, 2),
                          width: barWidth - 4,
                          backgroundColor: COLORS.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>{isEnglish ? 'Views' : 'Vues'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEnglish ? 'Analytics' : 'Analytiques'}</Text>
        <View style={styles.placeholder} />
      </View>

      {loading && !stats ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodButton, period === p && styles.periodButtonActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                  {p === 'day' && (isEnglish ? 'Today' : "Aujourd'hui")}
                  {p === 'week' && (isEnglish ? 'This Week' : 'Cette semaine')}
                  {p === 'month' && (isEnglish ? 'This Month' : 'Ce mois')}
                  {p === 'year' && (isEnglish ? 'This Year' : 'Cette année')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats Grid */}
          {stats && (
            <View style={styles.statsGrid}>
              <StatBox
                label={isEnglish ? 'Total Views' : 'Vues totales'}
                value={stats.views}
                growth={stats.viewsGrowth}
                icon="eye"
                color={COLORS.primary}
              />
              <StatBox
                label={isEnglish ? 'Inquiries' : 'Demandes'}
                value={stats.inquiries}
                growth={stats.inquiriesGrowth}
                icon="chatbubbles"
                color="#5856D6"
              />
              <StatBox
                label={isEnglish ? 'Properties' : 'Propriétés'}
                value={stats.properties}
                growth={stats.propertiesGrowth}
                icon="home"
                color="#00A86B"
              />
              <StatBox
                label={isEnglish ? 'Users' : 'Utilisateurs'}
                value={stats.users}
                growth={stats.usersGrowth}
                icon="people"
                color="#FF9500"
              />
              <StatBox
                label={isEnglish ? 'Agents' : 'Agents'}
                value={stats.agents}
                growth={stats.agentsGrowth}
                icon="briefcase"
                color="#007AFF"
              />
              <StatBox
                label={isEnglish ? 'Appointments' : 'Rendez-vous'}
                value={stats.appointments}
                growth={stats.appointmentsGrowth}
                icon="calendar"
                color="#E4002B"
              />
            </View>
          )}

          {/* Chart Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isEnglish ? 'Views Over Time' : 'Vues dans le temps'}
            </Text>
            <View style={styles.chartCard}>
              {dailyStats.length > 0 ? (
                <SimpleBarChart
                  data={dailyStats}
                  maxValue={Math.max(...dailyStats.map((d) => d.views), 1)}
                />
              ) : (
                <View style={styles.chartPlaceholder}>
                  <Ionicons name="bar-chart-outline" size={48} color={COLORS.textLight} />
                  <Text style={styles.chartPlaceholderText}>
                    {isEnglish ? 'No data available' : 'Aucune donnée disponible'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Top Properties */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isEnglish ? 'Top Properties' : 'Propriétés populaires'}
            </Text>
            
            {topProperties.length > 0 ? (
              <View style={styles.topList}>
                {topProperties.map((property, index) => (
                  <View key={property.id} style={styles.topItem}>
                    <View style={[styles.topRank, index < 3 && styles.topRankTop]}>
                      <Text style={[styles.topRankText, index < 3 && styles.topRankTextTop]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.topInfo}>
                      <Text style={styles.topTitle} numberOfLines={1}>{property.title}</Text>
                      <View style={styles.topStats}>
                        <View style={styles.topStat}>
                          <Ionicons name="eye-outline" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.topStatText}>{property.views.toLocaleString()}</Text>
                        </View>
                        <View style={styles.topStat}>
                          <Ionicons name="chatbubble-outline" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.topStatText}>{property.inquiries}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="home-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyText}>
                  {isEnglish ? 'No properties found' : 'Aucune propriété trouvée'}
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 16,
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  periodTextActive: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.screenPadding,
    gap: 12,
  },
  statBox: {
    width: (width - SIZES.screenPadding * 2 - 12) / 2,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    ...SHADOWS.card,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: SIZES.screenPadding,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    ...SHADOWS.card,
  },
  chartContainer: {
    minHeight: 180,
  },
  chartContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    paddingBottom: 30,
  },
  barContainer: {
    alignItems: 'center',
    marginRight: 4,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 12,
  },
  topList: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.card,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  topRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRankTop: {
    backgroundColor: COLORS.primary,
  },
  topRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  topRankTextTop: {
    color: COLORS.white,
  },
  topInfo: {
    flex: 1,
    marginLeft: 12,
  },
  topTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  topStats: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 16,
  },
  topStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topStatText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 12,
  },
});

export default AdminAnalyticsScreen;
