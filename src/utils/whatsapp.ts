import type { Invoice } from '@/types';
import { formatCurrency } from './currency';
import { formatDate } from './date';

/**
 * Clean a phone number for use with WhatsApp wa.me links.
 * Removes spaces, dashes, parentheses. Ensures country code prefix.
 * Defaults to Nigeria (+234) if no country code is present.
 */
function cleanPhoneNumber(phone: string): string {
  // Strip everything except digits and leading +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If starts with +, just remove the + (wa.me uses digits only)
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  // If starts with 0 (local Nigerian number), replace with 234
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.slice(1);
  }

  // If it doesn't start with a country code (less than 12 digits for Nigerian numbers),
  // assume Nigerian and prepend 234
  if (cleaned.length <= 10) {
    cleaned = '234' + cleaned;
  }

  return cleaned;
}

/**
 * Build a WhatsApp message for sharing an invoice.
 */
function buildInvoiceMessage(invoice: Invoice, businessName: string): string {
  const lines = [
    `Hi ${invoice.client.name},`,
    '',
    `Please find the details of your invoice from *${businessName}*:`,
    '',
    `*Invoice:* ${invoice.invoiceNumber}`,
    `*Amount:* ${formatCurrency(invoice.total)}`,
    `*Date:* ${formatDate(invoice.invoiceDate)}`,
    `*Due:* ${formatDate(invoice.dueDate)}`,
  ];

  if (invoice.paymentLink && invoice.paymentLinkEnabled) {
    lines.push('', `*Pay online:* ${invoice.paymentLink}`);
  }

  lines.push('', 'Thank you for your business!');

  return lines.join('\n');
}

/**
 * Build a WhatsApp message for sharing a receipt (paid invoice).
 */
function buildReceiptMessage(invoice: Invoice, businessName: string): string {
  const lines = [
    `Hi ${invoice.client.name},`,
    '',
    `This is to confirm that your payment has been received. Here are the details:`,
    '',
    `*Invoice:* ${invoice.invoiceNumber}`,
    `*Amount Paid:* ${formatCurrency(invoice.total)}`,
    `*Date Paid:* ${invoice.paidAt ? formatDate(invoice.paidAt) : formatDate(invoice.invoiceDate)}`,
  ];

  lines.push('', `Thank you for your payment!`, `— *${businessName}*`);

  return lines.join('\n');
}

/**
 * Generate a wa.me share URL for an invoice.
 * If the client has a phone number, it pre-fills the recipient.
 * Otherwise, it opens WhatsApp with just the message (user picks contact).
 */
export function getWhatsAppInvoiceLink(invoice: Invoice, businessName: string): string {
  const message = buildInvoiceMessage(invoice, businessName);
  const encoded = encodeURIComponent(message);

  if (invoice.client.phone) {
    const phone = cleanPhoneNumber(invoice.client.phone);
    return `https://wa.me/${phone}?text=${encoded}`;
  }

  return `https://wa.me/?text=${encoded}`;
}

/**
 * Generate a wa.me share URL for a receipt (paid invoice).
 */
export function getWhatsAppReceiptLink(invoice: Invoice, businessName: string): string {
  const message = buildReceiptMessage(invoice, businessName);
  const encoded = encodeURIComponent(message);

  if (invoice.client.phone) {
    const phone = cleanPhoneNumber(invoice.client.phone);
    return `https://wa.me/${phone}?text=${encoded}`;
  }

  return `https://wa.me/?text=${encoded}`;
}
