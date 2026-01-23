import { useMemo } from 'react'
import { TOKENS, type Token } from '@/constants/tokens'

export interface UseTokenListOptions {
  /** Tokens to exclude by symbol */
  exclude?: string[]
  /** Only include specific tokens by symbol */
  include?: string[]
  /** Custom token list (overrides default) */
  customTokens?: Token[]
}

export interface UseTokenListResult {
  /** Filtered token list */
  tokens: Token[]
  /** Search/filter tokens */
  searchTokens: (query: string) => Token[]
  /** Get token by symbol */
  getTokenBySymbol: (symbol: string) => Token | undefined
  /** Get token by address */
  getTokenByAddress: (address: string) => Token | undefined
  /** Check if token is in list */
  hasToken: (symbolOrAddress: string) => boolean
}

/**
 * useTokenList Hook
 *
 * Provides access to the token list with filtering and search capabilities.
 *
 * @example
 * const { tokens, searchTokens } = useTokenList({ exclude: ['PAI'] })
 * const results = searchTokens('usdc')
 */
export function useTokenList({
  exclude = [],
  include,
  customTokens,
}: UseTokenListOptions = {}): UseTokenListResult {
  const baseTokens = customTokens ?? TOKENS

  const tokens = useMemo(() => {
    let result = baseTokens

    // Filter by include list
    if (include && include.length > 0) {
      result = result.filter((t) =>
        include.map((s) => s.toLowerCase()).includes(t.symbol.toLowerCase())
      )
    }

    // Filter by exclude list
    if (exclude.length > 0) {
      result = result.filter(
        (t) =>
          !exclude.map((s) => s.toLowerCase()).includes(t.symbol.toLowerCase())
      )
    }

    return result
  }, [baseTokens, exclude, include])

  const searchTokens = (query: string): Token[] => {
    if (!query) return tokens

    const lowerQuery = query.toLowerCase()
    return tokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(lowerQuery) ||
        t.name.toLowerCase().includes(lowerQuery)
    )
  }

  const getTokenBySymbol = (symbol: string): Token | undefined => {
    return tokens.find(
      (t) => t.symbol.toLowerCase() === symbol.toLowerCase()
    )
  }

  const getTokenByAddress = (address: string): Token | undefined => {
    return tokens.find(
      (t) =>
        t.address !== 'native' &&
        t.address.toLowerCase() === address.toLowerCase()
    )
  }

  const hasToken = (symbolOrAddress: string): boolean => {
    return (
      !!getTokenBySymbol(symbolOrAddress) ||
      !!getTokenByAddress(symbolOrAddress)
    )
  }

  return {
    tokens,
    searchTokens,
    getTokenBySymbol,
    getTokenByAddress,
    hasToken,
  }
}

export default useTokenList
