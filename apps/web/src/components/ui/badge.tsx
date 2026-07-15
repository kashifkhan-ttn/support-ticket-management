import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        success: 'border-transparent bg-emerald-100 text-emerald-800',
        warning: 'border-transparent bg-amber-100 text-amber-800',
        danger: 'border-transparent bg-red-100 text-red-800',
        muted: 'border-transparent bg-slate-100 text-slate-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function statusBadgeVariant(status: string) {
  switch (status) {
    case 'OPEN':
      return 'default' as const;
    case 'IN_PROGRESS':
      return 'warning' as const;
    case 'RESOLVED':
      return 'success' as const;
    case 'CLOSED':
      return 'muted' as const;
    case 'CANCELLED':
      return 'danger' as const;
    default:
      return 'secondary' as const;
  }
}

export function priorityBadgeVariant(priority: string) {
  switch (priority) {
    case 'URGENT':
      return 'danger' as const;
    case 'HIGH':
      return 'warning' as const;
    case 'MEDIUM':
      return 'default' as const;
    default:
      return 'muted' as const;
  }
}
