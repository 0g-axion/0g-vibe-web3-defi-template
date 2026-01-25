/**
 * ChartPanel Component
 *
 * Price chart visualization with real data from DEX subgraph.
 * Shows OHLC price data for the selected token pair.
 *
 * Config-driven: Uses chain-specific default pool from config.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useChainId } from 'wagmi'
import { TrendingUp, TrendingDown, Clock, BarChart3, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDefaultTokenPair } from '@/constants/tokens'
import { useChartData, type TimeRange } from '@/hooks/useChartData'

const TIME_RANGES: TimeRange[] = ['1H', '24H', '7D', '30D', '1Y']

interface ChartPanelProps {
  fullWidth?: boolean
  poolAddress?: string
}

export function ChartPanel({
  fullWidth: _fullWidth,
  poolAddress,
}: ChartPanelProps) {
  const chainId = useChainId()
  const defaultPair = getDefaultTokenPair(chainId)

  const [timeRange, setTimeRange] = useState<TimeRange>('24H')

  // Fetch real chart data from subgraph (uses default pool from config if not specified)
  const {
    data: chartData,
    isLoading,
    error,
    refetch,
    hasSubgraph,
  } = useChartData(poolAddress, timeRange)

  // Extract values from chart data
  const points = chartData?.points || []
  const currentPrice = chartData?.currentPrice || 0
  const priceChangePercent = chartData?.priceChangePercent || 0
  const high24h = chartData?.high24h || 0
  const low24h = chartData?.low24h || 0
  const volume24h = chartData?.volume24h || 0
  const isPositive = priceChangePercent >= 0

  // Calculate SVG path from data points
  const width = 800
  const height = 300
  const padding = 20

  let pathPoints = ''
  let areaPath = ''

  if (points.length > 0) {
    const prices = points.map(p => p.close)
    const maxValue = Math.max(...prices)
    const minValue = Math.min(...prices)
    const range = maxValue - minValue || 1

    pathPoints = points
      .map((point, index) => {
        const x = padding + (index / (points.length - 1)) * (width - padding * 2)
        const y =
          height - padding - ((point.close - minValue) / range) * (height - padding * 2)
        return `${x},${y}`
      })
      .join(' ')

    areaPath = `M ${padding},${height - padding} L ${pathPoints} L ${width - padding},${height - padding} Z`
  }

  // Format helpers
  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(2)}`
  }

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(2)}M`
    if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`
    return `$${vol.toFixed(0)}`
  }

  const getTimeLabel = () => {
    switch (timeRange) {
      case '1H':
        return 'Last hour'
      case '24H':
        return 'Last 24 hours'
      case '7D':
        return 'Last 7 days'
      case '30D':
        return 'Last 30 days'
      case '1Y':
        return 'Last year'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <div className="relative rounded-3xl bg-[#12121a] border border-white/5 overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white">
                  {defaultPair.from.symbol.slice(0, 2)}
                </div>
                <span className="text-white font-semibold text-lg">
                  {defaultPair.from.symbol}/{defaultPair.to.symbol}
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                <BarChart3 className="w-4 h-4 text-white/50" />
                <span className="text-white/50 text-sm">Spot</span>
              </div>

              {/* Data status badge */}
              {!hasSubgraph ? (
                <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium">
                  Demo Mode
                </span>
              ) : error ? (
                <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium">
                  Error Loading
                </span>
              ) : (
                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                  Live Data
                </span>
              )}

              {/* Refresh button */}
              <button
                onClick={() => refetch()}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn(
                    'w-4 h-4 text-white/50',
                    isLoading && 'animate-spin'
                  )}
                />
              </button>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
              {TIME_RANGES.map(range => (
                <motion.button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    'relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    timeRange === range ? 'text-white' : 'text-white/50 hover:text-white'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {timeRange === range && (
                    <motion.div
                      layoutId="activeTimeRange"
                      className="absolute inset-0 bg-violet-500 rounded-lg"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{range}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Price Display */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              {isLoading && points.length === 0 ? (
                <div className="h-10 w-32 bg-white/10 rounded animate-pulse" />
              ) : (
                <motion.span
                  className="text-4xl font-bold text-white tabular-nums"
                  key={currentPrice}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {formatPrice(currentPrice)}
                </motion.span>
              )}
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium',
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {isPositive ? '+' : ''}
                  {priceChangePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1 text-white/40 text-sm">
              <Clock className="w-3 h-3" />
              <span>{getTimeLabel()}</span>
            </div>
          </div>

          {/* Chart */}
          <div className="relative h-[300px] w-full">
            {isLoading && points.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : points.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-white/40">
                No data available for this time range
              </div>
            ) : (
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                {/* Gradient Definition */}
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor={isPositive ? '#10b981' : '#ef4444'}
                      stopOpacity="0.3"
                    />
                    <stop
                      offset="100%"
                      stopColor={isPositive ? '#10b981' : '#ef4444'}
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0.25, 0.5, 0.75].map(ratio => (
                  <line
                    key={ratio}
                    x1={padding}
                    y1={height * ratio}
                    x2={width - padding}
                    y2={height * ratio}
                    stroke="rgba(255,255,255,0.05)"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Area Fill */}
                <motion.path
                  d={areaPath}
                  fill="url(#chartGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />

                {/* Line */}
                <motion.polyline
                  points={pathPoints}
                  fill="none"
                  stroke={isPositive ? '#10b981' : '#ef4444'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />

                {/* Current Price Dot */}
                {points.length > 0 && (
                  <>
                    <motion.circle
                      cx={width - padding}
                      cy={
                        height -
                        padding -
                        ((currentPrice - Math.min(...points.map(p => p.close))) /
                          (Math.max(...points.map(p => p.close)) -
                            Math.min(...points.map(p => p.close)) || 1)) *
                          (height - padding * 2)
                      }
                      r="6"
                      fill={isPositive ? '#10b981' : '#ef4444'}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, type: 'spring' }}
                    />
                    <motion.circle
                      cx={width - padding}
                      cy={
                        height -
                        padding -
                        ((currentPrice - Math.min(...points.map(p => p.close))) /
                          (Math.max(...points.map(p => p.close)) -
                            Math.min(...points.map(p => p.close)) || 1)) *
                          (height - padding * 2)
                      }
                      r="10"
                      fill={isPositive ? '#10b981' : '#ef4444'}
                      opacity="0.3"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ delay: 1, duration: 2, repeat: Infinity }}
                    />
                  </>
                )}
              </svg>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[
              { label: '24h High', value: formatPrice(high24h) },
              { label: '24h Low', value: formatPrice(low24h) },
              { label: '24h Volume', value: formatVolume(volume24h) },
              {
                label: 'Market Cap',
                value: hasSubgraph ? 'N/A' : '$1.2B',
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-white/40 text-xs mb-1">{stat.label}</div>
                <div className="text-white font-medium tabular-nums">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ChartPanel
