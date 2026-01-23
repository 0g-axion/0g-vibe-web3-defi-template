import { cn } from '@/lib/utils'

export interface ShimmerProps {
  /** Width of the shimmer */
  width?: string | number
  /** Height of the shimmer */
  height?: string | number
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

const roundedStyles = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  full: 'rounded-full',
}

/**
 * Shimmer Component
 *
 * A loading skeleton with shimmer animation.
 *
 * @example
 * <Shimmer width={200} height={40} rounded="lg" />
 */
export function Shimmer({
  width,
  height,
  rounded = 'lg',
  className,
}: ShimmerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-white/5',
        roundedStyles[rounded],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
        }}
      />
    </div>
  )
}

/**
 * ShimmerText Component
 *
 * A text placeholder with shimmer effect.
 */
export function ShimmerText({
  lines = 1,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          height={16}
          width={i === lines - 1 && lines > 1 ? '60%' : '100%'}
          rounded="sm"
        />
      ))}
    </div>
  )
}

/**
 * ShimmerCard Component
 *
 * A card-shaped shimmer placeholder.
 */
export function ShimmerCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl bg-white/5 border border-white/10',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <Shimmer width={40} height={40} rounded="full" />
        <div className="flex-1">
          <Shimmer height={16} width="60%" rounded="sm" className="mb-2" />
          <Shimmer height={12} width="40%" rounded="sm" />
        </div>
      </div>
      <ShimmerText lines={2} />
    </div>
  )
}

export default Shimmer
