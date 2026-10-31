import React from 'react';
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Star,
  Download,
  Copy,
  Share2,
  ExternalLink,
  Droplet,
  Shield,
  Briefcase,
} from 'lucide-react';
import { Contact } from '../types';
import {
  getWhatsAppUrl,
  getTelUrl,
  getMailtoUrl,
  downloadVCard,
  shareContact,
} from '../utils/phoneUtils';

interface ContactCardProps {
  contact: Contact;
  onSelect: (contact: Contact) => void;
  onToggleFavorite: (id: string) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onSelect,
  onToggleFavorite,
  onShowToast,
}) => {
  const whatsAppUrl = getWhatsAppUrl(contact.phone, contact.name);
  const telUrl = getTelUrl(contact.phone);
  const mailtoUrl = getMailtoUrl(contact.email, contact.name);

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contact.phone);
    onShowToast(`Phone ${contact.phone} copied!`, 'success');
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contact.email);
    onShowToast(`Email ${contact.email} copied!`, 'success');
  };

  const handleDownloadVCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadVCard(contact);
    onShowToast(`Downloaded vCard for ${contact.name}`, 'info');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await shareContact(contact);
    if (success) {
      onShowToast(`Contact details shared or copied!`, 'success');
    }
  };

  // Get initials
  const initials = contact.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div
      onClick={() => onSelect(contact)}
      className="group relative bg-[#12141c] hover:bg-[#161924] rounded-2xl border border-neutral-800/90 hover:border-red-600/50 p-4 transition-all duration-200 shadow-lg shadow-black/40 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Card Info Bar */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar with Blood Group Indicator */}
            <div className="relative shrink-0">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  contact.avatarColor || 'from-red-600 to-rose-950'
                } flex items-center justify-center text-white font-bold text-base shadow-md border border-red-500/30`}
              >
                {initials}
              </div>
              <div
                className="absolute -bottom-1 -right-1 bg-red-600 text-white font-mono font-bold text-[10px] px-1.5 py-0.2 rounded-md border border-neutral-900 shadow"
                title={`Blood Group: ${contact.bloodGroup}`}
              >
                {contact.bloodGroup}
              </div>
            </div>

            {/* Name & Role */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-slate-100 group-hover:text-red-400 transition-colors truncate">
                  {contact.name}
                </h3>
              </div>
              {contact.role && (
                <p className="text-xs text-neutral-400 font-medium truncate mt-0.5">
                  {contact.role}
                </p>
              )}
              {contact.address && (
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
                  <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                  <span className="truncate">{contact.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Favorite Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(contact.id);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800/60 transition-colors"
            title={contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            <Star
              className={`w-4 h-4 ${
                contact.isFavorite ? 'text-amber-400 fill-amber-400' : ''
              }`}
            />
          </button>
        </div>

        {/* Contact Data Details (Phone & Email with Quick-Copy) */}
        <div className="space-y-1.5 my-3 text-xs bg-[#0b0d12]/90 p-2.5 rounded-xl border border-neutral-900">
          {/* Phone row */}
          <div className="flex items-center justify-between text-neutral-300">
            <div className="flex items-center gap-2 font-mono truncate">
              <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="font-semibold text-slate-200">{contact.phone}</span>
            </div>
            <button
              onClick={handleCopyPhone}
              className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
              title="Copy phone number"
              aria-label="Copy phone number"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>

          {/* Email row */}
          <div className="flex items-center justify-between text-neutral-400">
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 text-red-500/80 shrink-0" />
              <span className="truncate text-neutral-300">{contact.email}</span>
            </div>
            <button
              onClick={handleCopyEmail}
              className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
              title="Copy email"
              aria-label="Copy email"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Skills Tags (Clean subtle chips adhering to zero-pill guidelines) */}
        <div className="mt-2.5 mb-4">
          <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono uppercase mb-1.5">
            <Briefcase className="w-3 h-3 text-red-500" />
            <span>Skills & Expertise</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {contact.skills.map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#191d28] border border-neutral-800 text-slate-300 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Action Buttons (Direct Call & Direct WhatsApp) */}
      <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-2 gap-2">
        {/* Direct Call Button */}
        <a
          href={telUrl}
          onClick={(e) => {
            e.stopPropagation();
            onShowToast(`Calling ${contact.name}...`, 'info');
          }}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-xs transition-all shadow-md shadow-red-950/50 hover:shadow-red-600/30"
          title={`Call ${contact.name}`}
        >
          <Phone className="w-4 h-4 fill-current" />
          <span>Call Now</span>
        </a>

        {/* Direct WhatsApp Button */}
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            onShowToast(`Opening WhatsApp with ${contact.name}...`, 'info');
          }}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-950/40 hover:shadow-emerald-600/30 border border-emerald-600/40"
          title={`Chat with ${contact.name} on WhatsApp`}
        >
          <MessageSquare className="w-4 h-4 fill-current" />
          <span>WhatsApp</span>
        </a>
      </div>

      {/* Auxiliary Actions Strip */}
      <div className="flex items-center justify-between mt-2 pt-1.5 text-[11px] text-neutral-400">
        <a
          href={mailtoUrl}
          onClick={(e) => e.stopPropagation()}
          className="hover:text-red-400 flex items-center gap-1 transition-colors"
          title="Send email"
        >
          <Mail className="w-3 h-3" />
          <span>Email</span>
        </a>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadVCard}
            className="hover:text-red-400 flex items-center gap-1 transition-colors"
            title="Download vCard to save into Android Contacts"
          >
            <Download className="w-3 h-3" />
            <span>Save .vcf</span>
          </button>
          <button
            onClick={handleShare}
            className="hover:text-red-400 flex items-center gap-1 transition-colors"
            title="Share Contact"
          >
            <Share2 className="w-3 h-3" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
