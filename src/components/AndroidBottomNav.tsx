import React from 'react';
import { Users, Droplet, Star, UserPlus, PhoneCall } from 'lucide-react';
import { ViewTab } from '../types';

interface AndroidBottomNavProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenAddModal: () => void;
  favoritesCount: number;
  totalContacts: number;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  favoritesCount,
  totalContacts,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e14]/95 backdrop-blur-md border-t border-red-950/40 pb-safe shadow-2xl">
      <div className="max-w-md md:max-w-xl mx-auto grid grid-cols-4 items-center h-16 px-2">
        {/* Tab 1: All Contacts */}
        <button
          onClick={() => onTabChange('all')}
          className={`flex flex-col items-center justify-center h-full transition-colors relative min-h-[44px] ${
            activeTab === 'all' ? 'text-red-500' : 'text-neutral-400 hover:text-neutral-300'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 text-[9px] font-mono px-1 rounded-full bg-neutral-800 text-neutral-300 font-bold border border-neutral-700">
              {totalContacts}
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Directory</span>
          {activeTab === 'all' && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 absolute bottom-1" />
          )}
        </button>

        {/* Tab 2: Emergency Blood Finder */}
        <button
          onClick={() => onTabChange('emergency')}
          className={`flex flex-col items-center justify-center h-full transition-colors relative min-h-[44px] ${
            activeTab === 'emergency' ? 'text-red-500' : 'text-neutral-400 hover:text-neutral-300'
          }`}
        >
          <div className="relative">
            <Droplet className={`w-5 h-5 ${activeTab === 'emergency' ? 'fill-red-500' : ''}`} />
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-red-600 animate-ping" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Blood Desk</span>
          {activeTab === 'emergency' && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 absolute bottom-1" />
          )}
        </button>

        {/* Tab 3: Favorites */}
        <button
          onClick={() => onTabChange('favorites')}
          className={`flex flex-col items-center justify-center h-full transition-colors relative min-h-[44px] ${
            activeTab === 'favorites' ? 'text-amber-400' : 'text-neutral-400 hover:text-neutral-300'
          }`}
        >
          <div className="relative">
            <Star
              className={`w-5 h-5 ${
                activeTab === 'favorites' ? 'fill-amber-400 text-amber-400' : ''
              }`}
            />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] font-mono px-1 rounded-full bg-amber-950/80 text-amber-400 font-bold border border-amber-800/80">
                {favoritesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Favorites</span>
          {activeTab === 'favorites' && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute bottom-1" />
          )}
        </button>

        {/* Tab 4: Add Contact */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center h-full text-neutral-400 hover:text-red-400 transition-colors min-h-[44px]"
        >
          <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <UserPlus className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">New Entry</span>
        </button>
      </div>
    </nav>
  );
};
