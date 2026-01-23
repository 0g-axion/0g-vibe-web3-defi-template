import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { createPublicClient, createWalletClient, custom, http, formatEther, type PublicClient, type WalletClient, type Address } from 'viem'
import { zgGalileo } from '@/config/chains'

interface Web3State {
  address: Address | null
  isConnected: boolean
  isConnecting: boolean
  chain: typeof zgGalileo | null
  balance: string | null
  publicClient: PublicClient
  walletClient: WalletClient | null
}

interface Web3Context extends Web3State {
  connect: () => Promise<void>
  disconnect: () => void
  hasWallet: boolean
}

const Web3Context = createContext<Web3Context | null>(null)

// Create public client (always available, for read operations)
const publicClient = createPublicClient({
  chain: zgGalileo,
  transport: http(zgGalileo.rpcUrls.default.http[0]),
})

export function Web3Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<Web3State, 'publicClient'>>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chain: null,
    balance: null,
    walletClient: null,
  })

  // Check if wallet is available (browser extension)
  const hasWallet = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'

  // Fetch balance when address changes
  useEffect(() => {
    if (!state.address) {
      setState(s => ({ ...s, balance: null }))
      return
    }

    const fetchBalance = async () => {
      try {
        const balance = await publicClient.getBalance({ address: state.address! })
        setState(s => ({ ...s, balance: formatEther(balance) }))
      } catch (error) {
        console.error('Failed to fetch balance:', error)
      }
    }

    fetchBalance()
    // Refresh balance every 15 seconds
    const interval = setInterval(fetchBalance, 15000)
    return () => clearInterval(interval)
  }, [state.address])

  // Listen for account changes
  useEffect(() => {
    if (!hasWallet) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Disconnected
        setState({
          address: null,
          isConnected: false,
          isConnecting: false,
          chain: null,
          balance: null,
          walletClient: null,
        })
      } else {
        setState(s => ({
          ...s,
          address: accounts[0] as Address,
          isConnected: true,
        }))
      }
    }

    const handleChainChanged = () => {
      // Reload on chain change for simplicity
      window.location.reload()
    }

    window.ethereum?.on('accountsChanged', handleAccountsChanged)
    window.ethereum?.on('chainChanged', handleChainChanged)

    // Check if already connected
    window.ethereum?.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length > 0) {
        const walletClient = createWalletClient({
          chain: zgGalileo,
          transport: custom(window.ethereum!),
        })
        setState({
          address: accounts[0] as Address,
          isConnected: true,
          isConnecting: false,
          chain: zgGalileo,
          balance: null,
          walletClient,
        })
      }
    })

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
    }
  }, [hasWallet])

  const connect = useCallback(async () => {
    if (!hasWallet) {
      console.error('No wallet available')
      return
    }

    setState(s => ({ ...s, isConnecting: true }))

    try {
      // Request accounts
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      }) as string[]

      if (accounts.length === 0) {
        throw new Error('No accounts returned')
      }

      // Try to switch to 0G Galileo network
      try {
        await window.ethereum!.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${zgGalileo.id.toString(16)}` }],
        })
      } catch (switchError: unknown) {
        // If chain doesn't exist, add it
        if ((switchError as { code?: number })?.code === 4902) {
          await window.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${zgGalileo.id.toString(16)}`,
              chainName: zgGalileo.name,
              nativeCurrency: zgGalileo.nativeCurrency,
              rpcUrls: zgGalileo.rpcUrls.default.http,
              blockExplorerUrls: [zgGalileo.blockExplorers?.default?.url],
            }],
          })
        }
      }

      const walletClient = createWalletClient({
        chain: zgGalileo,
        transport: custom(window.ethereum!),
      })

      setState({
        address: accounts[0] as Address,
        isConnected: true,
        isConnecting: false,
        chain: zgGalileo,
        balance: null,
        walletClient,
      })
    } catch (error) {
      console.error('Failed to connect:', error)
      setState(s => ({ ...s, isConnecting: false }))
    }
  }, [hasWallet])

  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      isConnecting: false,
      chain: null,
      balance: null,
      walletClient: null,
    })
  }, [])

  const value: Web3Context = {
    ...state,
    publicClient,
    connect,
    disconnect,
    hasWallet,
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider')
  }
  return context
}

// Type declaration for window.ethereum
// Note: Using 'any' to avoid conflicts with wagmi's WindowProvider type
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any
  }
}
