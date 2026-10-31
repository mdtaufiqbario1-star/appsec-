import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Droplet, MapPin, Briefcase, FileText, Check } from 'lucide-react';
import { Contact } from '../types';
import { normalizeBloodGroup } from '../utils/phoneUtils';

interface AddEditContactModalProps {
  isOpen: boolean;
  contactToEdit: Contact | null;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'createdAt'>, existingId?: string) => void;
}

const COMMON_BLOOD_GROUPS = ['O+ ve', 'B+ ve', 'A+', 'AB+', 'O- ve', 'B- ve', 'A-', 'AB-'];

export const AddEditContactModal: React.FC<AddEditContactModalProps> = ({
  isOpen,
  contactToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+ ve');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [role, setRole] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (contactToEdit) {
      setName(contactToEdit.name);
      setPhone(contactToEdit.phone);
      setBloodGroup(contactToEdit.bloodGroup);
      setEmail(contactToEdit.email);
      setAddress(contactToEdit.address || '');
      setSkillsInput(contactToEdit.skills.join(', '));
      setRole(contactToEdit.role || '');
      setNotes(contactToEdit.notes || '');
    } else {
      setName('');
      setPhone('');
      setBloodGroup('O+ ve');
      setEmail('');
      setAddress('');
      setSkillsInput('');
      setRole('');
      setNotes('');
    }
    setError('');
  }, [contactToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter contact full name');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter phone/contact number');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSave(
      {
        name: name.trim(),
        phone: phone.trim(),
        bloodGroup: bloodGroup.trim(),
        normalizedBloodGroup: normalizeBloodGroup(bloodGroup),
        email: email.trim(),
        address: address.trim(),
        skills: skills.length > 0 ? skills : ['General Specialist'],
        role: role.trim() || skills[0] || 'Member',
        notes: notes.trim(),
        isFavorite: contactToEdit ? contactToEdit.isFavorite : false,
      },
      contactToEdit?.id
    );

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-[#0e1117] border border-neutral-800 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Android drag bar */}
        <div className="w-12 h-1.5 bg-neutral-700/80 rounded-full mx-auto my-3 sm:hidden" />

        {/* Modal Header */}
        <div className="p-4 px-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/90 text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-white">
                {contactToEdit ? 'Edit Contact' : 'Add New Contact'}
              </h2>
              <p className="text-[11px] text-neutral-400">
                RedPage Android Directory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 text-xs">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Md. Lutfur Rahman Khaled"
                className="w-full bg-[#141822] text-slate-100 placeholder:text-neutral-500 text-sm pl-9 pr-3 py-2.5 rounded-xl border border-neutral-800 focus:border-red-500 outline-none"
              />
            </div>
          </div>

          {/* Contact No */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
              Contact No (Phone / WhatsApp) *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 01737295978 or +8801970648451"
                className="w-full bg-[#141822] text-slate-100 placeholder:text-neutral-500 text-sm pl-9 pr-3 py-2.5 rounded-xl border border-neutral-800 focus:border-red-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
              Blood Group *
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Droplet className="absolute left-3 top-3 w-4 h-4 text-red-500" />
                <input
                  type="text"
                  required
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  placeholder="e.g. O+ ve, B+ ve, A+"
                  className="w-full bg-[#141822] text-slate-100 placeholder:text-neutral-500 text-sm pl-9 pr-3 py-2.5 rounded-xl border border-neutral-800 focus:border-red-500 outline-none font-mono"
                />
              </div>
            </div>
            {/* Quick Blood Group chips */}
            <div className="flex flex-wrap gap-1 mt-2">
              {COMMON_BLOOD_GROUPS.map((bg) => (
                <button
                  type="button"
                  key={bg}
                  onClick={() => setBloodGroup(bg)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    bloodGroup === bg
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. lutfur.it@gmail.com"
                className="w-full bg-[#141822] text-slate-100 placeholder:text-neutral-500 text-sm pl-9 pr-3 py-2.5 rounded-xl border border-neutral-800 focus:border-red-500 outline-none"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
              Skills (comma separated)
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. Forensic Investigator, Ethical Hacker"
                className="w-full bg-[#141822] text-slate-100 placeholder:text-neutral-500 text-sm pl-9 pr-3 py-2.5 rounded-xl border border-neutral-800 focus:border-red-500 outline-none"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
              Address / Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Savar, Dhaka or Mohammadpur"
                className="w-full bg-[#141822] text-slate-100 placeholder:text-neutral-500 text-sm pl-9 pr-3 py-2.5 rounded-xl border border-neutral-800 focus:border-red-500 outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-xs transition-colors shadow-lg shadow-red-950/60"
            >
              {contactToEdit ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
