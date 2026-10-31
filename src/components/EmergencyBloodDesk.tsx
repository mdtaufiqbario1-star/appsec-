import React, { useState } from 'react';
import {
  Droplet,
  Phone,
  MessageSquare,
  AlertTriangle,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Contact } from '../types';
import {
  isCompatibleDonor,
  getTelUrl,
  getEmergencyBloodWhatsAppUrl,
  COMPATIBLE_DONORS,
  normalizeBloodGroup,
} from '../utils/phoneUtils';

interface EmergencyBloodDeskProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const BLOOD_TYPES = ['O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-', 'AB-'];

export const EmergencyBloodDesk: React.FC<EmergencyBloodDeskProps> = ({
  contacts,
  onSelectContact,
  onShowToast,
}) => {
  const [recipientGroup, setRecipientGroup] = useState<string>('O+');

  // Filter contacts whose blood is compatible with the selected recipient
  const compatibleDonors = contacts.filter((c) =>
    isCompatibleDonor(c.bloodGroup, recipientGroup)
  );

  return (
    <div className="space-y-4 animate-in fade-in pb-16">
      {/* Emergency Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/80 via-neutral-900 to-[#0e1017] border border-red-800/80 p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-700/50 animate-pulse">
              <Droplet className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-white">
                  Emergency Blood Desk
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white animate-pulse">
                  LIVE DONORS
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">
                Immediate donor triage with 1-tap call & WhatsApp emergency alert
              </p>
            </div>
          </div>
        </div>

        {/* Recipient Blood Group Selector */}
        <div className="mt-4 pt-3 border-t border-red-900/60">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-red-300 mb-2">
            <span className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Patient Needs Blood Group:
            </span>
            <span className="text-neutral-400">Select Type</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {BLOOD_TYPES.map((type) => {
              const isSelected = recipientGroup === type;
              return (
                <button
                  key={type}
                  onClick={() => setRecipientGroup(type)}
                  className={`py-2 px-1 rounded-xl font-mono font-bold text-xs transition-all border ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-700/50 scale-105'
                      : 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:border-red-800 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>

          {/* Compatibility Note */}
          <div className="mt-3 text-[11px] text-neutral-400 bg-neutral-950/70 p-2.5 rounded-xl border border-neutral-800/80 flex items-center justify-between">
            <div>
              Compatible donor groups for <span className="font-bold text-red-400">{recipientGroup}</span>:
              <span className="font-mono text-slate-200 ml-1.5 font-bold">
                {(COMPATIBLE_DONORS[recipientGroup] || [recipientGroup]).join(', ')}
              </span>
            </div>
            <div className="text-red-400 font-bold font-mono">
              {compatibleDonors.length} Donors Found
            </div>
          </div>
        </div>
      </div>

      {/* List of Compatible Donors */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase text-neutral-400 px-1">
          <span>Verified Compatible Contacts ({compatibleDonors.length})</span>
          <span className="text-[10px] text-red-400">Direct Emergency Access</span>
        </div>

        {compatibleDonors.length === 0 ? (
          <div className="p-8 text-center bg-[#10131b] rounded-2xl border border-neutral-800">
            <Droplet className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">
              No matching donors found for {recipientGroup}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Try selecting another blood group or add a new contact with this blood group.
            </p>
          </div>
        ) : (
          compatibleDonors.map((donor) => {
            const telUrl = getTelUrl(donor.phone);
            const waUrl = getEmergencyBloodWhatsAppUrl(donor, recipientGroup);

            return (
              <div
                key={donor.id}
                onClick={() => onSelectContact(donor)}
                className="bg-[#12141c] hover:bg-[#161a24] rounded-2xl border border-red-950/80 hover:border-red-600/60 p-4 transition-all shadow-lg cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-950 flex items-center justify-center text-white font-bold text-lg shadow-md border border-red-500/30">
                      {donor.name
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0].toUpperCase())
                        .join('')}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-red-600 text-white font-mono font-bold text-[10px] px-1.5 rounded border border-neutral-900">
                      {donor.bloodGroup}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-base text-slate-100 truncate">
                      {donor.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mt-0.5">
                      <span>{donor.phone}</span>
                      {donor.address && <span>· {donor.address}</span>}
                    </div>
                    <div className="text-[11px] text-red-400/90 font-medium truncate mt-0.5">
                      Donor Group: <span className="font-bold text-white">{donor.bloodGroup}</span> (Compatible)
                    </div>
                  </div>
                </div>

                {/* Instant Emergency Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                  <a
                    href={telUrl}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowToast(`Calling donor ${donor.name}...`, 'info');
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-xs transition-all shadow-md shadow-red-950/60"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                    <span>Emergency Call</span>
                  </a>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowToast(`Alerting ${donor.name} on WhatsApp...`, 'info');
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-950/50"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp Alert</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
