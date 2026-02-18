// Niumba - FAQ Screen
import React, { useState } from 'react';
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

interface FAQScreenProps {
  navigation: any;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQScreen: React.FC<FAQScreenProps> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const faqs: FAQItem[] = [
    {
      category: isEnglish ? 'General' : 'Général',
      question: isEnglish ? 'What is Niumba?' : 'Qu\'est-ce que Niumba ?',
      answer: isEnglish
        ? 'Niumba is a real estate platform that helps you find, buy, rent, and sell properties in the Katanga region of the Democratic Republic of Congo.'
        : 'Niumba est une plateforme immobilière qui vous aide à trouver, acheter, louer et vendre des propriétés dans la région du Katanga en République Démocratique du Congo.',
    },
    {
      category: isEnglish ? 'General' : 'Général',
      question: isEnglish ? 'How do I create an account?' : 'Comment créer un compte ?',
      answer: isEnglish
        ? 'Click on "Register" on the login screen, fill in your information (name, email, phone), and verify your email address.'
        : 'Cliquez sur "S\'inscrire" sur l\'écran de connexion, remplissez vos informations (nom, email, téléphone) et vérifiez votre adresse email.',
    },
    {
      category: isEnglish ? 'Properties' : 'Propriétés',
      question: isEnglish ? 'How do I search for properties?' : 'Comment rechercher des propriétés ?',
      answer: isEnglish
        ? 'Use the search bar at the top of the home screen. You can filter by type, price range, location, and other criteria.'
        : 'Utilisez la barre de recherche en haut de l\'écran d\'accueil. Vous pouvez filtrer par type, fourchette de prix, localisation et autres critères.',
    },
    {
      category: isEnglish ? 'Properties' : 'Propriétés',
      question: isEnglish ? 'How do I contact a property owner?' : 'Comment contacter un propriétaire ?',
      answer: isEnglish
        ? 'Click on a property to see details, then click "Contact Owner" or "Schedule Visit" to send a message or book an appointment.'
        : 'Cliquez sur une propriété pour voir les détails, puis cliquez sur "Contacter le propriétaire" ou "Planifier une visite" pour envoyer un message ou réserver un rendez-vous.',
    },
    {
      category: isEnglish ? 'Properties' : 'Propriétés',
      question: isEnglish ? 'How do I list my property?' : 'Comment publier ma propriété ?',
      answer: isEnglish
        ? 'Go to your profile, click "Add Property", fill in all the details, add photos, and submit. Your property will be reviewed before being published.'
        : 'Allez dans votre profil, cliquez sur "Ajouter une propriété", remplissez tous les détails, ajoutez des photos et soumettez. Votre propriété sera examinée avant d\'être publiée.',
    },
    {
      category: isEnglish ? 'Appointments' : 'Rendez-vous',
      question: isEnglish ? 'How do I schedule a property visit?' : 'Comment planifier une visite ?',
      answer: isEnglish
        ? 'On the property details page, click "Schedule Visit", choose a date and time, and confirm. The owner will be notified and can confirm or suggest another time.'
        : 'Sur la page des détails de la propriété, cliquez sur "Planifier une visite", choisissez une date et une heure, et confirmez. Le propriétaire sera notifié et pourra confirmer ou suggérer un autre horaire.',
    },
    {
      category: isEnglish ? 'Payments' : 'Paiements',
      question: isEnglish ? 'How do I pay for a property?' : 'Comment payer une propriété ?',
      answer: isEnglish
        ? 'Niumba does not process payments directly. All transactions are handled between the buyer and seller. We recommend using secure payment methods and legal documentation.'
        : 'Niumba ne traite pas les paiements directement. Toutes les transactions sont gérées entre l\'acheteur et le vendeur. Nous recommandons d\'utiliser des méthodes de paiement sécurisées et une documentation légale.',
    },
    {
      category: isEnglish ? 'Account' : 'Compte',
      question: isEnglish ? 'How do I update my profile?' : 'Comment mettre à jour mon profil ?',
      answer: isEnglish
        ? 'Go to your profile, click "Edit Profile", update your information, and save. You can change your name, phone, email, and profile photo.'
        : 'Allez dans votre profil, cliquez sur "Modifier le profil", mettez à jour vos informations et enregistrez. Vous pouvez changer votre nom, téléphone, email et photo de profil.',
    },
  ];

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEnglish ? 'Frequently Asked Questions' : 'Questions fréquemment posées'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {faqs
              .filter(faq => faq.category === category)
              .map((faq, index) => {
                const globalIndex = faqs.indexOf(faq);
                const isExpanded = expandedItems.has(globalIndex);
                
                return (
                  <View key={globalIndex} style={styles.faqItem}>
                    <TouchableOpacity
                      style={styles.faqQuestion}
                      onPress={() => toggleItem(globalIndex)}
                    >
                      <Text style={styles.faqQuestionText}>{faq.question}</Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                    {isExpanded && (
                      <View style={styles.faqAnswer}>
                        <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
          </View>
        ))}

        {/* Contact Support */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>
            {isEnglish ? 'Still need help?' : 'Besoin d\'aide supplémentaire ?'}
          </Text>
          <Text style={styles.contactText}>
            {isEnglish
              ? 'Contact our support team for personalized assistance.'
              : 'Contactez notre équipe de support pour une assistance personnalisée.'}
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => navigation.navigate('Support')}
          >
            <Ionicons name="mail" size={20} color={COLORS.white} />
            <Text style={styles.contactButtonText}>
              {isEnglish ? 'Contact Support' : 'Contacter le support'}
            </Text>
          </TouchableOpacity>
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
  categorySection: {
    marginBottom: SIZES.padding * 2,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.padding,
  },
  faqItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.padding,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: SIZES.base,
  },
  faqAnswer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  faqAnswerText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: SIZES.base,
  },
  contactSection: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.padding * 2,
    alignItems: 'center',
    marginTop: SIZES.padding,
    ...SHADOWS.small,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default FAQScreen;

