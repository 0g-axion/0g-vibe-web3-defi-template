/**
 * useChartData Hook
 *
 * Fetches price history from the configured DEX subgraph for chart display.
 * Supports multiple time ranges with appropriate data granularity.
 *
 * Config-driven: Uses chain-specific subgraph URL and default pool from config.
 */

import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import {
  fetchPoolDayData,
  fetchPoolHourData,
  type PoolDayData,
  type PoolHourData,
} from '@/services/subgraph'
import { getDefaultChartPool, hasSubgraphSupport } from '@/config/subgraph'

export type TimeRange = '1H' | '24H' | '7D' | '30D' | '1Y'

export interface ChartDataPoint {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface ChartData {
  points: ChartDataPoint[]
  currentPrice: number
  priceChange: number
  priceChangePercent: number
  high24h: number
  low24h: number
  volume24h: number
}

/**
 * Convert pool day data to chart points
 */
function dayDataToChartPoints(data: PoolDayData[]): ChartDataPoint[] {
  return data.map(d => ({
    timestamp: d.date * 1000, // Convert to milliseconds
    open: parseFloat(d.open),
    high: parseFloat(d.high),
    low: parseFloat(d.low),
    close: parseFloat(d.close),
    volume: parseFloat(d.volumeUSD),
  }))
}

/**
 * Convert pool hour data to chart points
 */
function hourDataToChartPoints(data: PoolHourData[]): ChartDataPoint[] {
  return data.map(d => ({
    timestamp: d.periodStartUnix * 1000, // Convert to milliseconds
    open: parseFloat(d.open),
    high: parseFloat(d.high),
    low: parseFloat(d.low),
    close: parseFloat(d.close),
    volume: parseFloat(d.volumeUSD),
  }))
}

/**
 * Calculate stats from chart data
 */
function calculateStats(points: ChartDataPoint[]): Omit<ChartData, 'points'> {
  if (points.length === 0) {
    return {
      currentPrice: 0,
      priceChange: 0,
      priceChangePercent: 0,
      high24h: 0,
      low24h: 0,
      volume24h: 0,
    }
  }

  const currentPrice = points[points.length - 1].close
  const startPrice = points[0].open
  const priceChange = currentPrice - startPrice
  const priceChangePercent = startPrice > 0 ? (priceChange / startPrice) * 100 : 0

  // Get 24h stats (last 24 points for hourly, last 1 point for daily)
  const last24hPoints = points.slice(-24)
  const high24h = Math.max(...last24hPoints.map(p => p.high))
  const low24h = Math.min(...last24hPoints.map(p => p.low))
  const volume24h = last24hPoints.reduce((sum, p) => sum + p.volume, 0)

  return {
    currentPrice,
    priceChange,
    priceChangePercent,
    high24h,
    low24h,
    volume24h,
  }
}

/**
 * useChartData Hook
 *
 * @param poolAddress - The pool address to fetch data for (optional, uses default from config)
 * @param timeRange - Time range for the chart
 */
export function useChartData(poolAddress?: string, timeRange: TimeRange = '24H') {
  const chainId = useChainId()
  const hasSubgraph = hasSubgraphSupport(chainId)

  // Get pool address from props or config
  const effectivePoolAddress = poolAddress || getDefaultChartPool(chainId)

  const query = useQuery({
    queryKey: ['chartData', chainId, effectivePoolAddress, timeRange],
    queryFn: async (): Promise<ChartData> => {
      if (!effectivePoolAddress) {
        return {
          points: [],
          currentPrice: 0,
          priceChange: 0,
          priceChangePercent: 0,
          high24h: 0,
          low24h: 0,
          volume24h: 0,
        }
      }

      let points: ChartDataPoint[] = []

      // Fetch appropriate data based on time range
      switch (timeRange) {
        case '1H':
          // Last hour - use hourly data (limited granularity)
          const hourData1H = await fetchPoolHourData(chainId, effectivePoolAddress, 2)
          points = hourDataToChartPoints(hourData1H)
          break

        case '24H':
          // Last 24 hours - use hourly data
          const hourData24H = await fetchPoolHourData(chainId, effectivePoolAddress, 24)
          points = hourDataToChartPoints(hourData24H)
          break

        case '7D':
          // Last 7 days - use hourly data (168 hours)
          const hourData7D = await fetchPoolHourData(chainId, effectivePoolAddress, 168)
          points = hourDataToChartPoints(hourData7D)
          break

        case '30D':
          // Last 30 days - use daily data
          const dayData30D = await fetchPoolDayData(chainId, effectivePoolAddress, 30)
          points = dayDataToChartPoints(dayData30D)
          break

        case '1Y':
          // Last year - use daily data (365 days)
          const dayData1Y = await fetchPoolDayData(chainId, effectivePoolAddress, 365)
          points = dayDataToChartPoints(dayData1Y)
          break
      }

      const stats = calculateStats(points)

      return {
        points,
        ...stats,
      }
    },
    enabled: hasSubgraph && !!effectivePoolAddress,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
    hasSubgraph,
    poolAddress: effectivePoolAddress,
  }
}

/**
 * useCurrentPrice Hook
 *
 * Fetches just the current price (faster for real-time updates)
 */
export function useCurrentPrice(poolAddress?: string) {
  const chainId = useChainId()
  const hasSubgraph = hasSubgraphSupport(chainId)
  const effectivePoolAddress = poolAddress || getDefaultChartPool(chainId)

  return useQuery({
    queryKey: ['currentPrice', chainId, effectivePoolAddress],
    queryFn: async () => {
      if (!effectivePoolAddress) return null
      const { fetchCurrentPrice } = await import('@/services/subgraph')
      return fetchCurrentPrice(chainId, effectivePoolAddress)
    },
    enabled: hasSubgraph && !!effectivePoolAddress,
    staleTime: 10000, // 10 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

export default useChartData
