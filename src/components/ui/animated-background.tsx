import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Orb {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
}

export interface AnimatedBackgroundProps {
  /** Number of floating orbs */
  orbCount?: number
  /** Show grid overlay */
  showGrid?: boolean
  /** Animation intensity (0-1) */
  intensity?: number
  className?: string
}

const colors = [
  'from-primary-500/30 to-primary-600/10',
  'from-accent-cyan/20 to-primary-500/10',
  'from-accent-pink/20 to-primary-500/10',
  'from-primary-400/25 to-accent-cyan/10',
]

/**
 * AnimatedBackground Component
 *
 * Creates an animated gradient background with floating orbs and optional grid.
 * Use as the first child of your main container.
 *
 * @example
 * <div className="relative">
 *   <AnimatedBackground orbCount={5} showGrid />
 *   <main className="relative z-10">Content</main>
 * </div>
 */
export function AnimatedBackground({
  orbCount = 4,
  showGrid = true,
  intensity = 1,
  className,
}: AnimatedBackgroundProps) {
  const [orbs, setOrbs] = useState<Orb[]>([])

  useEffect(() => {
    const generatedOrbs: Orb[] = Array.from({ length: orbCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 200 + Math.random() * 400,
      color: colors[i % colors.length],
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 5,
    }))
    setOrbs(generatedOrbs)
  }, [orbCount])

  return (
    <div
      className={cn(
        'fixed inset-0 overflow-hidden pointer-events-none',
        className
      )}
      style={{ zIndex: 0 }}
    >
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.3), transparent),
            radial-gradient(ellipse 60% 50% at 0% 50%, rgba(34, 211, 238, 0.15), transparent),
            radial-gradient(ellipse 60% 50% at 100% 50%, rgba(236, 72, 153, 0.15), transparent),
            linear-gradient(180deg, #1a0533 0%, #2d1b4e 50%, #0f172a 100%)
          `,
        }}
      />

      {/* Floating orbs */}
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={cn(
            'absolute rounded-full blur-3xl bg-gradient-to-br',
            orb.color
          )}
          style={{
            width: orb.size * intensity,
            height: orb.size * intensity,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Grid overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      )}

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />
    </div>
  )
}

export default AnimatedBackground
