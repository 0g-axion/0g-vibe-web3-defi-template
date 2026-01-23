import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { useFrameworkReady } from './hooks/useFrameworkReady'
import { AnimatedBackground } from './components/ui/animated-background'
import { GlassCard } from './components/ui/glass-card'
import { GradientText } from './components/ui/gradient-text'
import { ConnectButton } from './components/web3/connect-button'
import { AccountInfo } from './components/web3/account-info'
import { SwapCard } from './components/web3/swap-card'
import { NetworkBadge } from './components/web3/network-badge'
import './App.css'

function App() {
  // CRITICAL: Signal WebContainer that the app is ready
  useFrameworkReady()

  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background with floating orbs */}
      <AnimatedBackground orbCount={4} showGrid />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-lg">0G</span>
            </div>
            <GradientText className="text-xl font-bold hidden sm:block">
              0G Swap
            </GradientText>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <NetworkBadge showName className="hidden sm:flex" />
            <ConnectButton showBalance showNetwork={false} />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-screen pt-24 pb-16 px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Swap tokens on{' '}
            <GradientText as="span" variant="default">
              0G Network
            </GradientText>
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-lg mx-auto">
            The fastest decentralized exchange on the AI-native blockchain
          </p>
        </motion.div>

        {/* Swap Card - THE MAIN FEATURE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SwapCard />
        </motion.div>

        {/* Account Info (when connected) */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="mt-6 p-4 w-full max-w-md">
              <h3 className="text-sm font-medium text-white/50 mb-3">
                Your Account
              </h3>
              <AccountInfo showCopy showExplorer />
            </GlassCard>
          </motion.div>
        )}

        {/* Faucet Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-white/40 text-sm"
        >
          Need testnet tokens?{' '}
          <a
            href="https://faucet.0g.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 underline underline-offset-2 transition-colors"
          >
            Get 0G from faucet
          </a>
        </motion.p>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 p-4 text-center"
      >
        <div className="flex items-center justify-center gap-4 text-white/30 text-xs">
          <span>Built on 0G Galileo Testnet</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Chain ID: 16602</span>
          <span className="hidden sm:inline">•</span>
          <a
            href="https://chainscan-galileo.0g.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/50 transition-colors hidden sm:inline"
          >
            Explorer
          </a>
        </div>
      </motion.footer>
    </div>
  )
}

export default App
