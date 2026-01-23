import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface GradientTextProps extends HTMLAttributes<HTMLSpanElement> {
  /** Gradient preset */
  variant?: 'default' | 'cyan' | 'pink' | 'gold'
  /** Animate the gradient */
  animate?: boolean
  /** HTML element to render */
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p'
}

const gradientVariants = {
  default: 'from-primary-400 via-accent-cyan to-accent-pink',
  cyan: 'from-accent-cyan via-primary-400 to-accent-cyan',
  pink: 'from-accent-pink via-primary-400 to-accent-pink',
  gold: 'from-yellow-400 via-orange-400 to-yellow-400',
}

/**
 * GradientText Component
 *
 * Text with an animated gradient effect.
 *
 * @example
 * <GradientText as="h1" variant="default" animate>
 *   Welcome to 0G Swap
 * </GradientText>
 */
export function GradientText({
  className,
  variant = 'default',
  animate = true,
  as: Component = 'span',
  children,
  ...props
}: GradientTextProps) {
  return (
    <Component
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent',
        gradientVariants[variant],
        animate && 'bg-[length:200%_auto] animate-gradient',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export default GradientText
