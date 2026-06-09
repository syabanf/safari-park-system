import type { LucideIcon } from 'lucide-react';
import { BarChart3, Eye, Megaphone, PawPrint, ShieldCheck, Wrench } from 'lucide-react';

export interface AdminPersona {
  id: string;
  email: string;
  displayName: string;
  role: string;
  description: string;
  icon: LucideIcon;
  accent: 'brand' | 'earth' | 'rose' | 'slate';
}

export const ADMIN_PERSONAS: AdminPersona[] = [
  {
    id: 'super-admin',
    email: 'admin@tamansafari.id',
    displayName: 'Pak Hadi',
    role: 'Super Admin',
    description: 'Full access across every module',
    icon: ShieldCheck,
    accent: 'brand',
  },
  {
    id: 'operations',
    email: 'ops@tamansafari.id',
    displayName: 'Bu Rina',
    role: 'Operations Manager',
    description: 'Gates, SLA, maintenance, shifts, audit',
    icon: Wrench,
    accent: 'brand',
  },
  {
    id: 'finance',
    email: 'finance@tamansafari.id',
    displayName: 'Bu Lina',
    role: 'Finance',
    description: 'Revenue, reconciliation, payouts, reports',
    icon: BarChart3,
    accent: 'earth',
  },
  {
    id: 'marketing',
    email: 'marketing@tamansafari.id',
    displayName: 'Pak Andra',
    role: 'Marketing',
    description: 'Campaigns, perks, member analytics',
    icon: Megaphone,
    accent: 'rose',
  },
  {
    id: 'animal-care',
    email: 'curator@tamansafari.id',
    displayName: 'Curator Made',
    role: 'Animal Care Lead',
    description: 'Animals, welfare logs, safety incidents',
    icon: PawPrint,
    accent: 'earth',
  },
  {
    id: 'viewer',
    email: 'viewer@tamansafari.id',
    displayName: 'Read-only',
    role: 'Read-only',
    description: 'Browse without editing',
    icon: Eye,
    accent: 'slate',
  },
];
