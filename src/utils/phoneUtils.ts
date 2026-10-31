import { Contact } from '../types';

/**
 * Normalizes a raw phone number into WhatsApp international format.
 * Particularly handles Bangladesh numbers (+880, 01XXXXXXXXX) and international formats.
 */
export function getWhatsAppNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  // Strip all non-numeric characters except leading '+'
  let digits = rawPhone.replace(/\D/g, '');

  // If number starts with 880, it already has country code
  if (digits.startsWith('880')) {
    return digits;
  }

  // If starts with 0 (e.g. 01737295978), replace leading 0 with Bangladesh country code 880
  if (digits.startsWith('0')) {
    return '880' + digits.slice(1);
  }

  // If it's a 10 digit number starting with 1 (e.g. 1737295978), prefix with 880
  if (digits.length === 10 && digits.startsWith('1')) {
    return '880' + digits;
  }

  return digits;
}

/**
 * Builds a direct WhatsApp click-to-chat URL with an optional personalized message
 */
export function getWhatsAppUrl(rawPhone: string, contactName?: string, customMessage?: string): string {
  const number = getWhatsAppNumber(rawPhone);
  if (!number) return '#';
  
  const greeting = customMessage 
    ? customMessage 
    : `Hello ${contactName || 'there'}, I found your contact on the RedPage Directory.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(greeting)}`;
}

/**
 * Builds a direct Emergency Blood Request WhatsApp link
 */
export function getEmergencyBloodWhatsAppUrl(contact: Contact, neededGroup?: string): string {
  const number = getWhatsAppNumber(contact.phone);
  const msg = `URGENT BLOOD REQUEST: Hello ${contact.name}, we urgently need ${neededGroup || contact.bloodGroup} blood donation. Please let us know if you or someone you know is available. Thank you!`;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

/**
 * Formats tel: link for instant calling
 */
export function getTelUrl(rawPhone: string): string {
  if (!rawPhone) return '#';
  const clean = rawPhone.replace(/[\s()-]/g, '');
  return `tel:${clean}`;
}

/**
 * Formats mailto: link
 */
export function getMailtoUrl(email: string, name?: string): string {
  if (!email) return '#';
  const subject = encodeURIComponent(`Inquiry from RedPage Directory - ${name || ''}`);
  return `mailto:${email}?subject=${subject}`;
}

/**
 * Normalizes blood group string like "O+ ve", "O+ve", "B+ ve", "A+" into standard "O+", "B+", etc.
 */
export function normalizeBloodGroup(bg: string): string {
  if (!bg) return 'Unknown';
  const cleaned = bg.toUpperCase().replace(/\s+/g, '').replace('VE', '').replace('POS', '+').replace('NEG', '-');
  if (cleaned.includes('AB+')) return 'AB+';
  if (cleaned.includes('AB-')) return 'AB-';
  if (cleaned.includes('A+')) return 'A+';
  if (cleaned.includes('A-')) return 'A-';
  if (cleaned.includes('B+')) return 'B+';
  if (cleaned.includes('B-')) return 'B-';
  if (cleaned.includes('O+')) return 'O+';
  if (cleaned.includes('O-')) return 'O-';
  return bg.trim();
}

/**
 * Blood donation compatibility matrix:
 * Given a required recipient group, returns array of compatible donor groups.
 */
export const COMPATIBLE_DONORS: Record<string, string[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'], // Universal donor
};

/**
 * Checks if a donor blood group is compatible for a recipient blood group
 */
export function isCompatibleDonor(donorGroup: string, recipientGroup: string): boolean {
  const normDonor = normalizeBloodGroup(donorGroup);
  const normRecipient = normalizeBloodGroup(recipientGroup);
  const valid = COMPATIBLE_DONORS[normRecipient];
  if (!valid) return normDonor === normRecipient;
  return valid.includes(normDonor);
}

/**
 * Generates and downloads a vCard (.vcf) file for Android phonebook import
 */
export function downloadVCard(contact: Contact): void {
  const vCardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.name}`,
    `N:${contact.name};;;;`,
    `TEL;TYPE=CELL,VOICE:${contact.phone}`,
    contact.email ? `EMAIL;TYPE=INTERNET,HOME:${contact.email}` : '',
    contact.address ? `ADR;TYPE=HOME:;;${contact.address};;;;` : '',
    `NOTE:Blood Group: ${contact.bloodGroup}\\nSkills: ${contact.skills.join(', ')}`,
    contact.role ? `TITLE:${contact.role}` : '',
    'ORG:RedPage Directory',
    'END:VCARD',
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([vCardLines], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${contact.name.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Uses Android Web Share API if supported, or falls back to copy text
 */
export async function shareContact(contact: Contact): Promise<boolean> {
  const shareText = `Name: ${contact.name}\nContact: ${contact.phone}\nBlood Group: ${contact.bloodGroup}\nEmail: ${contact.email}\nSkills: ${contact.skills.join(', ')}${contact.address ? `\nAddress: ${contact.address}` : ''}`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${contact.name} - RedPage Contact`,
        text: shareText,
      });
      return true;
    } catch {
      // User dismissed or failed
      return false;
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(shareText);
    return true;
  } catch {
    return false;
  }
}
