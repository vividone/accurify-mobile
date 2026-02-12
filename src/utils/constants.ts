// Tax thresholds in Naira
export const TAX_THRESHOLDS = {
  VAT: 25_000_000,
  CIT: 50_000_000,
  VAT_RATE: 0.075, // 7.5%
} as const;

// SECURITY: API configuration with production safety (FE-016)
// In production, VITE_API_BASE_URL must be set to HTTPS endpoint
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // In production, require the environment variable to be set
  if (import.meta.env.PROD && !envUrl) {
    console.error('[SECURITY] VITE_API_BASE_URL is not set in production!');
    // Return empty string to cause obvious failures rather than silent HTTP fallback
    return '';
  }

  // In development, allow localhost fallback
  if (!envUrl) {
    console.warn('[DEV] Using localhost API fallback. Set VITE_API_BASE_URL for production.');
    return 'http://localhost:8080';
  }

  // SECURITY: Warn if production URL is not HTTPS
  if (import.meta.env.PROD && envUrl && !envUrl.startsWith('https://')) {
    console.error('[SECURITY] Production API URL should use HTTPS:', envUrl);
  }

  return envUrl;
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// External service keys
export const EXTERNAL_SERVICES = {
  MONO_PUBLIC_KEY: import.meta.env.VITE_MONO_PUBLIC_KEY || '',
  PAYSTACK_PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH: 'accura-auth',
  BUSINESS: 'accura-business',
  THEME: 'accura-theme',
} as const;

// Nigerian Banks list (sorted alphabetically)
export const NIGERIAN_BANKS = [
  'Access Bank',
  'Citibank Nigeria',
  'Ecobank Nigeria',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'First City Monument Bank (FCMB)',
  'Globus Bank',
  'Guaranty Trust Bank (GTBank)',
  'Heritage Bank',
  'Jaiz Bank',
  'Keystone Bank',
  'Kuda Bank',
  'Lotus Bank',
  'Moniepoint MFB',
  'Opay',
  'Palmpay',
  'Parallex Bank',
  'Polaris Bank',
  'Providus Bank',
  'Stanbic IBTC Bank',
  'Standard Chartered Bank',
  'Sterling Bank',
  'SunTrust Bank',
  'Titan Trust Bank',
  'Union Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Unity Bank',
  'VFD Microfinance Bank',
  'Wema Bank',
  'Zenith Bank',
] as const;

// Company/Brand information (from environment)
export const COMPANY_INFO = {
  NAME: import.meta.env.VITE_COMPANY_NAME || 'Fortbridge Technologies Ltd',
  URL: import.meta.env.VITE_COMPANY_URL || 'https://fortbridge.co',
  PRODUCT_URL: import.meta.env.VITE_PRODUCT_URL || 'https://accura.com.ng',
  SUPPORT_EMAIL: import.meta.env.VITE_SUPPORT_EMAIL || 'support@accura.com.ng',
  MARKETING_URL: import.meta.env.VITE_MARKETING_URL || 'http://localhost:3000',
} as const;
