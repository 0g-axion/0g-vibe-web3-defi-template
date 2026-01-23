import { useEffect, useState, useRef } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface NumberFlowProps {
  /** The number to display */
  value: number | string
  /** Number of decimal places */
  decimals?: number
  /** Prefix (e.g., "$") */
  prefix?: string
  /** Suffix (e.g., "%") */
  suffix?: string
  /** Animation duration in seconds */
  duration?: number
  /** Format with commas */
  formatCommas?: boolean
  className?: string
}

/**
 * NumberFlow Component
 *
 * Animates number changes with a smooth spring transition.
 *
 * @example
 * <NumberFlow value={1234.56} prefix="$" decimals={2} />
 */
export function NumberFlow({
  value,
  decimals = 2,
  prefix = '',
  suffix = '',
  duration = 0.5,
  formatCommas = true,
  className,
}: NumberFlowProps) {
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
  const prevValue = useRef(numValue)

  const spring = useSpring(prevValue.current, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  })

  const display = useTransform(spring, (latest) => {
    const fixed = latest.toFixed(decimals)
    if (formatCommas) {
      const [integer, decimal] = fixed.split('.')
      const formattedInteger = parseInt(integer).toLocaleString()
      return decimal ? `${formattedInteger}.${decimal}` : formattedInteger
    }
    return fixed
  })

  useEffect(() => {
    spring.set(numValue)
    prevValue.current = numValue
  }, [numValue, spring])

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  )
}

/**
 * BalanceDisplay Component
 *
 * Specialized number display for token balances.
 */
export function BalanceDisplay({
  balance,
  symbol,
  decimals = 4,
  className,
}: {
  balance: string | number
  symbol?: string
  decimals?: number
  className?: string
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const num = typeof balance === 'string' ? parseFloat(balance) : balance
    setDisplayValue(isNaN(num) ? 0 : num)
  }, [balance])

  return (
    <div className={cn('flex items-baseline gap-1.5', className)}>
      <NumberFlow value={displayValue} decimals={decimals} />
      {symbol && (
        <span className="text-white/60 text-sm font-medium">{symbol}</span>
      )}
    </div>
  )
}

/**
 * CountUp Component
 *
 * Simple count-up animation from 0 to target value.
 */
export function CountUp({
  end,
  duration = 2,
  delay = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: {
  end: number
  duration?: number
  delay?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <NumberFlow
      value={started ? end : 0}
      decimals={decimals}
      prefix={prefix}
      suffix={suffix}
      duration={duration}
      className={className}
    />
  )
}

export default NumberFlow
