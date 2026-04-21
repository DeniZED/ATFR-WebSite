import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badge = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide',
  {
    variants: {
      variant: {
        neutral: 'bg-atfr-graphite text-atfr-fog',
        gold: 'bg-atfr-gold/15 text-atfr-gold border border-atfr-gold/30',
        success: 'bg-atfr-success/15 text-atfr-success border border-atfr-success/30',
        warning: 'bg-atfr-warning/15 text-atfr-warning border border-atfr-warning/30',
        danger: 'bg-atfr-danger/15 text-atfr-danger border border-atfr-danger/30',
        outline: 'border border-atfr-gold/40 text-atfr-bone',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badge({ variant }), className)} {...props} />;
}
