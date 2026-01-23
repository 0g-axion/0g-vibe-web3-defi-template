import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text */
  label?: string
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Left addon (icon or text) */
  leftAddon?: React.ReactNode
  /** Right addon (icon or button) */
  rightAddon?: React.ReactNode
  /** Input size */
  inputSize?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'h-9 text-sm px-3',
  md: 'h-11 text-base px-4',
  lg: 'h-14 text-lg px-5',
}

/**
 * GlassInput Component
 *
 * A text input with glassmorphism styling.
 *
 * @example
 * <GlassInput
 *   label="Amount"
 *   placeholder="0.00"
 *   rightAddon={<button>MAX</button>}
 * />
 */
export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftAddon,
      rightAddon,
      inputSize = 'md',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white/70 mb-1.5">
            {label}
          </label>
        )}

        <div className="relative">
          {leftAddon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
              {leftAddon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              // Base styles
              'w-full rounded-xl',
              'bg-black/20 backdrop-blur-sm',
              'border border-white/10',
              'text-white placeholder:text-white/40',
              'outline-none',
              'transition-all duration-200 ease-out',

              // Focus state
              'focus:border-primary-500',
              'focus:ring-2 focus:ring-primary-500/20',

              // Hover state
              'hover:border-white/20',

              // Size
              sizeStyles[inputSize],

              // Addons padding
              leftAddon && 'pl-10',
              rightAddon && 'pr-20',

              // Disabled state
              disabled && 'opacity-50 cursor-not-allowed',

              // Error state
              error && 'border-accent-red focus:border-accent-red focus:ring-accent-red/20',

              className
            )}
            {...props}
          />

          {rightAddon && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightAddon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-accent-red' : 'text-white/50'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

GlassInput.displayName = 'GlassInput'

export default GlassInput
