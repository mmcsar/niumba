// Niumba - Support/Assistance Screen
// MMC SARL Company Information

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import COMPANY from '../constants/company';

interface SupportScreenProps {
  navigation: any;
}

const SupportScreen: React.FC<SupportScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const handleEmail = () => {
    Linking.openURL(`mailto:${COMPANY.contact.email}`);
  };

  const handlePhone = () => {
    if (COMPANY.contact.phone && !COMPANY.contact.phone.includes('XXX')) {
      Linking.openURL(`tel:${COMPANY.contact.phone}`);
    }
  };

  const handleWhatsApp = () => {
    if (COMPANY.contact.whatsapp && !COMPANY.contact.whatsapp.includes('XXX')) {
      Linking.openURL(`https://wa.me/${COMPANY.contact.whatsapp.replace(/\s/g, '')}`);
    } else {
      // Use email as fallback
      handleEmail();
    }
  };

  const handleWebsite = () => {
    if (COMPANY.contact.website) {
      Linking.openURL(COMPANY.contact.website);
    }
  };

  const InfoCard: React.FC<{
    icon: string;
    iconType?: 'ionicons' | 'material';
    title: string;
    children: React.ReactNode;
  }> = ({ icon, iconType = 'ionicons', title, children }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {iconType === 'ionicons' ? (
          <Ionicons name={icon as any} size={24} color={COLORS.primary} />
        ) : (
          <MaterialCommunityIcons name={icon as any} size={24} color={COLORS.primary} />
        )}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardContent}>{children}</View>
    </View>
  );

  const ContactButton: React.FC<{
    icon: string;
    label: string;
    sublabel?: string;
    onPress: () => void;
    color?: string;
  }> = ({ icon, label, sublabel, onPress, color = COLORS.primary }) => (
    <TouchableOpacity style={styles.contactButton} onPress={onPress}>
      <View style={[styles.contactIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.contactTextContainer}>
        <Text style={styles.contactLabel}>{label}</Text>
        {sublabel && <Text style={styles.contactSublabel}>{sublabel}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('support.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Company Header */}
        <View style={styles.companyHeader}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>MMC</Text>
          </View>
          <Text style={styles.companyName}>{COMPANY.name}</Text>
          <Text style={styles.companyFullName}>{COMPANY.fullName}</Text>
        </View>

        {/* Contact Methods */}
        <InfoCard icon="call" title={t('support.contactUs')}>
          <ContactButton
            icon="mail"
            label={t('support.email')}
            sublabel={COMPANY.contact.email}
            onPress={handleEmail}
            color={COLORS.primary}
          />
          <ContactButton
            icon="logo-whatsapp"
            label={t('support.whatsapp')}
            sublabel={isEnglish ? 'Chat with us' : 'Discutez avec nous'}
            onPress={handleWhatsApp}
            color="#25D366"
          />
          <ContactButton
            icon="globe"
            label={isEnglish ? 'Website' : 'Site web'}
            sublabel="maintenancemc.com"
            onPress={handleWebsite}
            color={COLORS.secondary}
          />
        </InfoCard>

        {/* Address */}
        <InfoCard icon="location" title={t('support.address')}>
          <View style={styles.addressContainer}>
            <Text style={styles.addressLine}>{COMPANY.address.street}</Text>
            <Text style={styles.addressLine}>{COMPANY.address.quarter}</Text>
            <Text style={styles.addressLine}>
              {COMPANY.address.city}, {COMPANY.address.province}
            </Text>
            <Text style={styles.addressLine}>{COMPANY.address.country}</Text>
          </View>
        </InfoCard>

        {/* Business Hours */}
        <InfoCard icon="time" title={t('support.hours')}>
          <View style={styles.hoursContainer}>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>{isEnglish ? 'Mon - Fri' : 'Lun - Ven'}</Text>
              <Text style={styles.hoursTime}>{COMPANY.hours.weekdays}</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>{isEnglish ? 'Saturday' : 'Samedi'}</Text>
              <Text style={styles.hoursTime}>{COMPANY.hours.saturday}</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>{isEnglish ? 'Sunday' : 'Dimanche'}</Text>
              <Text style={[styles.hoursTime, { color: COLORS.error }]}>
                {COMPANY.hours.sunday}
              </Text>
            </View>
          </View>
        </InfoCard>

        {/* Legal Info */}
        <InfoCard icon="document-text" title={t('support.legalInfo')}>
          <View style={styles.legalContainer}>
            <Text style={styles.legalText}>{COMPANY.legal.type}</Text>
            <Text style={styles.legalRccm}>RCCM: {COMPANY.legal.rccm}</Text>
          </View>
        </InfoCard>

        {/* Help Links */}
        <InfoCard icon="help-circle" title={isEnglish ? 'Help' : 'Aide'}>
          <TouchableOpacity 
            style={styles.helpLink}
            onPress={() => navigation.navigate('FAQ')}
          >
            <Ionicons name="help-buoy" size={20} color={COLORS.textSecondary} />
            <Text style={styles.helpLinkText}>{t('support.faq')}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.helpLink}
            onPress={() => navigation.navigate('ReportProblem')}
          >
            <Ionicons name="bug" size={20} color={COLORS.textSecondary} />
            <Text style={styles.helpLinkText}>{t('support.reportProblem')}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.helpLink}
            onPress={() => navigation.navigate('Feedback')}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.textSecondary} />
            <Text style={styles.helpLinkText}>{t('support.feedback')}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        </InfoCard>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Niumba</Text>
          <Text style={styles.appVersion}>
            {t('support.version')} {COMPANY.app.version}
          </Text>
          <Text style={styles.copyright}>{t('about.copyright')}</Text>
        </View>
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
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SIZES.screenPadding,
    paddingBottom: 40,
  },
  companyHeader: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 2,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  companyFullName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    paddingBottom: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SIZES.base,
  },
  cardContent: {},
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  contactSublabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addressContainer: {
    paddingVertical: SIZES.base,
  },
  addressLine: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  hoursContainer: {
    paddingVertical: SIZES.base,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.base,
  },
  hoursDay: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  hoursTime: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  legalContainer: {
    paddingVertical: SIZES.base,
  },
  legalText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  legalRccm: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  helpLinkText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginLeft: SIZES.padding,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: SIZES.padding * 2,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  appVersion: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  copyright: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SIZES.padding,
  },
});

export default SupportScreen;

