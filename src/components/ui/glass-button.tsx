import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'default' | 'primary' | 'ghost' | 'outline'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Show loading spinner */
  loading?: boolean
  /** Icon to display before text */
  icon?: React.ReactNode
  /** Icon to display after text */
  iconRight?: React.ReactNode
}

const variantStyles = {
  default: [
    'bg-white/10 hover:bg-white/15',
    'border-white/10 hover:border-white/20',
    'text-white',
  ],
  primary: [
    'bg-gradient-to-r from-primary-500 to-primary-600',
    'hover:from-primary-400 hover:to-primary-500',
    'border-primary-400/50',
    'text-white font-semibold',
    'shadow-glow hover:shadow-glow-lg',
  ],
  ghost: [
    'bg-transparent hover:bg-white/10',
    'border-transparent',
    'text-white/70 hover:text-white',
  ],
  outline: [
    'bg-transparent hover:bg-white/5',
    'border-white/20 hover:border-white/40',
    'text-white',
  ],
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-base rounded-xl gap-2',
  lg: 'px-6 py-3 text-lg rounded-xl gap-2.5',
}

/**
 * GlassButton Component
 *
 * A button with glassmorphism styling and multiple variants.
 *
 * @example
 * <GlassButton variant="primary" size="lg" loading={isLoading}>
 *   Connect Wallet
 * </GlassButton>
 */
export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      loading = false,
      disabled,
      icon,
      iconRight,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'border backdrop-blur-sm',
          'font-medium',
          'transition-all duration-200 ease-out',
          'active:scale-[0.98]',

          // Variant styles
          variantStyles[variant],

          // Size styles
          sizeStyles[size],

          // Disabled state
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',

          className
        )}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
            {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
          </>
        )}
      </button>
    )
  }
)

GlassButton.displayName = 'GlassButton'

export default GlassButton
