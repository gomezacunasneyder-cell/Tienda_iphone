import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** Botones en píldora: el principal es rojo CeluNorte con brillo; se elevan al pasar el cursor y se hunden al presionar. */
const button = cva(
  'relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg ' +
    'active:translate-y-0 active:scale-[.98] disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[linear-gradient(180deg,var(--color-brand-500),var(--color-brand-600))] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_10px_24px_-12px_rgb(232_25_46/0.85)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_18px_34px_-14px_rgb(255_45_61/0.95)]',
        secondary: 'bg-surface text-ink ring-1 ring-line hover:-translate-y-0.5 hover:bg-raised',
        outline: 'border border-line-strong bg-white/[0.03] text-ink hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]',
        ghost: 'text-ink hover:bg-white/[0.06]',
        danger: 'bg-red-600 text-white shadow-[0_10px_22px_-12px_rgb(220_38_38/0.7)] hover:-translate-y-0.5 hover:bg-red-700',
      },
      size: { sm: 'h-10 px-4 text-sm', md: 'h-11 px-6 text-sm', lg: 'h-12 px-7 text-base' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {}

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(button({ variant, size }), className)} {...props} />
}

// eslint-disable-next-line react-refresh/only-export-components
export const buttonClasses = button
