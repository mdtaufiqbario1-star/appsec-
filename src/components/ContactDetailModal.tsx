import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Star,
  Download,
  Copy,
  Share2,
  Trash2,
  Edit3,
  Droplet,
  Shield,
  Briefcase,
  Check,
  Send,
  MessageCircle,
} from 'lucide-react';
import { Contact } from '../types';
import {
  getWhatsAppUrl,
  getTelUrl,
  getMailtoUrl,
  downloadVCard,
  shareContact,
  COMPATIBLE_DONORS,
  normalizeBloodGroup,
} from '../utils/phoneUtils';

interface ContactDetailModalProps {
  contact: Contact | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  onClose,
  onToggleFavorite,
  onEdit,
  onDelete,
  onShowToast,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customMsg, setCustomMsg] = useState('');

  if (!contact) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    onShowToast(`${fieldName} copied!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownload = () => {
    downloadVCard(contact);
    onShowToast(`Downloaded vCard for ${contact.name}`, 'info');
  };

  const handleShare = async () => {
    const success = await shareContact(contact);
    if (success) onShowToast(`Contact shared!`, 'success');
  };

  const normalizedBg = normalizeBloodGroup(contact.bloodGroup);

  // Quick message presets
  const presets = [
    `Hello ${contact.name}, I am reaching out to inquire about your professional services.`,
    `URGENT BLOOD INQUIRY: Hello ${contact.name}, we are checking donor availability for ${contact.bloodGroup} blood.`,
    `Hi ${contact.name}, I got your contact from the RedPage Directory. Let's connect!`,
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-[#0e1117] border border-neutral-800 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Android Grab Handle on mobile */}
        <div className="w-12 h-1.5 bg-neutral-700/80 rounded-full mx-auto my-3 sm:hidden" />

        {/* Header / Hero */}
        <div className="relative p-5 pb-4 border-b border-neutral-800/80 bg-gradient-to-b from-red-950/20 to-transparent">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                  contact.avatarColor || 'from-red-600 to-rose-950'
                } flex items-center justify-center text-white font-bold text-2xl shadow-xl border-2 border-red-500/40`}
              >
                {contact.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0].toUpperCase())
                  .join('')}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-xl text-white">
                    {contact.name}
                  </h2>
                </div>
                {contact.role && (
                  <p className="text-sm text-neutral-300 font-medium mt-0.5">
                    {contact.role}
                  </p>
                )}
                {contact.address && (
                  <p className="flex items-center gap-1 text-xs text-neutral-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{contact.address}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleFavorite(contact.id)}
                className="p-2 rounded-xl text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
                title={contact.isFavorite ? 'Unfavorite' : 'Favorite'}
              >
                <Star
                  className={`w-5 h-5 ${
                    contact.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                  }`}
                />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Close sheet"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Blood Group Highlight Card */}
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600/90 text-white flex items-center justify-center font-bold text-xs shadow">
                <Droplet className="w-4 h-4 fill-white" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-red-300">
                  Donor Blood Group
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {contact.bloodGroup}
                </div>
              </div>
            </div>
            <div className="text-right text-[11px] text-neutral-400">
              <span className="text-neutral-300 font-mono">Status:</span> Active Donor
            </div>
          </div>
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="p-4 grid grid-cols-2 gap-3">
          <a
            href={getTelUrl(contact.phone)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-sm transition-all shadow-lg shadow-red-950/60"
          >
            <Phone className="w-4 h-4 fill-current" />
            <span>Direct Call</span>
          </a>

          <a
            href={getWhatsAppUrl(contact.phone, contact.name, customMsg || undefined)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-950/50 border border-emerald-500/30"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>WhatsApp Chat</span>
          </a>
        </div>

        {/* Details & Copy Rows */}
        <div className="px-5 space-y-3">
          {/* Phone */}
          <div className="p-3 rounded-xl bg-[#141822] border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-red-400">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-neutral-400">
                  Mobile / WhatsApp
                </div>
                <div className="text-sm font-semibold font-mono text-slate-100">
                  {contact.phone}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCopy(contact.phone, 'Phone number')}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Copy phone"
              >
                {copiedField === 'Phone number' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href={`sms:${contact.phone}`}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Send SMS"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="p-3 rounded-xl bg-[#141822] border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-red-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-neutral-400">
                  Email Address
                </div>
                <div className="text-sm font-semibold text-slate-100 truncate">
                  {contact.email}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleCopy(contact.email, 'Email address')}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Copy email"
              >
                {copiedField === 'Email address' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href={getMailtoUrl(contact.email, contact.name)}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Send Email"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="p-3.5 rounded-xl bg-[#141822] border border-neutral-800">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-neutral-400 mb-2">
              <Briefcase className="w-3.5 h-3.5 text-red-500" />
              <span>Skills & Competencies</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {contact.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* WhatsApp Quick Message Templates */}
          <div className="p-3.5 rounded-xl bg-[#141822] border border-neutral-800">
            <div className="text-xs font-mono uppercase text-neutral-400 mb-2 flex items-center justify-between">
              <span>Quick WhatsApp Templates</span>
              <span className="text-[10px] text-emerald-400">Tap to compose</span>
            </div>
            <div className="space-y-1.5">
              {presets.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => setCustomMsg(msg)}
                  className={`w-full text-left text-xs p-2 rounded-lg border transition-all ${
                    customMsg === msg
                      ? 'bg-red-950/40 border-red-700/60 text-white'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  "{msg}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 pt-4 mt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-slate-200 border border-neutral-800 transition-colors"
              title="Download vCard (.vcf) for Android"
            >
              <Download className="w-3.5 h-3.5 text-red-400" />
              <span>Save Contact</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-slate-200 border border-neutral-800 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-red-400" />
              <span>Share</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(contact)}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Edit Contact"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete ${contact.name} from directory?`)) {
                  onDelete(contact.id);
                  onClose();
                }
              }}
              className="p-2 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-neutral-800 transition-colors"
              title="Delete Contact"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
