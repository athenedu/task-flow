import type { Priority } from '@/types';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityConfig: Record<Priority, { label: string; bg: string; text: string; border: string }> = {
  'urgente': {
    label: 'Urgente',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200'
  },
  'alta': {
    label: 'Alta',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200'
  },
  'média': {
    label: 'Média',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  'baixa': {
    label: 'Baixa',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200'
  }
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      config.bg,
      config.text,
      config.border,
      className
    )}>
      {config.label}
    </span>
  );
}
