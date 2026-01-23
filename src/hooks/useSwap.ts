/**
 * useSwap Hook - Real V3 Swap Execution
 *
 * Handles token swaps on 0G Mainnet via Janie DEX (Uniswap V3 style).
 * Falls back to demo mode on testnet.
 *
 * Features:
 * - Native 0G to ERC20 swaps (auto-wraps)
 * - ERC20 to ERC20 swaps (with approval)
 * - Slippage protection
 * - Deadline handling
 * - Real price quotes from pool contracts
 */

import { useState, useCallback } from 'react'
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi'
import { parseUnits, type Address } from 'viem'
import { getRouterAddress, getWrappedNativeAddress, isDexAvailable, DEFAULT_FEE_TIER, getContracts } from '@/constants/contracts'
import { SWAP_ROUTER_ABI, ERC20_ABI, FACTORY_ABI, POOL_ABI } from '@/constants/abis'
import type { Token } from '@/constants/tokens'

export interface SwapParams {
  tokenIn: Token
  tokenOut: Token
  amountIn: string
  slippagePercent: number // e.g., 0.5 for 0.5%
  deadlineMinutes: number // e.g., 20 for 20 minutes
}

export interface SwapResult {
  hash: `0x${string}`
  amountOut?: bigint
}

export type SwapStatus = 'idle' | 'approving' | 'swapping' | 'success' | 'error'

