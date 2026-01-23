import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Plus, TrendingUp, Droplets, Info, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Pool {
  id: string
  token0: { symbol: string; name: string }
  token1: { symbol: string; name: string }
  tvl: number
  apr: number
  volume24h: number
  fee: number
  myLiquidity?: number
}

// Mock pool data
const MOCK_POOLS: Pool[] = [
  {
    id: '1',
    token0: { symbol: '0G', name: '0G Token' },
    token1: { symbol: 'USDC', name: 'USD Coin' },
    tvl: 2450000,
    apr: 24.5,
    volume24h: 890000,
    fee: 0.3,
    myLiquidity: 1250,
  },
  {
    id: '2',
    token0: { symbol: '0G', name: '0G Token' },
    token1: { symbol: 'ETH', name: 'Ethereum' },
    tvl: 1850000,
    apr: 18.2,
    volume24h: 620000,
    fee: 0.3,
  },
  {
    id: '3',
    token0: { symbol: 'USDC', name: 'USD Coin' },
    token1: { symbol: 'USDT', name: 'Tether' },
    tvl: 5200000,
    apr: 8.5,
    volume24h: 2100000,
    fee: 0.05,
  },
  {
    id: '4',
    token0: { symbol: 'ETH', name: 'Ethereum' },
    token1: { symbol: 'USDC', name: 'USD Coin' },
    tvl: 3800000,
    apr: 15.8,
    volume24h: 1450000,
    fee: 0.3,
  },
]

function formatNumber(num: number): string {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
  return `$${num.toFixed(2)}`
}

function PoolCard({ pool, index }: { pool: Pool; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/30 transition-all duration-300 overflow-hidden"
    >
      {/* Hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-5">
        {/* Pool Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white border-2 border-[#12121a]">
                {pool.token0.symbol.slice(0, 2)}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white border-2 border-[#12121a]">
                {pool.token1.symbol.slice(0, 2)}
              </div>
            </div>
            <div>
              <div className="text-white font-semibold">
                {pool.token0.symbol}/{pool.token1.symbol}
              </div>
              <div className="text-white/40 text-xs">{pool.fee}% fee</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pool.myLiquidity && (
              <span className="px-2 py-1 rounded-lg bg-violet-500/20 text-violet-400 text-xs font-medium">
                Your LP
              </span>
            )}
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
              <Droplets className="w-3 h-3" />
              TVL
            </div>
            <div className="text-white font-medium">{formatNumber(pool.tvl)}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              APR
            </div>
            <div className="text-emerald-400 font-medium">{pool.apr}%</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <div className="text-white/40 text-xs mb-1">24h Vol</div>
            <div className="text-white font-medium">{formatNumber(pool.volume24h)}</div>
          </div>
        </div>

        {/* Your Position (if any) */}
        {pool.myLiquidity && (
          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Your Liquidity</span>
              <span className="text-white font-medium">{formatNumber(pool.myLiquidity)}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add Liquidity
          </motion.button>
          <motion.button
            className="px-4 py-3 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 font-medium text-sm transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Swap
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export function PoolsPanel() {
  const { isConnected } = useAccount()
  const [filter, setFilter] = useState<'all' | 'my'>('all')

  const filteredPools = filter === 'my'
    ? MOCK_POOLS.filter(p => p.myLiquidity)
    : MOCK_POOLS

  const totalTVL = MOCK_POOLS.reduce((sum, p) => sum + p.tvl, 0)
  const totalVolume = MOCK_POOLS.reduce((sum, p) => sum + p.volume24h, 0)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      {/* Stats Banner */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total TVL', value: formatNumber(totalTVL), icon: Droplets },
          { label: '24h Volume', value: formatNumber(totalVolume), icon: TrendingUp },
          { label: 'Active Pools', value: MOCK_POOLS.length.toString(), icon: Info },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-2xl bg-[#12121a] border border-white/5 p-5 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
                <stat.icon className="w-4 h-4" />
                {stat.label}
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
          {(['all', 'my'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                filter === f
                  ? "bg-violet-500 text-white"
                  : "text-white/50 hover:text-white"
              )}
            >
              {f === 'all' ? 'All Pools' : 'My Positions'}
            </button>
          ))}
        </div>

        {isConnected && (
          <motion.button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            Create Pool
          </motion.button>
        )}
      </div>

      {/* Pool Grid */}
      {!isConnected && filter === 'my' ? (
        <div className="relative rounded-3xl bg-[#12121a] border border-white/5 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none rounded-3xl" />
          <div className="relative">
            <Droplets className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
            <p className="text-white/50 mb-6 max-w-sm mx-auto">
              Connect your wallet to view your liquidity positions
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  onClick={openConnectModal}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Connect Wallet
                </motion.button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
      ) : filteredPools.length === 0 ? (
        <div className="relative rounded-3xl bg-[#12121a] border border-white/5 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none rounded-3xl" />
          <div className="relative">
            <Droplets className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Positions Found</h3>
            <p className="text-white/50 mb-6">
              You don't have any liquidity positions yet
            </p>
            <motion.button
              onClick={() => setFilter('all')}
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/15 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View All Pools
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPools.map((pool, index) => (
            <PoolCard key={pool.id} pool={pool} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
