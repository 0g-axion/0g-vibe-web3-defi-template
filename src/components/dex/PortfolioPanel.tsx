import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, History, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TokenHolding {
  symbol: string
  name: string
  balance: number
  value: number
  price: number
  change24h: number
  allocation: number
}

interface Transaction {
  id: string
  type: 'swap' | 'add' | 'remove'
  token0: string
  token1: string
  amount0: number
  amount1: number
  timestamp: Date
  status: 'completed' | 'pending' | 'failed'
}

// Mock portfolio data
const MOCK_HOLDINGS: TokenHolding[] = [
  {
    symbol: '0G',
    name: '0G Token',
    balance: 15000,
    value: 750,
    price: 0.05,
    change24h: 5.2,
    allocation: 45,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 0.5,
    value: 925,
    price: 1850,
    change24h: -1.8,
    allocation: 35,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 500,
    value: 500,
    price: 1.0,
    change24h: 0,
    allocation: 20,
  },
]

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'swap',
    token0: '0G',
    token1: 'USDC',
    amount0: 1000,
    amount1: 50,
    timestamp: new Date(Date.now() - 3600000),
    status: 'completed',
  },
  {
    id: '2',
    type: 'add',
    token0: '0G',
    token1: 'ETH',
    amount0: 5000,
    amount1: 0.125,
    timestamp: new Date(Date.now() - 86400000),
    status: 'completed',
  },
  {
    id: '3',
    type: 'swap',
    token0: 'ETH',
    token1: '0G',
    amount0: 0.1,
    amount1: 3700,
    timestamp: new Date(Date.now() - 172800000),
    status: 'completed',
  },
]

function formatValue(num: number): string {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
  if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function HoldingCard({ holding, index }: { holding: TokenHolding; index: number }) {
  const isPositive = holding.change24h >= 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white">
          {holding.symbol.slice(0, 2)}
        </div>
        <div>
          <div className="text-white font-medium">{holding.symbol}</div>
          <div className="text-white/40 text-sm">{holding.balance.toLocaleString()} tokens</div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-white font-medium">{formatValue(holding.value)}</div>
        <div className={cn(
          "flex items-center justify-end gap-1 text-sm",
          isPositive ? "text-emerald-400" : "text-red-400"
        )}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{isPositive ? '+' : ''}{holding.change24h}%</span>
        </div>
      </div>
    </motion.div>
  )
}

function TransactionRow({ tx, index }: { tx: Transaction; index: number }) {
  const getTypeIcon = () => {
    switch (tx.type) {
      case 'swap':
        return <ArrowUpRight className="w-4 h-4" />
      case 'add':
        return <ArrowDownRight className="w-4 h-4 text-emerald-400" />
      case 'remove':
        return <ArrowUpRight className="w-4 h-4 text-red-400" />
    }
  }

  const getTypeLabel = () => {
    switch (tx.type) {
      case 'swap': return 'Swapped'
      case 'add': return 'Added Liquidity'
      case 'remove': return 'Removed Liquidity'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          tx.type === 'swap' ? "bg-violet-500/20 text-violet-400" :
          tx.type === 'add' ? "bg-emerald-500/20 text-emerald-400" :
          "bg-red-500/20 text-red-400"
        )}>
          {getTypeIcon()}
        </div>
        <div>
          <div className="text-white text-sm font-medium">{getTypeLabel()}</div>
          <div className="text-white/40 text-xs">
            {tx.amount0} {tx.token0} → {tx.amount1.toFixed(4)} {tx.token1}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className={cn(
          "text-xs px-2 py-0.5 rounded-full",
          tx.status === 'completed' ? "bg-emerald-500/20 text-emerald-400" :
          tx.status === 'pending' ? "bg-amber-500/20 text-amber-400" :
          "bg-red-500/20 text-red-400"
        )}>
          {tx.status}
        </div>
        <div className="text-white/40 text-xs mt-1">{formatTimeAgo(tx.timestamp)}</div>
      </div>
    </motion.div>
  )
}

export function PortfolioPanel() {
  const { isConnected, address } = useAccount()
  const [activeTab, setActiveTab] = useState<'holdings' | 'activity'>('holdings')

  const totalValue = MOCK_HOLDINGS.reduce((sum, h) => sum + h.value, 0)
  const totalChange = MOCK_HOLDINGS.reduce((sum, h) => sum + (h.value * h.change24h / 100), 0)
  const totalChangePercent = (totalChange / totalValue) * 100
  const isPositive = totalChangePercent >= 0

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <div className="relative rounded-3xl bg-[#12121a] border border-white/5 p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-violet-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              Connect your wallet to view your portfolio, track your holdings, and manage your positions
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  onClick={openConnectModal}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Connect Wallet
                </motion.button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full space-y-6"
    >
      {/* Portfolio Overview Card */}
      <div className="relative rounded-3xl bg-[#12121a] border border-white/5 p-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 pointer-events-none" />

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/50 text-sm mb-1">Total Portfolio Value</p>
              <h2 className="text-4xl font-bold text-white">{formatValue(totalValue)}</h2>
              <div className={cn(
                "flex items-center gap-2 mt-2",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {isPositive ? '+' : ''}{formatValue(Math.abs(totalChange))} ({isPositive ? '+' : ''}{totalChangePercent.toFixed(2)}%)
                </span>
                <span className="text-white/40">24h</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/70 text-sm font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </div>

          {/* Allocation Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Allocation</span>
              <div className="flex items-center gap-3">
                {MOCK_HOLDINGS.map((h) => (
                  <div key={h.symbol} className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      h.symbol === '0G' ? "bg-violet-500" :
                      h.symbol === 'ETH' ? "bg-cyan-500" :
                      "bg-emerald-500"
                    )} />
                    <span className="text-white/60 text-xs">{h.symbol} {h.allocation}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden flex">
              {MOCK_HOLDINGS.map((h) => (
                <motion.div
                  key={h.symbol}
                  initial={{ width: 0 }}
                  animate={{ width: `${h.allocation}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={cn(
                    "h-full",
                    h.symbol === '0G' ? "bg-gradient-to-r from-violet-500 to-violet-400" :
                    h.symbol === 'ETH' ? "bg-gradient-to-r from-cyan-500 to-cyan-400" :
                    "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('holdings')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'holdings'
              ? "bg-violet-500 text-white"
              : "text-white/50 hover:text-white"
          )}
        >
          <PieChart className="w-4 h-4" />
          Holdings
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'activity'
              ? "bg-violet-500 text-white"
              : "text-white/50 hover:text-white"
          )}
        >
          <History className="w-4 h-4" />
          Activity
        </button>
      </div>

      {/* Content */}
      <div className="relative rounded-3xl bg-[#12121a] border border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />

        <div className="relative p-5">
          {activeTab === 'holdings' ? (
            <div className="space-y-2">
              {MOCK_HOLDINGS.map((holding, index) => (
                <HoldingCard key={holding.symbol} holding={holding} index={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {MOCK_TRANSACTIONS.map((tx, index) => (
                <TransactionRow key={tx.id} tx={tx} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