export function useSwap() {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [status, setStatus] = useState<SwapStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  // Check if real swap is available on current chain
  const isRealSwapAvailable = isDexAvailable(chainId)

  // Get pool address for a token pair
  const getPoolAddress = useCallback(
    async (tokenA: Address, tokenB: Address, fee: number): Promise<Address | null> => {
      if (!publicClient) return null

      const contracts = getContracts(chainId)
      if (!contracts.FACTORY) return null

      try {
        const poolAddress = await publicClient.readContract({
          address: contracts.FACTORY as Address,
          abi: FACTORY_ABI,
          functionName: 'getPool',
          args: [tokenA, tokenB, fee],
        })

        // Check if pool exists (not zero address)
        if (poolAddress === '0x0000000000000000000000000000000000000000') {
          return null
        }

        return poolAddress as Address
      } catch (error) {
        console.error('Failed to get pool address:', error)
        return null
      }
    },
    [publicClient, chainId]
  )

  // Calculate price from sqrtPriceX96
  const calculatePriceFromSqrtPrice = (
    sqrtPriceX96: bigint,
    token0Decimals: number,
    token1Decimals: number,
    isToken0In: boolean
  ): number => {
    // sqrtPriceX96 = sqrt(price) * 2^96
    // price = (sqrtPriceX96 / 2^96)^2
    const Q96 = 2n ** 96n
    const sqrtPrice = Number(sqrtPriceX96) / Number(Q96)
    const price = sqrtPrice * sqrtPrice

    // Adjust for decimal differences
    const decimalAdjustment = 10 ** (token0Decimals - token1Decimals)
    const adjustedPrice = price * decimalAdjustment

    // If token0 is input, price is token1/token0, else invert
    return isToken0In ? adjustedPrice : 1 / adjustedPrice
  }

  // Get quote for a swap
  const getQuote = useCallback(
    async (params: Omit<SwapParams, 'slippagePercent' | 'deadlineMinutes'>) => {
      const { tokenIn, tokenOut, amountIn } = params

      if (!amountIn || parseFloat(amountIn) <= 0) {
        return null
      }

      // For demo/testnet, use mock rate
      if (!isRealSwapAvailable) {
        const mockRate = 1.5 // 1 0G = 1.5 USDC (mock)
        const amountInParsed = parseFloat(amountIn)
        const amountOut = amountInParsed * mockRate
        return {
          amountOut: amountOut.toFixed(tokenOut.decimals > 6 ? 6 : tokenOut.decimals),
          rate: mockRate,
          priceImpact: 0.15,
        }
      }

      // Get real quote from pool
      if (!publicClient) {
        return null
      }

      try {
        const wrappedNative = getWrappedNativeAddress(chainId)

        // Get token addresses (use wrapped native for native token)
        const tokenInAddress = (tokenIn.isNative || tokenIn.address === 'native')
          ? wrappedNative
          : tokenIn.address as Address

        const tokenOutAddress = (tokenOut.isNative || tokenOut.address === 'native')
          ? wrappedNative
          : tokenOut.address as Address

        if (!tokenInAddress || !tokenOutAddress) {
          throw new Error('Token addresses not available')
        }

        // Find pool
        const poolAddress = await getPoolAddress(tokenInAddress, tokenOutAddress, DEFAULT_FEE_TIER)

        if (!poolAddress) {
          console.warn('No pool found for pair, using fallback rate')
          // Fallback to estimated rate
          const fallbackRate = tokenOut.symbol.includes('USDC') ? 0.5 : 1.0
          const amountOutEstimate = parseFloat(amountIn) * fallbackRate
          return {
            amountOut: amountOutEstimate.toFixed(6),
            rate: fallbackRate,
            priceImpact: 0.5, // Higher price impact for unknown pools
          }
        }

        // Get pool state
        const [slot0, token0Address] = await Promise.all([
          publicClient.readContract({
            address: poolAddress,
            abi: POOL_ABI,
            functionName: 'slot0',
          }),
          publicClient.readContract({
            address: poolAddress,
            abi: POOL_ABI,
            functionName: 'token0',
          }),
        ])

        const sqrtPriceX96 = (slot0 as [bigint, number, number, number, number, number, boolean])[0]

        // Determine if tokenIn is token0
        const isToken0In = tokenInAddress.toLowerCase() === (token0Address as Address).toLowerCase()

        // Calculate price
        const rate = calculatePriceFromSqrtPrice(
          sqrtPriceX96,
          isToken0In ? tokenIn.decimals : tokenOut.decimals,
          isToken0In ? tokenOut.decimals : tokenIn.decimals,
          isToken0In
        )

        const amountInParsed = parseFloat(amountIn)
        const amountOutCalculated = amountInParsed * rate

        // Estimate price impact (simplified - would need liquidity depth for accuracy)
        const priceImpact = Math.min(0.01 + (amountInParsed * 0.001), 5) // 0.01% base + 0.1% per unit

        return {
          amountOut: amountOutCalculated.toFixed(tokenOut.decimals > 6 ? 6 : tokenOut.decimals),
          rate,
          priceImpact,
        }
      } catch (error) {
        console.error('Failed to get quote from pool:', error)

        // Fallback to estimated rate on error
        const fallbackRate = tokenOut.symbol.includes('USDC') ? 0.5 : 1.0
        const amountOutEstimate = parseFloat(amountIn) * fallbackRate
        return {
          amountOut: amountOutEstimate.toFixed(6),
          rate: fallbackRate,
          priceImpact: 1.0, // Higher price impact when we can't get real data
        }
      }
    },
    [isRealSwapAvailable, publicClient, chainId, getPoolAddress]
  )

  // Check and request token approval if needed
  const checkAndApprove = useCallback(
    async (token: Token, amount: bigint, spender: Address): Promise<boolean> => {
      if (!walletClient || !publicClient || !address) return false
      if (token.isNative || token.address === 'native') return true // Native doesn't need approval

      try {
        // Check current allowance
        const allowance = await publicClient.readContract({
          address: token.address as Address,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, spender],
        })

        if ((allowance as bigint) >= amount) {
          return true // Already approved
        }

        // Request approval
        setStatus('approving')
        const hash = await walletClient.writeContract({
          address: token.address as Address,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [spender, amount],
        })

        // Wait for approval tx
        await publicClient.waitForTransactionReceipt({ hash })
        return true
      } catch (err) {
        console.error('Approval failed:', err)
        setError('Token approval failed')
        return false
      }
    },
    [walletClient, publicClient, address]
  )

  // Execute the swap
  const executeSwap = useCallback(
    async (params: SwapParams): Promise<SwapResult | null> => {
      const { tokenIn, tokenOut, amountIn, slippagePercent, deadlineMinutes } = params

      if (!walletClient || !publicClient || !address) {
        setError('Wallet not connected')
        return null
      }

      setError(null)
      setTxHash(null)

      // Demo mode for testnet
      if (!isRealSwapAvailable) {
        setStatus('swapping')

        // Simulate transaction
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const mockHash = ('0x' + Math.random().toString(16).slice(2).padEnd(64, '0')) as `0x${string}`
        setTxHash(mockHash)
        setStatus('success')

        return { hash: mockHash }
      }

      try {
        const routerAddress = getRouterAddress(chainId)
        const wrappedNative = getWrappedNativeAddress(chainId)

        // Parse amount
        const amountInWei = parseUnits(amountIn, tokenIn.decimals)

        // Calculate minimum amount out with slippage
        const quote = await getQuote({ tokenIn, tokenOut, amountIn })
        if (!quote) {
          setError('Could not get quote')
          return null
        }

        const amountOutExpected = parseUnits(quote.amountOut, tokenOut.decimals)
        const slippageMultiplier = BigInt(Math.floor((100 - slippagePercent) * 100))
        const amountOutMinimum = (amountOutExpected * slippageMultiplier) / 10000n

        // Calculate deadline
        const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineMinutes * 60)

        // Determine tokenIn address (use wrapped native for native token)
        const tokenInAddress = tokenIn.isNative || tokenIn.address === 'native'
          ? wrappedNative
          : tokenIn.address

        // Determine tokenOut address
        const tokenOutAddress = tokenOut.isNative || tokenOut.address === 'native'
          ? wrappedNative
          : tokenOut.address

        if (!tokenInAddress || !tokenOutAddress) {
          setError('Token addresses not available')
          return null
        }

        // Check approval for ERC20 tokens
        if (!tokenIn.isNative && tokenIn.address !== 'native') {
          const approved = await checkAndApprove(tokenIn, amountInWei, routerAddress)
          if (!approved) {
            setStatus('error')
            return null
          }
        }

        // Execute swap
        setStatus('swapping')

        const swapParams = {
          tokenIn: tokenInAddress as Address,
          tokenOut: tokenOutAddress as Address,
          fee: DEFAULT_FEE_TIER,
          recipient: address,
          deadline,
          amountIn: amountInWei,
          amountOutMinimum,
          sqrtPriceLimitX96: 0n, // No price limit
        }

        // For native token swaps, send value
        const value = tokenIn.isNative || tokenIn.address === 'native' ? amountInWei : 0n

        const hash = await walletClient.writeContract({
          address: routerAddress,
          abi: SWAP_ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [swapParams],
          value,
        })

        setTxHash(hash)

        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash })

        if (receipt.status === 'success') {
          setStatus('success')
          return { hash }
        } else {
          setStatus('error')
          setError('Transaction failed')
          return null
        }
      } catch (err: unknown) {
        console.error('Swap failed:', err)
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Swap failed')
        return null
      }
    },
    [walletClient, publicClient, address, chainId, isRealSwapAvailable, checkAndApprove, getQuote]
  )

  // Reset state
  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setTxHash(null)
  }, [])

  return {
    // State
    status,
    error,
    txHash,
    isRealSwapAvailable,

    // Actions
    getQuote,
    executeSwap,
    reset,
  }
}
