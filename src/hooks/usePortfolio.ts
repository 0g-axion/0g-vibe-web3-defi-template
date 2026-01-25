/**
 * usePortfolio Hook
 *
 * Fetches user's token balances and calculates portfolio value.
 * Works on any chain (shows actual token balances).
 */

import { useChainId, useAccount, useBalance, useReadContracts } from 'wagmi'
import { formatUnits } from 'viem'
import { getTokens, type Token } from '@/constants/tokens'
import { ERC20_ABI } from '@/constants/abis'

export interface TokenHolding {
  token: Token
  balance: bigint
  formattedBalance: string
  usdValue: number // Estimated USD value (mock prices for now)
}

/**
 * usePortfolio Hook
 *
 * @returns User's token holdings with balances
 */
export function usePortfolio() {
  const chainId = useChainId()
  const { address, isConnected } = useAccount()

  // Get all tokens for current chain
  const tokens = getTokens(chainId)

  // Fetch native token balance
  const {
    data: nativeBalance,
    isLoading: nativeLoading,
  } = useBalance({
    address,
    query: { enabled: isConnected && !!address },
  })

  // Prepare ERC20 balance calls
  const erc20Tokens = tokens.filter(t => !t.isNative && t.address !== 'native')

  const {
    data: erc20Balances,
    isLoading: erc20Loading,
  } = useReadContracts({
    contracts: erc20Tokens.map(token => ({
      address: token.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
    })),
    query: { enabled: isConnected && !!address && erc20Tokens.length > 0 },
  })

  // Build holdings array
  const holdings: TokenHolding[] = []

  // Add native token holding
  const nativeToken = tokens.find(t => t.isNative)
  if (nativeToken && nativeBalance) {
    const balance = nativeBalance.value
    const formattedBalance = formatUnits(balance, nativeToken.decimals)
    // Mock USD price - in production would come from price oracle
    const mockPrice = nativeToken.symbol === '0G' ? 0.5 : 1
    holdings.push({
      token: nativeToken,
      balance,
      formattedBalance: parseFloat(formattedBalance).toFixed(4),
      usdValue: parseFloat(formattedBalance) * mockPrice,
    })
  }

  // Add ERC20 token holdings
  if (erc20Balances) {
    erc20Tokens.forEach((token, index) => {
      const result = erc20Balances[index]
      if (result.status === 'success' && result.result) {
        const balance = result.result as bigint
        if (balance > 0n) {
          const formattedBalance = formatUnits(balance, token.decimals)
          // Mock USD prices
          let mockPrice = 1
          if (token.symbol.toLowerCase().includes('usdc')) mockPrice = 1
          else if (token.symbol === 'W0G') mockPrice = 0.5
          else if (token.symbol.toLowerCase().includes('eth')) mockPrice = 2500
          else mockPrice = 0.1

          holdings.push({
            token,
            balance,
            formattedBalance: parseFloat(formattedBalance).toFixed(4),
            usdValue: parseFloat(formattedBalance) * mockPrice,
          })
        }
      }
    })
  }

  // Sort by USD value descending
  holdings.sort((a, b) => b.usdValue - a.usdValue)

  // Calculate total portfolio value
  const totalValue = holdings.reduce((sum, h) => sum + h.usdValue, 0)

  return {
    holdings,
    totalValue,
    isLoading: nativeLoading || erc20Loading,
    isConnected,
    hasHoldings: holdings.length > 0,
  }
}

export default usePortfolio
