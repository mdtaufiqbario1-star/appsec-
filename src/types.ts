export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  bloodGroup: string; // e.g. "O+ ve", "B+ ve", "A+"
  normalizedBloodGroup: BloodGroup | string;
  email: string;
  skills: string[];
  address?: string;
  role?: string;
  isFavorite?: boolean;
  avatarColor?: string;
  notes?: string;
  createdAt: number;
}

export type ViewTab = 'all' | 'emergency' | 'favorites' | 'skills';

export interface QuickFilter {
  bloodGroup?: string;
  skillTag?: string;
  searchQuery: string;
}
