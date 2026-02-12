/**
 * SECURITY: XSS Sanitization utilities (FE-008)
 * Uses DOMPurify to prevent stored and reflected XSS attacks.
 */
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Use this for any user-generated content that will be rendered as HTML.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize text input - strips all HTML tags.
 * Use this for plain text fields that should never contain HTML.
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Strip all tags
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize URL to prevent javascript: and data: protocol XSS.
 * Returns null if the URL is potentially malicious.
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;

  // Trim and lowercase for checking
  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
  ];

  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      console.warn(`[SECURITY] Blocked dangerous URL protocol: ${protocol}`);
      return null;
    }
  }

  // Allow relative URLs and safe protocols
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  const hasProtocol = safeProtocols.some(p => trimmed.startsWith(p));
  const isRelative = trimmed.startsWith('/') || !trimmed.includes(':');

  if (hasProtocol || isRelative) {
    return url;
  }

  // Unknown protocol - block it
  console.warn(`[SECURITY] Blocked unknown URL protocol in: ${url}`);
  return null;
}

/**
 * Validate and sanitize redirect URL to prevent open redirect attacks (FE-009).
 * Only allows redirects to same-origin or whitelisted domains.
 */
export function sanitizeRedirectUrl(
  url: string,
  allowedDomains: string[] = []
): string {
  // Default to dashboard if no URL provided
  if (!url) return '/dashboard';

  // Sanitize first
  const sanitized = sanitizeUrl(url);
  if (!sanitized) return '/dashboard';

  // Allow relative URLs (same-origin)
  if (sanitized.startsWith('/')) {
    return sanitized;
  }

  try {
    const urlObj = new URL(sanitized);
    const currentHost = window.location.hostname;

    // Allow same-origin
    if (urlObj.hostname === currentHost) {
      return sanitized;
    }

    // Check against allowed domains
    for (const domain of allowedDomains) {
      if (urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)) {
        return sanitized;
      }
    }

    // External redirect not allowed
    console.warn(`[SECURITY] Blocked open redirect to: ${urlObj.hostname}`);
    return '/dashboard';
  } catch {
    // Invalid URL format - return safe default
    return '/dashboard';
  }
}
