// Niumba - Validation Utilities
// Système de validation robuste pour tous les formulaires

export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
  messageEn?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  errorsEn?: string[];
}

// ============================================
// VALIDATION RULES
// ============================================

export const ValidationRules = {
  // Email
  email: {
    test: (value: string) => {
      if (!value) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value.trim());
    },
    message: 'Email invalide',
    messageEn: 'Invalid email',
  },

  // Téléphone (format international ou local)
  phone: {
    test: (value: string) => {
      if (!value) return false;
      // Accepte: +33 6 12 34 56 78, 0612345678, 06 12 34 56 78, etc.
      const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
      return phoneRegex.test(value.replace(/\s/g, ''));
    },
    message: 'Numéro de téléphone invalide',
    messageEn: 'Invalid phone number',
  },

  // Requis
  required: {
    test: (value: any) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message: 'Ce champ est requis',
    messageEn: 'This field is required',
  },

  // Longueur minimale
  minLength: (min: number) => ({
    test: (value: string) => value && value.trim().length >= min,
    message: `Minimum ${min} caractères`,
    messageEn: `Minimum ${min} characters`,
  }),

  // Longueur maximale
  maxLength: (max: number) => ({
    test: (value: string) => !value || value.trim().length <= max,
    message: `Maximum ${max} caractères`,
    messageEn: `Maximum ${max} characters`,
  }),

  // Nombre (entier)
  integer: {
    test: (value: string | number) => {
      if (value === null || value === undefined || value === '') return false;
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return Number.isInteger(num);
    },
    message: 'Doit être un nombre entier',
    messageEn: 'Must be a whole number',
  },

  // Nombre (décimal)
  number: {
    test: (value: string | number) => {
      if (value === null || value === undefined || value === '') return false;
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return !isNaN(num) && isFinite(num);
    },
    message: 'Doit être un nombre',
    messageEn: 'Must be a number',
  },

  // Prix minimum
  minPrice: (min: number) => ({
    test: (value: string | number) => {
      if (!value) return false;
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return !isNaN(num) && num >= min;
    },
    message: `Le prix minimum est ${min.toLocaleString()} €`,
    messageEn: `Minimum price is ${min.toLocaleString()} €`,
  }),

  // Prix maximum
  maxPrice: (max: number) => ({
    test: (value: string | number) => {
      if (!value) return false;
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return !isNaN(num) && num <= max;
    },
    message: `Le prix maximum est ${max.toLocaleString()} €`,
    messageEn: `Maximum price is ${max.toLocaleString()} €`,
  }),

  // Date future
  futureDate: {
    test: (value: Date | string) => {
      if (!value) return false;
      const date = value instanceof Date ? value : new Date(value);
      return date > new Date();
    },
    message: 'La date doit être dans le futur',
    messageEn: 'Date must be in the future',
  },

  // URL
  url: {
    test: (value: string) => {
      if (!value) return false;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: 'URL invalide',
    messageEn: 'Invalid URL',
  },

  // Mot de passe fort (min 8 caractères, majuscule, minuscule, chiffre)
  strongPassword: {
    test: (value: string) => {
      if (!value) return false;
      const hasMinLength = value.length >= 8;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
    },
    message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
    messageEn: 'Password must contain at least 8 characters, one uppercase, one lowercase and one number',
  },
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Valide une valeur avec une ou plusieurs règles
 */
export const validate = (
  value: any,
  rules: ValidationRule[],
  language: 'fr' | 'en' = 'fr'
): ValidationResult => {
  const errors: string[] = [];
  const errorsEn: string[] = [];

  for (const rule of rules) {
    if (!rule.test(value)) {
      errors.push(rule.message);
      if (rule.messageEn) {
        errorsEn.push(rule.messageEn);
      } else {
        errorsEn.push(rule.message);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors: language === 'fr' ? errors : errorsEn,
    errorsEn,
  };
};

/**
 * Valide un objet avec plusieurs champs
 */
export const validateForm = <T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, ValidationRule[]>,
  language: 'fr' | 'en' = 'fr'
): { isValid: boolean; errors: Partial<Record<keyof T, string[]>> } => {
  const errors: Partial<Record<keyof T, string[]>> = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field as keyof T];
    const result = validate(value, rules, language);

    if (!result.isValid) {
      errors[field as keyof T] = result.errors;
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * Sanitize une chaîne de caractères (enlève les caractères dangereux)
 */
export const sanitizeString = (value: string): string => {
  if (!value) return '';
  return value
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Enlève les scripts
    .replace(/[<>]/g, ''); // Enlève les balises HTML
};

/**
 * Sanitize un nombre (enlève tout sauf les chiffres et le point)
 */
export const sanitizeNumber = (value: string): string => {
  if (!value) return '';
  return value.replace(/[^\d.,]/g, '').replace(',', '.');
};

/**
 * Valide et sanitize un email
 */
export const validateAndSanitizeEmail = (email: string): { isValid: boolean; email: string } => {
  const sanitized = sanitizeString(email).toLowerCase();
  const result = validate(sanitized, [ValidationRules.email]);
  return {
    isValid: result.isValid,
    email: sanitized,
  };
};

/**
 * Valide et sanitize un téléphone
 */
export const validateAndSanitizePhone = (phone: string): { isValid: boolean; phone: string } => {
  const sanitized = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
  const result = validate(sanitized, [ValidationRules.phone]);
  return {
    isValid: result.isValid,
    phone: sanitized,
  };
};

/**
 * Valide un prix (entre min et max)
 */
export const validatePrice = (
  price: string | number,
  min: number = 0,
  max: number = 100000000
): ValidationResult => {
  const rules: ValidationRule[] = [
    ValidationRules.required,
    ValidationRules.number,
    ValidationRules.minPrice(min),
    ValidationRules.maxPrice(max),
  ];
  return validate(price, rules);
};

/**
 * Valide une date de rendez-vous
 */
export const validateAppointmentDate = (date: Date | string | null): ValidationResult => {
  if (!date) {
    return {
      isValid: false,
      errors: ['La date est requise'],
      errorsEn: ['Date is required'],
    };
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  const rules: ValidationRule[] = [ValidationRules.futureDate];

  return validate(dateObj, rules);
};

export default {
  validate,
  validateForm,
  validateAndSanitizeEmail,
  validateAndSanitizePhone,
  validatePrice,
  validateAppointmentDate,
  sanitizeString,
  sanitizeNumber,
  ValidationRules,
};


