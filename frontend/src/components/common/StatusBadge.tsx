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
  | 'ACTION_TAKEN'
  | 'RESOLVED' 
  | 'VERIFIED' 
  | 'REJECTED' 
  | 'REOPENED'
  | 'APPEALED';

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
    bgClass: 'bg-accent/10',
    textClass: 'text-accent',
    borderClass: 'border-accent/25',
    icon: Clock,
  },
  UNDER_REVIEW: {
    labelMl: 'പരിശോധനയിൽ',
    labelEn: 'Under Review',
    bgClass: 'bg-warning/10',
    textClass: 'text-warning',
    borderClass: 'border-warning/25',
    icon: Search,
  },
  ASSIGNED: {
    labelMl: 'ചുമതലപ്പെടുത്തി',
    labelEn: 'Assigned',
    bgClass: 'bg-secondary/10',
    textClass: 'text-secondary',
    borderClass: 'border-secondary/25',
    icon: UserCheck,
  },
  IN_PROGRESS: {
    labelMl: 'പുരോഗമിക്കുന്നു',
    labelEn: 'In Progress',
    bgClass: 'bg-secondary/10',
    textClass: 'text-secondary',
    borderClass: 'border-secondary/25',
    icon: PlayCircle,
  },
  ACTION_TAKEN: {
    labelMl: 'നടപടി സ്വീകരിച്ചു',
    labelEn: 'Action Taken',
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
    borderClass: 'border-primary/25',
    icon: CheckCircle,
  },
  RESOLVED: {
    labelMl: 'പരിഹരിച്ചു',
    labelEn: 'Resolved',
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
    borderClass: 'border-primary/25',
    icon: CheckCircle,
  },
  VERIFIED: {
    labelMl: 'സ്ഥിരീകരിച്ചു',
    labelEn: 'Verified',
    bgClass: 'bg-secondary/10',
    textClass: 'text-secondary',
    borderClass: 'border-secondary/25',
    icon: ShieldCheck,
  },
  REJECTED: {
    labelMl: 'നിരസിച്ചു',
    labelEn: 'Rejected',
    bgClass: 'bg-critical/10',
    textClass: 'text-critical',
    borderClass: 'border-critical/25',
    icon: XCircle,
  },
  REOPENED: {
    labelMl: 'പുനഃപരിശോധനയിൽ',
    labelEn: 'Reopened',
    bgClass: 'bg-critical/10',
    textClass: 'text-critical',
    borderClass: 'border-critical/25',
    icon: RotateCcw,
  },
  APPEALED: {
    labelMl: 'അപ്പീൽ നൽകി',
    labelEn: 'Appealed',
    bgClass: 'bg-warning/10',
    textClass: 'text-warning',
    borderClass: 'border-warning/25',
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
