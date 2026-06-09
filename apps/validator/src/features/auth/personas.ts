import type { LucideIcon } from 'lucide-react';
import { Crown, ScanLine, ShieldCheck, Wrench } from 'lucide-react';

export interface ValidatorPersona {
  id: string;
  username: string;
  displayName: string;
  role: string;
  gateId: string;
  gateLabel: string;
  description: string;
  icon: LucideIcon;
  accent: 'brand' | 'earth' | 'rose' | 'slate';
}

export const VALIDATOR_PERSONAS: ValidatorPersona[] = [
  {
    id: 'gate-officer',
    username: 'rina.wijaya',
    displayName: 'Rina Wijaya',
    role: 'Gate Officer',
    gateId: 'gate-bgr-01',
    gateLabel: 'Bogor — Main',
    description: 'Front-line scanning at Bogor Main Entrance',
    icon: ScanLine,
    accent: 'brand',
  },
  {
    id: 'senior-officer',
    username: 'adi.pratama',
    displayName: 'Adi Pratama',
    role: 'Senior Gate Officer',
    gateId: 'gate-bgr-02',
    gateLabel: 'Bogor — Family',
    description: 'Handles tricky scans + manual entry',
    icon: ShieldCheck,
    accent: 'brand',
  },
  {
    id: 'supervisor',
    username: 'bayu.saputra',
    displayName: 'Bayu Saputra',
    role: 'Shift Supervisor',
    gateId: 'gate-prg-01',
    gateLabel: 'Prigen — North',
    description: 'Approves manual overrides, reviews offline queue',
    icon: Crown,
    accent: 'earth',
  },
  {
    id: 'field-tech',
    username: 'wahyu.tech',
    displayName: 'Wahyu',
    role: 'Field Tech',
    gateId: 'gate-prg-02',
    gateLabel: 'Prigen — South',
    description: 'On-call hardware + connectivity troubleshooting',
    icon: Wrench,
    accent: 'rose',
  },
];
