import React from 'react';
import { Search, X, Droplet, UserPlus, ShieldAlert, Sparkles, SlidersHorizontal } from 'lucide-react';
import { ViewTab } from '../types';

interface AndroidHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBloodGroup: string;
  onSelectBloodGroup: (bg: string) => void;
  bloodGroupCounts: Record<string, number>;
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenAddModal: () => void;
  totalContacts: number;
  filteredCount: number;
}

const BLOOD_GROUPS = ['ALL', 'O+', 'B+', 'A+', 'AB+'];

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedBloodGroup,
  onSelectBloodGroup,
  bloodGroupCounts,
  activeTab,
  onTabChange,
  onOpenAddModal,
  totalContacts,
  filteredCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0d0f14]/95 backdrop-blur-md border-b border-red-950/40 shadow-xl">
      {/* Top Branding Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-950 flex items-center justify-center shadow-lg shadow-red-900/30 border border-red-500/40">
            <span className="font-display font-black text-white text-lg tracking-wider">R</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-bold text-base tracking-tight text-white leading-none">
                RedPage
              </h1>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-red-400 bg-red-950/60 border border-red-800/60 px-1.5 py-0.5 rounded">
                Black Edition
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium">
              Android Yellow Pages Directory
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTabChange(activeTab === 'emergency' ? 'all' : 'emergency')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              activeTab === 'emergency'
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/40 ring-2 ring-red-400/50'
                : 'bg-red-950/40 text-red-400 border-red-900/60 hover:bg-red-900/50 hover:text-white'
            }`}
            title="Emergency Blood Finder"
          >
            <Droplet className="w-3.5 h-3.5 fill-current" />
            <span className="hidden xs:inline">Blood Desk</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700/80 hover:border-red-600/60 transition-all shadow-sm"
            title="Add New Contact"
          >
            <UserPlus className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Android Search Box */}
      <div className="px-4 pb-2.5">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-neutral-400 pointer-events-none">
            <Search className="w-4 h-4 text-red-500/80" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, phone, blood group, email, skill..."
            className="w-full bg-[#141720] text-slate-100 placeholder:text-neutral-500 text-sm pl-10 pr-9 py-2.5 rounded-xl border border-neutral-800 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/50 outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Blood Group Quick Filters (Segmented Control Buttons) */}
      <div className="px-4 pb-2.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 text-xs">
        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 shrink-0 mr-1 flex items-center gap-1">
          <Droplet className="w-3 h-3 text-red-500" /> Blood:
        </span>
        {BLOOD_GROUPS.map((bg) => {
          const isSelected = selectedBloodGroup === bg;
          const count = bg === 'ALL' ? totalContacts : bloodGroupCounts[bg] || 0;
          return (
            <button
              key={bg}
              onClick={() => onSelectBloodGroup(bg)}
              className={`px-2.5 py-1 rounded-lg font-mono font-medium tracking-tight whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/40'
                  : 'bg-[#141720] text-neutral-400 border-neutral-800/80 hover:text-slate-200 hover:border-neutral-700'
              }`}
            >
              <span>{bg}</span>
              {count > 0 && (
                <span
                  className={`ml-1 text-[10px] px-1 rounded ${
                    isSelected ? 'bg-red-800 text-white' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
