import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChainId } from 'wagmi'
import { useFrameworkReady } from './hooks/useFrameworkReady'
import { AnimatedBackground } from './components/ui/animated-background'
import { Header } from './components/web3/header'
import { SwapPanel } from './components/web3/swap-panel'
import { PoolsPanel } from './components/web3/pools-panel'
import { ChartPanel } from './components/web3/chart-panel'
import { PortfolioPanel } from './components/web3/portfolio-panel'
import { getChainMetadata } from './config/chains'
import { useFeatures } from './providers/feature-provider'
import './App.css'

type Tab = 'swap' | 'pools' | 'chart' | 'portfolio'

function App() {
  useFrameworkReady()
  const [activeTab, setActiveTab] = useState<Tab>('swap')
  const chainId = useChainId()
  const { explorerUrl, faucetUrl } = getChainMetadata(chainId)
  const features = useFeatures()

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f]">
      {/* Premium gradient background */}
      {features.ui.animatedBackground && (
        <AnimatedBackground orbCount={3} showGrid={false} intensity={0.8} />
      )}

      {/* Subtle noise texture overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-[1]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
      />

      {/* Header */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="relative z-10 pt-20 pb-8 px-4 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'swap' && features.swap.enabled && (
              <motion.div
                key="swap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col lg:flex-row gap-6 items-start justify-center"
              >
                {/* Swap Widget - Center Focus */}
                <div className="w-full max-w-[480px] mx-auto lg:mx-0">
                  <SwapPanel />
                </div>

                {/* Chart - Side Panel on Desktop (config-driven) */}
                {features.swap.showChart && features.chart.enabled && (
                  <div className="hidden lg:block w-full max-w-[600px]">
                    <ChartPanel />
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'pools' && features.pools.enabled && (
              <motion.div
                key="pools"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <PoolsPanel />
              </motion.div>
            )}

            {activeTab === 'chart' && features.chart.enabled && (
              <motion.div
                key="chart"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto"
              >
                <ChartPanel fullWidth />
              </motion.div>
            )}

            {activeTab === 'portfolio' && features.portfolio.enabled && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <PortfolioPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>0G Network</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://docs.0g.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">Docs</a>
            {features.ui.showFaucetLink && (
              <a href={faucetUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">Faucet</a>
            )}
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">Explorer</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
