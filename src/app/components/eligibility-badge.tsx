import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { EligibilityStatus } from '../data/schemes';

interface EligibilityBadgeProps {
  status: EligibilityStatus;
  showIcon?: boolean;
  className?: string;
}

export function EligibilityBadge({ status, showIcon = true, className = '' }: EligibilityBadgeProps) {
  const config = {
    eligible: {
      label: 'Eligible',
      icon: CheckCircle,
      bgColor: 'bg-[#138808]/10',
      textColor: 'text-[#138808]',
      borderColor: 'border-[#138808]/30'
    },
    partial: {
      label: 'Partial Match',
      icon: AlertCircle,
      bgColor: 'bg-[#f59e0b]/10',
      textColor: 'text-[#f59e0b]',
      borderColor: 'border-[#f59e0b]/30'
    },
    'not-eligible': {
      label: 'Not Eligible',
      icon: XCircle,
      bgColor: 'bg-[#dc2626]/10',
      textColor: 'text-[#dc2626]',
      borderColor: 'border-[#dc2626]/30'
    }
  };

  const { label, icon: Icon, bgColor, textColor, borderColor } = config[status];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${bgColor} ${borderColor} ${textColor} ${className}`}
    >
      {showIcon && <Icon className="h-4 w-4" />}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
