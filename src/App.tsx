/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Droplet,
  Star,
  Search,
  RotateCcw,
  Plus,
  Share2,
  FileDown,
  ShieldCheck,
  CheckCircle,
  Smartphone,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { Contact, ViewTab } from './types';
import { INITIAL_CONTACTS, STORAGE_KEY } from './data/defaultContacts';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidHeader } from './components/AndroidHeader';
import { ContactCard } from './components/ContactCard';
import { ContactDetailModal } from './components/ContactDetailModal';
import { AddEditContactModal } from './components/AddEditContactModal';
import { EmergencyBloodDesk } from './components/EmergencyBloodDesk';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Toast, ToastMessage } from './components/Toast';
import { normalizeBloodGroup } from './utils/phoneUtils';

export default function App() {
  // Contacts state with LocalStorage persistence
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback on parse error
    }
    return INITIAL_CONTACTS;
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('ALL');
  const [activeTab, setActiveTab] = useState<ViewTab>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  const [activeSkillFilter, setActiveSkillFilter] = useState<string>('ALL');

  // Register service worker for offline Android PWA
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Ignored in dev sandbox
      });
    }
  }, []);

  // Save contacts to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch {
      // Storage unavailable or full
    }
  }, [contacts]);

  // Toast notification helper
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3000);
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = !c.isFavorite;
          showToast(
            updated ? `Added ${c.name} to Favorites` : `Removed ${c.name} from Favorites`,
            'info'
          );
          return { ...c, isFavorite: updated };
        }
        return c;
      })
    );
  };

  // Add or edit contact
  const handleSaveContact = (
    contactData: Omit<Contact, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === existingId
            ? { ...c, ...contactData, normalizedBloodGroup: normalizeBloodGroup(contactData.bloodGroup) }
            : c
        )
      );
      showToast(`Updated ${contactData.name}`, 'success');
    } else {
      const newContact: Contact = {
        ...contactData,
        id: `contact-${Date.now()}`,
        normalizedBloodGroup: normalizeBloodGroup(contactData.bloodGroup),
        createdAt: Date.now(),
        avatarColor: 'from-red-600 to-rose-950',
      };
      setContacts((prev) => [newContact, ...prev]);
      showToast(`Added ${contactData.name} to directory`, 'success');
    }
  };

  // Delete contact
  const handleDeleteContact = (id: string) => {
    const target = contacts.find((c) => c.id === id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    showToast(`Deleted ${target?.name || 'Contact'}`, 'info');
  };

  // Reset to default original 5 contacts
  const handleResetToDefault = () => {
    if (window.confirm('Reset directory back to original 5 verified contacts?')) {
      setContacts(INITIAL_CONTACTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONTACTS));
      showToast('Reset directory to original 5 contacts', 'info');
    }
  };

  // Export all contacts as backup JSON
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(contacts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'redpage_contacts_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported contacts backup JSON', 'info');
  };

  // Count blood groups
  const bloodGroupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    contacts.forEach((c) => {
      const norm = normalizeBloodGroup(c.bloodGroup);
      counts[norm] = (counts[norm] || 0) + 1;
    });
    return counts;
  }, [contacts]);

  // Unique skills for filtering
  const allSkillsList = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => {
      c.skills.forEach((s) => set.add(s));
    });
    return Array.from(set);
  }, [contacts]);

  // Filtered contacts based on search query, blood group filter, tab and skill filter
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Tab filter
      if (activeTab === 'favorites' && !c.isFavorite) return false;

      // Blood group filter
      if (selectedBloodGroup !== 'ALL') {
        const norm = normalizeBloodGroup(c.bloodGroup);
        if (norm !== selectedBloodGroup) return false;
      }

      // Skill filter
      if (activeSkillFilter !== 'ALL') {
        const hasSkill = c.skills.some((s) =>
          s.toLowerCase().includes(activeSkillFilter.toLowerCase())
        );
        if (!hasSkill) return false;
      }

      // Search Query filter (matches Name, Contact/Phone, Blood Group, Email, Skills, and Address)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchPhone = c.phone.toLowerCase().includes(q) || c.phone.replace(/\D/g, '').includes(q);
        const matchBlood = c.bloodGroup.toLowerCase().includes(q);
        const matchEmail = c.email.toLowerCase().includes(q);
        const matchAddress = c.address ? c.address.toLowerCase().includes(q) : false;
        const matchSkills = c.skills.some((s) => s.toLowerCase().includes(q));
        const matchRole = c.role ? c.role.toLowerCase().includes(q) : false;

        return (
          matchName ||
          matchPhone ||
          matchBlood ||
          matchEmail ||
          matchAddress ||
          matchSkills ||
          matchRole
        );
      }

      return true;
    });
  }, [contacts, activeTab, selectedBloodGroup, activeSkillFilter, searchQuery]);

  const favoritesCount = useMemo(() => contacts.filter((c) => c.isFavorite).length, [contacts]);

  // Wrapper for Android Frame mode vs Responsive full screen
  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Main Container - can be styled as Android Device or Wide Canvas */}
      <div
        className={`w-full mx-auto transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-md my-4 rounded-3xl shadow-2xl border-4 border-neutral-800 bg-[#090a0f] overflow-hidden min-h-[844px] flex flex-col'
            : 'max-w-6xl flex-1 flex flex-col'
        }`}
      >
        {/* Android Native Status Bar */}
        <AndroidStatusBar
          isFrameMode={isPhoneFrame}
          onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
        />

        {/* PWA Install Notification Bar */}
        <PWAInstallBanner />

        {/* Android Top Header & Search Component */}
        <AndroidHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedBloodGroup={selectedBloodGroup}
          onSelectBloodGroup={setSelectedBloodGroup}
          bloodGroupCounts={bloodGroupCounts}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenAddModal={() => {
            setContactToEdit(null);
            setIsAddModalOpen(true);
          }}
          totalContacts={contacts.length}
          filteredCount={filteredContacts.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-4 space-y-4">
          {/* Active Filters / Breadcrumb / Emergency Mode Banner */}
          {activeTab === 'emergency' ? (
            <EmergencyBloodDesk
              contacts={contacts}
              onSelectContact={setSelectedContact}
              onShowToast={showToast}
            />
          ) : (
            <>
              {/* Directory Toolbar Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                {/* Result count & active view indicator */}
                <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
                  <span>
                    Showing <strong className="text-white font-bold">{filteredContacts.length}</strong> of{' '}
                    <strong className="text-white font-bold">{contacts.length}</strong> records
                  </span>
                  {activeTab === 'favorites' && (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      · <Star className="w-3 h-3 fill-amber-400" /> Favorites
                    </span>
                  )}
                  {selectedBloodGroup !== 'ALL' && (
                    <span className="text-red-400 font-semibold">
                      · Blood {selectedBloodGroup}
                    </span>
                  )}
                </div>

                {/* Quick actions: Reset / Backup */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportBackup}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors text-[11px]"
                    title="Export JSON backup"
                  >
                    <FileDown className="w-3 h-3 text-red-400" />
                    <span>Backup</span>
                  </button>
                  <button
                    onClick={handleResetToDefault}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400 transition-colors text-[11px]"
                    title="Reset to 5 original contacts"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </div>
              </div>

              {/* Skills Quick Filter Scroll Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400 shrink-0 mr-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-red-500" /> Skill Filter:
                </span>
                <button
                  onClick={() => setActiveSkillFilter('ALL')}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all border ${
                    activeSkillFilter === 'ALL'
                      ? 'bg-red-950/70 border-red-700/80 text-white font-semibold'
                      : 'bg-[#12141c] border-neutral-800/80 text-neutral-400 hover:text-slate-200'
                  }`}
                >
                  All Skills
                </button>
                {allSkillsList.map((skill) => {
                  const isSelected = activeSkillFilter === skill;
                  return (
                    <button
                      key={skill}
                      onClick={() => setActiveSkillFilter(isSelected ? 'ALL' : skill)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap transition-all border ${
                        isSelected
                          ? 'bg-red-950/70 border-red-700/80 text-white font-semibold'
                          : 'bg-[#12141c] border-neutral-800/80 text-neutral-400 hover:text-slate-200'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* Contacts Grid */}
              {filteredContacts.length === 0 ? (
                <div className="py-16 text-center bg-[#10121a] rounded-2xl border border-neutral-800/80 p-6">
                  <Search className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                  <h3 className="font-display font-bold text-base text-slate-200">
                    No matching contacts found
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Try clearing your search query or changing the blood group filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedBloodGroup('ALL');
                      setActiveSkillFilter('ALL');
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pb-20">
                  {filteredContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onSelect={setSelectedContact}
                      onToggleFavorite={handleToggleFavorite}
                      onShowToast={showToast}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Android Material Fixed Bottom Navigation Bar */}
        <AndroidBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenAddModal={() => {
            setContactToEdit(null);
            setIsAddModalOpen(true);
          }}
          favoritesCount={favoritesCount}
          totalContacts={contacts.length}
        />
      </div>

      {/* Contact Profile Bottom-Sheet / Modal */}
      <ContactDetailModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onToggleFavorite={handleToggleFavorite}
        onEdit={(contact) => {
          setSelectedContact(null);
          setContactToEdit(contact);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeleteContact}
        onShowToast={showToast}
      />

      {/* Add / Edit Contact Modal */}
      <AddEditContactModal
        isOpen={isAddModalOpen}
        contactToEdit={contactToEdit}
        onClose={() => {
          setIsAddModalOpen(false);
          setContactToEdit(null);
        }}
        onSave={handleSaveContact}
      />
    </div>
  );
}
