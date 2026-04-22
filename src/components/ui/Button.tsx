import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const button = cva(
  'inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200 ease-emphasized disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-offset-atfr-ink rounded-md',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-gold text-atfr-ink shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 active:translate-y-0',
        secondary:
          'bg-atfr-graphite text-atfr-bone border border-atfr-gold/30 hover:border-atfr-gold hover:text-atfr-gold',
        ghost:
          'bg-transparent text-atfr-bone hover:bg-atfr-graphite hover:text-atfr-gold',
        outline:
          'bg-transparent border border-atfr-gold/40 text-atfr-gold hover:bg-atfr-gold/10',
        danger:
          'bg-atfr-danger/90 text-white hover:bg-atfr-danger',
      },
      size: {
        sm: 'text-xs px-3 py-1.5',
        md: 'text-sm px-4 py-2',
        lg: 'text-sm px-6 py-3 uppercase tracking-widest',
        xl: 'text-base px-8 py-4 uppercase tracking-widest',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, leadingIcon, trailingIcon, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(button({ variant, size }), className)}
      {...props}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  ),
);
Button.displayName = 'Button';
