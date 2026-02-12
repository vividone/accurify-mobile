/**
 * SECURITY: Centralized validation schemas (FE-010)
 * These schemas should match backend validation constraints.
 * Using Zod for type-safe validation.
 */
import { z } from 'zod';

// Common validation patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[0-9]{10,15}$/,
  // Nigerian phone format
  NG_PHONE: /^(\+234|0)[789][01]\d{8}$/,
  // Tax Identification Number (TIN)
  // Individual TIN: 10 digits (e.g., 1234567891)
  // Business TIN: 12 digits with optional hyphen (e.g., 123456789123 or 12345678-9123)
  TIN: /^(\d{10}|\d{12}|\d{8}-\d{4})$/,
  // CAC Registration Number
  CAC: /^RC\d{5,8}$/i,
  // Bank account number (10 digits for Nigerian banks)
  BANK_ACCOUNT: /^\d{10}$/,
  // Password: min 8 chars, uppercase, lowercase, number
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
};

// Common string constraints
export const CONSTRAINTS = {
  NAME_MIN: 1,
  NAME_MAX: 100,
  EMAIL_MAX: 255,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  DESCRIPTION_MAX: 500,
  NOTES_MAX: 1000,
  ADDRESS_MAX: 500,
  PHONE_MAX: 20,
  AMOUNT_MIN: 0,
  AMOUNT_MAX: 999999999999, // 12 digits max
};

// ==================== Common Field Schemas ====================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .max(CONSTRAINTS.EMAIL_MAX, `Email must be less than ${CONSTRAINTS.EMAIL_MAX} characters`)
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(CONSTRAINTS.PASSWORD_MIN, `Password must be at least ${CONSTRAINTS.PASSWORD_MIN} characters`)
  .max(CONSTRAINTS.PASSWORD_MAX, `Password must be less than ${CONSTRAINTS.PASSWORD_MAX} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(CONSTRAINTS.NAME_MIN, 'Name is required')
  .max(CONSTRAINTS.NAME_MAX, `Name must be less than ${CONSTRAINTS.NAME_MAX} characters`);

export const phoneSchema = z
  .string()
  .max(CONSTRAINTS.PHONE_MAX, `Phone must be less than ${CONSTRAINTS.PHONE_MAX} characters`)
  .regex(PATTERNS.PHONE, 'Please enter a valid phone number')
  .optional()
  .or(z.literal(''));

export const amountSchema = z
  .number()
  .min(CONSTRAINTS.AMOUNT_MIN, 'Amount must be positive')
  .max(CONSTRAINTS.AMOUNT_MAX, 'Amount exceeds maximum allowed');

// ==================== Auth Schemas ====================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    accountType: z.enum(['BUSINESS', 'ACCOUNTANT']),
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ==================== Business Schemas ====================

export const businessSchema = z.object({
  name: nameSchema,
  businessType: z.enum(['SERVICE', 'GOODS', 'MIXED']),
  industry: z.string().optional(),
  rcNumber: z
    .string()
    .regex(PATTERNS.CAC, 'Invalid CAC registration number')
    .optional()
    .or(z.literal('')),
  tin: z
    .string()
    .regex(PATTERNS.TIN, 'TIN must be 10 digits (individual) or 12 digits (business)')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(CONSTRAINTS.ADDRESS_MAX, `Address must be less than ${CONSTRAINTS.ADDRESS_MAX} characters`)
    .optional(),
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal('')),
});

// ==================== Client Schemas ====================

export const clientSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema,
  address: z
    .string()
    .max(CONSTRAINTS.ADDRESS_MAX, `Address must be less than ${CONSTRAINTS.ADDRESS_MAX} characters`)
    .optional(),
  tin: z
    .string()
    .regex(PATTERNS.TIN, 'TIN must be 10 digits (individual) or 12 digits (business)')
    .optional()
    .or(z.literal('')),
});

// ==================== Invoice Schemas ====================

export const invoiceLineItemSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(CONSTRAINTS.DESCRIPTION_MAX, `Description must be less than ${CONSTRAINTS.DESCRIPTION_MAX} characters`),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: amountSchema,
});

export const invoiceSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z
    .string()
    .max(CONSTRAINTS.NOTES_MAX, `Notes must be less than ${CONSTRAINTS.NOTES_MAX} characters`)
    .optional(),
  items: z.array(invoiceLineItemSchema).min(1, 'At least one line item is required'),
  applyVat: z.boolean().optional(),
  vatRate: z.number().min(0).max(1).optional(),
  whtApplicable: z.boolean().optional(),
  whtRate: z.number().min(0).max(1).optional(),
});

// ==================== Transaction Schemas ====================

export const transactionSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(CONSTRAINTS.DESCRIPTION_MAX),
  amount: amountSchema,
  type: z.enum(['INFLOW', 'OUTFLOW']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(CONSTRAINTS.NOTES_MAX).optional(),
});

// ==================== Product Schemas ====================

export const productSchema = z.object({
  name: nameSchema,
  sku: z.string().max(50, 'SKU must be less than 50 characters').optional(),
  description: z.string().max(CONSTRAINTS.DESCRIPTION_MAX).optional(),
  category: z.string().optional(),
  unitPrice: amountSchema,
  costPrice: amountSchema.optional(),
  stockQuantity: z.number().min(0, 'Stock must be positive').optional(),
  reorderLevel: z.number().min(0).optional(),
  active: z.boolean().optional(),
});

// ==================== Type Exports ====================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type BusinessFormData = z.infer<typeof businessSchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
