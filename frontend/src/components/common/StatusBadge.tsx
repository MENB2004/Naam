import { cn } from '../../lib/utils';
import { 
  Clock, 
  Search, 
  UserCheck, 
  PlayCircle, 
  CheckCircle, 
  ShieldCheck, 
  XCircle, 
  RotateCcw 
} from 'lucide-react';

export type ComplaintStatus = 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'VERIFIED' 
  | 'REJECTED' 
  | 'REOPENED';

interface StatusConfig {
  labelMl: string;
  labelEn: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  icon: typeof Clock;
}

const STATUS_CONFIGS: Record<ComplaintStatus, StatusConfig> = {
  SUBMITTED: {
    labelMl: 'സമർപ്പിച്ചു',
    labelEn: 'Submitted',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    icon: Clock,
  },
  UNDER_REVIEW: {
    labelMl: 'പരിശോധനയിൽ',
    labelEn: 'Under Review',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-200',
    icon: Search,
  },
  ASSIGNED: {
    labelMl: 'ചുമതലപ്പെടുത്തി',
    labelEn: 'Assigned',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
    icon: UserCheck,
  },
  IN_PROGRESS: {
    labelMl: 'പുരോഗമിക്കുന്നു',
    labelEn: 'In Progress',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-200',
    icon: PlayCircle,
  },
  RESOLVED: {
    labelMl: 'പരിഹരിച്ചു',
    labelEn: 'Resolved',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    icon: CheckCircle,
  },
  VERIFIED: {
    labelMl: 'സ്ഥിരീകരിച്ചു',
    labelEn: 'Verified',
    bgClass: 'bg-teal-50',
    textClass: 'text-teal-800',
    borderClass: 'border-teal-300',
    icon: ShieldCheck,
  },
  REJECTED: {
    labelMl: 'നിരസിച്ചു',
    labelEn: 'Rejected',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
    icon: XCircle,
  },
  REOPENED: {
    labelMl: 'പുനഃപരിശോധനയിൽ',
    labelEn: 'Reopened',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    icon: RotateCcw,
  },
};

interface StatusBadgeProps {
  status: ComplaintStatus;
  lang?: 'ml' | 'en';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  lang = 'ml',
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.SUBMITTED;
  const Icon = config.icon;
  const label = lang === 'ml' ? config.labelMl : config.labelEn;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 space-x-1.5',
    lg: 'text-sm sm:text-base px-3 py-1.5 space-x-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
    lg: 'w-4 h-4 sm:w-5 sm:h-5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        config.bgClass,
        config.textClass,
        config.borderClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{label}</span>
    </span>
  );
}
