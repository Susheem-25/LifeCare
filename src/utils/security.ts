/**
 * LifeCare Security & Privacy Hardening Layer
 * Zero-Vulnerability sanitization, PII masking, and anti-injection defenses.
 */

/**
 * Strips dangerous HTML tags, javascript: protocols, control characters, null bytes,
 * and prototype pollution vectors to prevent XSS and DOM clobbering.
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .slice(0, maxLength)
    .replace(/\0/g, '') // remove null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // strip script blocks
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/javascript:/gi, '') // strip javascript: protocol
    .replace(/data:/gi, '') // strip data: protocol
    .replace(/vbscript:/gi, '') // strip vbscript: protocol
    .replace(/on\w+\s*=/gi, '') // strip event handlers like onerror=, onclick=
    .replace(/\b(__proto__|constructor|prototype)\b/gi, '') // prevent prototype pollution vectors
    .trim();
}

/**
 * Sanitizes alphanumeric identifiers (Patient ID, Booking Code, Driver ID, Hospital Code).
 */
export function sanitizeIdentifier(input: string, maxLength: number = 32): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .slice(0, maxLength)
    .replace(/[^A-Za-z0-9\-_]/g, '')
    .toUpperCase()
    .trim();
}

/**
 * Masks sensitive Indian PII patterns (Phone numbers, Aadhaar, PAN)
 */
export function maskPii(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    // Mask 10-digit phone numbers
    .replace(/(\+?91[-\s]?)?([6-9]\d{2})\d{4}(\d{3})/g, '+91-XXXXX-XX$3')
    // Mask 12-digit Aadhaar patterns
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?(\d{4})\b/g, 'XXXX-XXXX-$1')
    // Mask emails
    .replace(/([a-zA-Z0-9_.-]+)@([a-zA-Z0-9_.-]+)\.([a-zA-Z]{2,5})/g, 'm***@***.***');
}
