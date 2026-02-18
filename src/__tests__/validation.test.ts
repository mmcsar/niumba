// Niumba - Validation Tests
import {
  validate,
  validateForm,
  validateAndSanitizeEmail,
  validateAndSanitizePhone,
  validatePrice,
  validateAppointmentDate,
  ValidationRules,
} from '../utils/validation';

describe('Validation Utils', () => {
  describe('Email Validation', () => {
    it('should validate correct email', () => {
      const result = validate('test@example.com', [ValidationRules.email]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email', () => {
      const result = validate('invalid-email', [ValidationRules.email]);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject empty email', () => {
      const result = validate('', [ValidationRules.email]);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    it('should validate correct phone numbers', () => {
      const validPhones = ['+33612345678', '0612345678', '06 12 34 56 78'];
      validPhones.forEach((phone) => {
        const result = validate(phone, [ValidationRules.phone]);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = ['123', 'abc', '12345'];
      invalidPhones.forEach((phone) => {
        const result = validate(phone, [ValidationRules.phone]);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Required Validation', () => {
    it('should validate non-empty string', () => {
      const result = validate('test', [ValidationRules.required]);
      expect(result.isValid).toBe(true);
    });

    it('should reject empty string', () => {
      const result = validate('', [ValidationRules.required]);
      expect(result.isValid).toBe(false);
    });

    it('should reject null', () => {
      const result = validate(null, [ValidationRules.required]);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Min/Max Length', () => {
    it('should validate string with min length', () => {
      const result = validate('hello', [ValidationRules.minLength(5)]);
      expect(result.isValid).toBe(true);
    });

    it('should reject string below min length', () => {
      const result = validate('hi', [ValidationRules.minLength(5)]);
      expect(result.isValid).toBe(false);
    });

    it('should validate string within max length', () => {
      const result = validate('hello', [ValidationRules.maxLength(10)]);
      expect(result.isValid).toBe(true);
    });

    it('should reject string above max length', () => {
      const result = validate('this is too long', [ValidationRules.maxLength(10)]);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Price Validation', () => {
    it('should validate price within range', () => {
      const result = validatePrice(100000, 0, 1000000);
      expect(result.isValid).toBe(true);
    });

    it('should reject price below minimum', () => {
      const result = validatePrice(100, 1000, 1000000);
      expect(result.isValid).toBe(false);
    });

    it('should reject price above maximum', () => {
      const result = validatePrice(2000000, 0, 1000000);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Date Validation', () => {
    it('should validate future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const result = validateAppointmentDate(futureDate);
      expect(result.isValid).toBe(true);
    });

    it('should reject past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const result = validateAppointmentDate(pastDate);
      expect(result.isValid).toBe(false);
    });

    it('should reject null date', () => {
      const result = validateAppointmentDate(null);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should validate complete form', () => {
      const data = {
        email: 'test@example.com',
        phone: '0612345678',
        name: 'John Doe',
      };

      const schema = {
        email: [ValidationRules.required, ValidationRules.email],
        phone: [ValidationRules.required, ValidationRules.phone],
        name: [ValidationRules.required, ValidationRules.minLength(3)],
      };

      const result = validateForm(data, schema);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return errors for invalid form', () => {
      const data = {
        email: 'invalid-email',
        phone: '123',
        name: '',
      };

      const schema = {
        email: [ValidationRules.required, ValidationRules.email],
        phone: [ValidationRules.required, ValidationRules.phone],
        name: [ValidationRules.required],
      };

      const result = validateForm(data, schema);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });

  describe('Email Sanitization', () => {
    it('should sanitize and validate email', () => {
      const result = validateAndSanitizeEmail('  TEST@EXAMPLE.COM  ');
      expect(result.isValid).toBe(true);
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('Phone Sanitization', () => {
    it('should sanitize phone number', () => {
      const result = validateAndSanitizePhone('06 12 34 56 78');
      expect(result.isValid).toBe(true);
      expect(result.phone).toBe('0612345678');
    });
  });
});


