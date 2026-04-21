import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const alert = cva(
  'flex items-start gap-3 rounded-md border px-4 py-3 text-sm',
  {
    variants: {
      tone: {
        info: 'border-atfr-gold/30 bg-atfr-gold/5 text-atfr-bone',
        success:
          'border-atfr-success/40 bg-atfr-success/10 text-atfr-success',
        warning:
          'border-atfr-warning/40 bg-atfr-warning/10 text-atfr-warning',
        danger: 'border-atfr-danger/40 bg-atfr-danger/10 text-atfr-danger',
      },
    },
    defaultVariants: { tone: 'info' },
  },
);

const iconFor = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
} as const;

interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alert> {
  title?: ReactNode;
}

export function Alert({ tone = 'info', title, className, children, ...props }: AlertProps) {
  const Icon = iconFor[tone ?? 'info'];
  return (
    <div className={cn(alert({ tone }), className)} role="alert" {...props}>
      <Icon size={18} className="mt-0.5 shrink-0" strokeWidth={1.8} />
      <div className="space-y-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-atfr-bone/90 leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
