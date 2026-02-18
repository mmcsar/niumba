// Niumba - Privacy Policy Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

interface PrivacyPolicyScreenProps {
  navigation: any;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const Paragraph: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Text style={styles.paragraph}>{children}</Text>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEnglish ? 'Privacy Policy' : 'Politique de confidentialité'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Introduction */}
        <Section title={isEnglish ? 'Introduction' : 'Introduction'}>
          <Paragraph>
            {isEnglish 
              ? 'At Niumba, we are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use our real estate application.'
              : 'Chez Niumba, nous nous engageons à protéger votre vie privée et vos données personnelles. Cette Politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez notre application immobilière.'}
          </Paragraph>
          <Paragraph>
            {isEnglish
              ? 'Last updated: January 2025'
              : 'Dernière mise à jour : Janvier 2025'}
          </Paragraph>
        </Section>

        {/* Data Collection */}
        <Section title={isEnglish ? '1. Data We Collect' : '1. Données que nous collectons'}>
          <Paragraph>
            {isEnglish
              ? 'We collect the following types of information:'
              : 'Nous collectons les types d\'informations suivants :'}
          </Paragraph>
          <View style={styles.list}>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Personal Information: Name, email address, phone number, profile photo' : 'Informations personnelles : Nom, adresse e-mail, numéro de téléphone, photo de profil'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Property Information: Details about properties you list, view, or inquire about' : 'Informations sur les propriétés : Détails sur les propriétés que vous listez, consultez ou sur lesquelles vous vous renseignez'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Usage Data: How you interact with the app, search queries, viewed properties' : 'Données d\'utilisation : Comment vous interagissez avec l\'application, requêtes de recherche, propriétés consultées'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Device Information: Device type, operating system, unique identifiers' : 'Informations sur l\'appareil : Type d\'appareil, système d\'exploitation, identifiants uniques'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Location Data: City, province, and approximate location (with your consent)' : 'Données de localisation : Ville, province et localisation approximative (avec votre consentement)'}
            </Text>
          </View>
        </Section>

        {/* How We Use Data */}
        <Section title={isEnglish ? '2. How We Use Your Data' : '2. Comment nous utilisons vos données'}>
          <Paragraph>
            {isEnglish
              ? 'We use your data to:'
              : 'Nous utilisons vos données pour :'}
          </Paragraph>
          <View style={styles.list}>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Provide and improve our services' : 'Fournir et améliorer nos services'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Process property listings and inquiries' : 'Traiter les annonces immobilières et les demandes de renseignements'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Send you notifications about properties and messages' : 'Vous envoyer des notifications sur les propriétés et les messages'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Personalize your experience and show relevant properties' : 'Personnaliser votre expérience et afficher des propriétés pertinentes'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Analyze app usage to improve functionality' : 'Analyser l\'utilisation de l\'application pour améliorer les fonctionnalités'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Ensure security and prevent fraud' : 'Assurer la sécurité et prévenir la fraude'}
            </Text>
          </View>
        </Section>

        {/* Data Storage */}
        <Section title={isEnglish ? '3. Data Storage and Security' : '3. Stockage et sécurité des données'}>
          <Paragraph>
            {isEnglish
              ? 'Your data is stored securely on Supabase servers with industry-standard encryption. We implement:'
              : 'Vos données sont stockées en toute sécurité sur les serveurs Supabase avec un chiffrement de niveau industrie. Nous mettons en œuvre :'}
          </Paragraph>
          <View style={styles.list}>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Row-Level Security (RLS) policies to restrict data access' : 'Des politiques de sécurité au niveau des lignes (RLS) pour restreindre l\'accès aux données'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Encrypted data transmission (HTTPS/TLS)' : 'Transmission de données chiffrée (HTTPS/TLS)'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Regular security audits and updates' : 'Audits et mises à jour de sécurité réguliers'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Access controls based on user roles' : 'Contrôles d\'accès basés sur les rôles utilisateurs'}
            </Text>
          </View>
        </Section>

        {/* Data Sharing */}
        <Section title={isEnglish ? '4. Data Sharing' : '4. Partage des données'}>
          <Paragraph>
            {isEnglish
              ? 'We do not sell your personal data. We may share your information only in the following cases:'
              : 'Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :'}
          </Paragraph>
          <View style={styles.list}>
            <Text style={styles.listItem}>
              • {isEnglish ? 'With property owners/agents when you inquire about a property' : 'Avec les propriétaires/agents lorsque vous vous renseignez sur une propriété'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'With service providers (Supabase) who help us operate the app' : 'Avec les fournisseurs de services (Supabase) qui nous aident à exploiter l\'application'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'If required by law or to protect our rights' : 'Si requis par la loi ou pour protéger nos droits'}
            </Text>
          </View>
        </Section>

        {/* Your Rights */}
        <Section title={isEnglish ? '5. Your Rights' : '5. Vos droits'}>
          <Paragraph>
            {isEnglish
              ? 'You have the right to:'
              : 'Vous avez le droit de :'}
          </Paragraph>
          <View style={styles.list}>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Access your personal data' : 'Accéder à vos données personnelles'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Correct inaccurate information' : 'Corriger les informations inexactes'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Request deletion of your data' : 'Demander la suppression de vos données'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Opt-out of marketing communications' : 'Vous désinscrire des communications marketing'}
            </Text>
            <Text style={styles.listItem}>
              • {isEnglish ? 'Export your data' : 'Exporter vos données'}
            </Text>
          </View>
        </Section>

        {/* Cookies and Tracking */}
        <Section title={isEnglish ? '6. Cookies and Tracking' : '6. Cookies et suivi'}>
          <Paragraph>
            {isEnglish
              ? 'We use local storage and caching to improve app performance. We do not use third-party tracking cookies. Analytics data is anonymized and aggregated.'
              : 'Nous utilisons le stockage local et la mise en cache pour améliorer les performances de l\'application. Nous n\'utilisons pas de cookies de suivi tiers. Les données analytiques sont anonymisées et agrégées.'}
          </Paragraph>
        </Section>

        {/* Children's Privacy */}
        <Section title={isEnglish ? '7. Children\'s Privacy' : '7. Confidentialité des enfants'}>
          <Paragraph>
            {isEnglish
              ? 'Our app is not intended for users under 18 years of age. We do not knowingly collect personal information from children.'
              : 'Notre application n\'est pas destinée aux utilisateurs de moins de 18 ans. Nous ne collectons pas sciemment d\'informations personnelles auprès d\'enfants.'}
          </Paragraph>
        </Section>

        {/* Changes to Policy */}
        <Section title={isEnglish ? '8. Changes to This Policy' : '8. Modifications de cette politique'}>
          <Paragraph>
            {isEnglish
              ? 'We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy in the app and updating the "Last updated" date.'
              : 'Nous pouvons mettre à jour cette Politique de confidentialité de temps à autre. Nous vous informerons des modifications importantes en publiant la nouvelle politique dans l\'application et en mettant à jour la date de "Dernière mise à jour".'}
          </Paragraph>
        </Section>

        {/* Contact */}
        <Section title={isEnglish ? '9. Contact Us' : '9. Nous contacter'}>
          <Paragraph>
            {isEnglish
              ? 'If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:'
              : 'Si vous avez des questions sur cette Politique de confidentialité ou souhaitez exercer vos droits, veuillez nous contacter :'}
          </Paragraph>
          <View style={styles.contactBox}>
            <Text style={styles.contactText}>
              <Text style={styles.contactLabel}>{isEnglish ? 'Email: ' : 'E-mail : '}</Text>
              mmc@maintenancemc.com
            </Text>
            <Text style={styles.contactText}>
              <Text style={styles.contactLabel}>{isEnglish ? 'Address: ' : 'Adresse : '}</Text>
              {isEnglish 
                ? 'Lubumbashi, Haut-Katanga, DRC'
                : 'Lubumbashi, Haut-Katanga, RDC'}
            </Text>
          </View>
        </Section>

        <View style={{ height: 40 }} />
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
    ...SHADOWS.small,
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
  section: {
    marginBottom: SIZES.padding * 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.padding,
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.small,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textSecondary,
    marginBottom: SIZES.padding,
  },
  list: {
    marginTop: SIZES.base,
  },
  listItem: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
    paddingLeft: SIZES.base,
  },
  contactBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginTop: SIZES.base,
  },
  contactText: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
  },
  contactLabel: {
    fontWeight: '600',
  },
});

export default PrivacyPolicyScreen;

