import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import { GlassButton } from '@/components/ui/glass-button'
import { cn } from '@/lib/utils'
import { Wallet, ChevronDown } from 'lucide-react'

export interface ConnectButtonProps {
  /** Show balance */
  showBalance?: boolean
  /** Show network icon */
  showNetwork?: boolean
  className?: string
}

/**
 * ConnectButton Component
 *
 * Custom styled RainbowKit connect button with glassmorphism design.
 *
 * @example
 * <ConnectButton showBalance showNetwork />
 */
export function ConnectButton({
  showBalance = true,
  showNetwork = true,
  className,
}: ConnectButtonProps) {
  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            className={cn(
              'flex items-center gap-2',
              !ready && 'opacity-0 pointer-events-none',
              className
            )}
            aria-hidden={!ready}
          >
            {(() => {
              if (!connected) {
                return (
                  <GlassButton
                    variant="primary"
                    onClick={openConnectModal}
                    icon={<Wallet className="w-4 h-4" />}
                  >
                    Connect Wallet
                  </GlassButton>
                )
              }

              if (chain.unsupported) {
                return (
                  <GlassButton
                    variant="default"
                    onClick={openChainModal}
                    className="!border-accent-red/50 !text-accent-red"
                  >
                    Wrong Network
                  </GlassButton>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  {/* Network Button */}
                  {showNetwork && (
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={openChainModal}
                      className="hidden sm:flex"
                    >
                      {chain.hasIcon && chain.iconUrl && (
                        <img
                          src={chain.iconUrl}
                          alt={chain.name ?? 'Chain'}
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <span className="hidden md:inline">{chain.name}</span>
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </GlassButton>
                  )}

                  {/* Account Button */}
                  <GlassButton
                    variant="default"
                    onClick={openAccountModal}
                    className="gap-2"
                  >
                    {showBalance && account.displayBalance && (
                      <span className="hidden sm:inline font-mono">
                        {account.displayBalance}
                      </span>
                    )}
                    <span className="font-mono">{account.displayName}</span>
                  </GlassButton>
                </div>
              )
            })()}
          </div>
        )
      }}
    </RainbowConnectButton.Custom>
  )
}

export default ConnectButton
