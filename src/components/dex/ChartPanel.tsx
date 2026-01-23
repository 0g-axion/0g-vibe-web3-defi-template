import { useState } from 'react'
import { motion } from 'framer-motion'
import { useChainId } from 'wagmi'
import { TrendingUp, TrendingDown, Clock, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDefaultTokenPair } from '@/constants/tokens'

type TimeRange = '1H' | '24H' | '7D' | '30D' | '1Y'

const TIME_RANGES: TimeRange[] = ['1H', '24H', '7D', '30D', '1Y']

// Generate mock chart data
function generateChartData(range: TimeRange) {
  const points = range === '1H' ? 60 : range === '24H' ? 96 : range === '7D' ? 168 : range === '30D' ? 30 : 365
  const data: number[] = []
  let value = 1850 + Math.random() * 100

  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.48) * 20
    value = Math.max(value, 1700)
    data.push(value)
  }
  return data
}

interface ChartPanelProps {
  fullWidth?: boolean
}

export function ChartPanel({ fullWidth: _fullWidth }: ChartPanelProps) {
  const chainId = useChainId()
  const defaultPair = getDefaultTokenPair(chainId)

  const [timeRange, setTimeRange] = useState<TimeRange>('24H')
  const [chartData] = useState(() => generateChartData('24H'))

  const currentPrice = chartData[chartData.length - 1]
  const startPrice = chartData[0]
  const priceChange = ((currentPrice - startPrice) / startPrice) * 100
  const isPositive = priceChange >= 0

  // Calculate SVG path
  const width = 800
  const height = 300
  const padding = 20
  const maxValue = Math.max(...chartData)
  const minValue = Math.min(...chartData)
  const range = maxValue - minValue || 1

  const points = chartData.map((value, index) => {
    const x = padding + (index / (chartData.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - minValue) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  const areaPath = `M ${padding},${height - padding} L ${points} L ${width - padding},${height - padding} Z`

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
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
              {TIME_RANGES.map((range) => (
                <motion.button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    timeRange === range
                      ? "text-white"
                      : "text-white/50 hover:text-white"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {timeRange === range && (
                    <motion.div
                      layoutId="activeTimeRange"
                      className="absolute inset-0 bg-violet-500 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
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
              <motion.span
                className="text-4xl font-bold text-white tabular-nums"
                key={currentPrice}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                ${currentPrice.toFixed(2)}
              </motion.span>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              )}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1 text-white/40 text-sm">
              <Clock className="w-3 h-3" />
              <span>Last 24 hours</span>
            </div>
          </div>

          {/* Chart */}
          <div className="relative h-[300px] w-full">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0.25, 0.5, 0.75].map((ratio) => (
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
                points={points}
                fill="none"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />

              {/* Current Price Dot */}
              <motion.circle
                cx={width - padding}
                cy={height - padding - ((currentPrice - minValue) / range) * (height - padding * 2)}
                r="6"
                fill={isPositive ? "#10b981" : "#ef4444"}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
              />
              <motion.circle
                cx={width - padding}
                cy={height - padding - ((currentPrice - minValue) / range) * (height - padding * 2)}
                r="10"
                fill={isPositive ? "#10b981" : "#ef4444"}
                opacity="0.3"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ delay: 1, duration: 2, repeat: Infinity }}
              />
            </svg>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[
              { label: '24h High', value: `$${maxValue.toFixed(2)}` },
              { label: '24h Low', value: `$${minValue.toFixed(2)}` },
              { label: '24h Volume', value: '$12.4M' },
              { label: 'Market Cap', value: '$1.2B' },
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
