// Niumba - Mortgage Calculator Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

interface MortgageCalculatorScreenProps {
  navigation: any;
  route?: {
    params?: {
      propertyPrice?: number;
    };
  };
}

const MortgageCalculatorScreen: React.FC<MortgageCalculatorScreenProps> = ({ navigation, route }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  
  const initialPrice = route?.params?.propertyPrice || 250000;
  
  const [propertyPrice, setPropertyPrice] = useState(initialPrice.toString());
  const [downPayment, setDownPayment] = useState('20');
  const [interestRate, setInterestRate] = useState('8.5');
  const [loanTerm, setLoanTerm] = useState('20');
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  useEffect(() => {
    calculateMortgage();
  }, [propertyPrice, downPayment, interestRate, loanTerm]);

  const calculateMortgage = () => {
    const price = parseFloat(propertyPrice) || 0;
    const down = (parseFloat(downPayment) || 0) / 100;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const term = (parseFloat(loanTerm) || 1) * 12;
    
    const principal = price * (1 - down);
    
    if (rate === 0) {
      const monthly = principal / term;
      setMonthlyPayment(monthly);
      setTotalPayment(principal);
      setTotalInterest(0);
      return;
    }
    
    const monthly = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    const total = monthly * term;
    const interest = total - principal;
    
    setMonthlyPayment(isNaN(monthly) ? 0 : monthly);
    setTotalPayment(isNaN(total) ? 0 : total);
    setTotalInterest(isNaN(interest) ? 0 : interest);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const InputField: React.FC<{
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    suffix?: string;
    prefix?: string;
  }> = ({ label, value, onChangeText, suffix, prefix }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {prefix && <Text style={styles.inputPrefix}>{prefix}</Text>}
        <TextInput
          style={[styles.input, prefix && styles.inputWithPrefix, suffix && styles.inputWithSuffix]}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholderTextColor={COLORS.textLight}
        />
        {suffix && <Text style={styles.inputSuffix}>{suffix}</Text>}
      </View>
    </View>
  );

  const loanAmount = (parseFloat(propertyPrice) || 0) * (1 - (parseFloat(downPayment) || 0) / 100);
  const downPaymentAmount = (parseFloat(propertyPrice) || 0) * ((parseFloat(downPayment) || 0) / 100);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEnglish ? 'Mortgage Calculator' : 'Calculateur de Crédit'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Result Card */}
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>
            {isEnglish ? 'Monthly Payment' : 'Mensualité'}
          </Text>
          <Text style={styles.resultValue}>{formatCurrency(monthlyPayment)}</Text>
          <Text style={styles.resultSubtext}>
            {isEnglish ? 'per month' : 'par mois'}
          </Text>
          
          {/* Progress Bar */}
          <View style={styles.breakdownBar}>
            <View 
              style={[
                styles.breakdownPrincipal, 
                { flex: loanAmount / (totalPayment || 1) }
              ]} 
            />
            <View 
              style={[
                styles.breakdownInterest, 
                { flex: totalInterest / (totalPayment || 1) }
              ]} 
            />
          </View>
          
          <View style={styles.breakdownLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>
                {isEnglish ? 'Principal' : 'Capital'}: {formatCurrency(loanAmount)}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.secondary }]} />
              <Text style={styles.legendText}>
                {isEnglish ? 'Interest' : 'Intérêts'}: {formatCurrency(totalInterest)}
              </Text>
            </View>
          </View>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <InputField
            label={isEnglish ? 'Property Price' : 'Prix du bien'}
            value={propertyPrice}
            onChangeText={setPropertyPrice}
            prefix="$"
          />
          
          <InputField
            label={isEnglish ? 'Down Payment' : 'Apport personnel'}
            value={downPayment}
            onChangeText={setDownPayment}
            suffix="%"
          />
          
          <View style={styles.downPaymentInfo}>
            <Text style={styles.downPaymentText}>
              = {formatCurrency(downPaymentAmount)}
            </Text>
          </View>
          
          <InputField
            label={isEnglish ? 'Interest Rate (Annual)' : 'Taux d\'intérêt (Annuel)'}
            value={interestRate}
            onChangeText={setInterestRate}
            suffix="%"
          />
          
          <InputField
            label={isEnglish ? 'Loan Term' : 'Durée du prêt'}
            value={loanTerm}
            onChangeText={setLoanTerm}
            suffix={isEnglish ? 'years' : 'ans'}
          />
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {isEnglish ? 'Loan Summary' : 'Résumé du prêt'}
          </Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {isEnglish ? 'Loan Amount' : 'Montant emprunté'}
            </Text>
            <Text style={styles.summaryValue}>{formatCurrency(loanAmount)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {isEnglish ? 'Total Interest' : 'Total des intérêts'}
            </Text>
            <Text style={[styles.summaryValue, { color: COLORS.secondary }]}>
              {formatCurrency(totalInterest)}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelBold}>
              {isEnglish ? 'Total Payment' : 'Coût total'}
            </Text>
            <Text style={styles.summaryValueBold}>{formatCurrency(totalPayment)}</Text>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={20} color={COLORS.warning} />
            <Text style={styles.tipTitle}>
              {isEnglish ? 'Tips' : 'Conseils'}
            </Text>
          </View>
          <Text style={styles.tipText}>
            {isEnglish 
              ? '• A larger down payment reduces your monthly payments and total interest.\n• Compare rates from multiple banks before choosing.\n• Consider additional costs: insurance, taxes, maintenance.'
              : '• Un apport plus élevé réduit vos mensualités et le total des intérêts.\n• Comparez les taux de plusieurs banques.\n• N\'oubliez pas les frais annexes : assurance, taxes, entretien.'}
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  resultCard: {
    margin: SIZES.screenPadding,
    padding: 24,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  resultValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.white,
    marginVertical: 8,
  },
  resultSubtext: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.7,
  },
  breakdownBar: {
    flexDirection: 'row',
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  breakdownPrincipal: {
    backgroundColor: COLORS.white,
  },
  breakdownInterest: {
    backgroundColor: COLORS.secondary,
  },
  breakdownLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
  },
  inputSection: {
    paddingHorizontal: SIZES.screenPadding,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  inputWithPrefix: {
    paddingLeft: 8,
  },
  inputWithSuffix: {
    paddingRight: 8,
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    paddingLeft: 16,
  },
  inputSuffix: {
    fontSize: 16,
    color: COLORS.textSecondary,
    paddingRight: 16,
  },
  downPaymentInfo: {
    marginTop: -8,
    marginBottom: 16,
    paddingLeft: 4,
  },
  downPaymentText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  summaryCard: {
    margin: SIZES.screenPadding,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    ...SHADOWS.card,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryLabelBold: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryValueBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 8,
  },
  tipsCard: {
    marginHorizontal: SIZES.screenPadding,
    padding: 16,
    backgroundColor: COLORS.warning + '15',
    borderRadius: SIZES.radius,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default MortgageCalculatorScreen;

