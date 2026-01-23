import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Add hover effect with glow */
  hoverable?: boolean
  /** Add gradient border */
  gradientBorder?: boolean
  /** Card padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

/**
 * GlassCard Component
 *
 * A glassmorphism card with blur backdrop, subtle border, and optional effects.
 * Use as a container for content sections.
 *
 * @example
 * <GlassCard hoverable padding="lg">
 *   <h2>Card Title</h2>
 *   <p>Card content</p>
 * </GlassCard>
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      hoverable = false,
      gradientBorder = false,
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base glass styles
          'rounded-2xl',
          'bg-white/5 backdrop-blur-xl',
          'border border-white/10',
          'shadow-glass',

          // Padding
          paddingStyles[padding],

          // Hover effects
          hoverable && [
            'transition-all duration-200 ease-out',
            'hover:bg-white/[0.08]',
            'hover:border-white/15',
            'hover:shadow-glass-hover',
            'hover:-translate-y-0.5',
          ],

          // Gradient border
          gradientBorder && 'gradient-border',

          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export default GlassCard
