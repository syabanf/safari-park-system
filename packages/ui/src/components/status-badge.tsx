import type { ComponentProps } from 'react';
import { Badge } from './badge';

type PassStatus = 'active' | 'expired' | 'suspended' | 'pending';

const variantByStatus: Record<PassStatus, ComponentProps<typeof Badge>['variant']> = {
  active: 'success',
  expired: 'destructive',
  suspended: 'warning',
  pending: 'secondary',
};

interface StatusBadgeProps {
  status: PassStatus;
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return <Badge variant={variantByStatus[status]}>{label}</Badge>;
}
