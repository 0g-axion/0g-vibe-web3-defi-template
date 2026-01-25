/**
 * Header Component
 *
 * App header with navigation tabs and wallet connection.
 * Config-driven tabs based on feature settings.
 * Fixed network display to show actual connected network.
 */
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccount, useChainId } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ArrowLeftRight, LayoutGrid, LineChart, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CHAIN_IDS, getChainMetadata } from '@/config/chains'
import { useFeatures } from '@/providers/feature-provider'

type Tab = 'swap' | 'pools' | 'chart' | 'portfolio'

interface HeaderProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const allTabs: { id: Tab; label: string; icon: React.ReactNode; feature: 'swap' | 'pools' | 'chart' | 'portfolio' }[] = [
  { id: 'swap', label: 'Swap', icon: <ArrowLeftRight className="w-4 h-4" />, feature: 'swap' },
  { id: 'pools', label: 'Pools', icon: <LayoutGrid className="w-4 h-4" />, feature: 'pools' },
  { id: 'chart', label: 'Chart', icon: <LineChart className="w-4 h-4" />, feature: 'chart' },
  { id: 'portfolio', label: 'Portfolio', icon: <Wallet className="w-4 h-4" />, feature: 'portfolio' },
]

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const isMainnet = chainId === CHAIN_IDS.MAINNET
  const { name: networkName } = getChainMetadata(chainId)
  const features = useFeatures()

  // Filter tabs based on feature config
  const tabs = useMemo(() => {
    return allTabs.filter(tab => features[tab.feature].enabled)
  }, [features])

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5" />

      <div className="relative max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="/"
          className="flex items-center gap-3 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative">
            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25"
              animate={{
                boxShadow: [
                  "0 10px 25px -5px rgba(139, 92, 246, 0.25)",
                  "0 10px 25px -5px rgba(139, 92, 246, 0.45)",
                  "0 10px 25px -5px rgba(139, 92, 246, 0.25)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-white font-bold text-sm">0G</span>
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-lg"
              animate={{ opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <span className="text-white font-semibold text-lg hidden sm:block">
            0G <span className="text-white/60 font-normal">Swap</span>
          </span>
        </motion.a>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center">
          <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  activeTab === tab.id
                    ? "text-white"
                    : "text-white/50 hover:text-white/80"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile Nav */}
        <nav className="flex md:hidden items-center gap-1">
          {tabs.slice(0, 3).map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-white/50"
              )}
            >
              {tab.icon}
            </button>
          ))}
        </nav>

        {/* Wallet Connect */}
        <div className="flex items-center gap-3">
          {/* Network indicator - Dynamic based on chainId */}
          {isConnected && (
            <motion.div
              className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                isMainnet
                  ? "bg-amber-500/10 border-amber-500/20"
                  : "bg-emerald-500/10 border-emerald-500/20"
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="relative flex h-2 w-2">
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  isMainnet ? "bg-amber-400" : "bg-emerald-400"
                )} />
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  isMainnet ? "bg-amber-400" : "bg-emerald-400"
                )} />
              </span>
              <span className={cn(
                "text-xs font-medium",
                isMainnet ? "text-amber-400" : "text-emerald-400"
              )}>
                {networkName}
              </span>
            </motion.div>
          )}

          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
              const ready = mounted
              const connected = ready && account && chain

              return (
                <div {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })}>
                  {(() => {
                    if (!connected) {
                      return (
                        <motion.button
                          onClick={openConnectModal}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Connect Wallet
                        </motion.button>
                      )
                    }

                    return (
                      <motion.button
                        onClick={openAccountModal}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                        <span className="text-white text-sm font-medium">
                          {account.displayName}
                        </span>
                      </motion.button>
                    )
                  })()}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  )
}

export default Header
