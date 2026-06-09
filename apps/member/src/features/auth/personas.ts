import type { LucideIcon } from 'lucide-react';
import { Cake, Heart, Sparkles, UserPlus, Users } from 'lucide-react';

export interface MemberPersona {
  id: string;
  email: string;
  displayName: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent: 'brand' | 'earth' | 'rose' | 'slate';
}

export const MEMBER_PERSONAS: MemberPersona[] = [
  {
    id: 'adult-active',
    email: 'demo@tamansafari.id',
    displayName: 'Demo Member',
    tagline: 'Adult · Active',
    description: 'Standard adult pass holder with unlimited visits',
    icon: Sparkles,
    accent: 'brand',
  },
  {
    id: 'family',
    email: 'family@tamansafari.id',
    displayName: 'Keluarga Hartono',
    tagline: 'Family · 4 pax',
    description: 'Whole family on a shared pass, picks the weekend slots',
    icon: Users,
    accent: 'earth',
  },
  {
    id: 'senior',
    email: 'senior@tamansafari.id',
    displayName: 'Pak Sutomo',
    tagline: 'Senior · Active',
    description: 'Senior pass holder, frequent visitor at off-peak hours',
    icon: Heart,
    accent: 'rose',
  },
  {
    id: 'expiring',
    email: 'lapsing@tamansafari.id',
    displayName: 'Bu Sari',
    tagline: 'Adult · Renewal due',
    description: 'Renewal banner is the first thing she should see',
    icon: Cake,
    accent: 'earth',
  },
  {
    id: 'new',
    email: 'newbie@tamansafari.id',
    displayName: 'Reza (new)',
    tagline: 'Pending · just enroled',
    description: 'Fresh sign-up — empty pass card, sees onboarding nudges',
    icon: UserPlus,
    accent: 'slate',
  },
];
