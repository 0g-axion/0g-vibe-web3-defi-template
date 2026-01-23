import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for conditional class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format an Ethereum address to a shortened form
 * Example: 0x1234...5678
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Format a token balance with proper decimals
 * @param balance - The balance in smallest unit (wei)
 * @param decimals - Token decimals (default 18)
 * @param displayDecimals - Number of decimals to display (default 4)
 */
export function formatBalance(
  balance: bigint | string | number,
  decimals = 18,
  displayDecimals = 4
): string {
  const value = typeof balance === 'bigint' ? balance : BigInt(balance || 0)
  const divisor = BigInt(10 ** decimals)
  const integerPart = value / divisor
  const fractionalPart = value % divisor

  // Convert fractional part to string with leading zeros
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  const truncatedFractional = fractionalStr.slice(0, displayDecimals)

  // Remove trailing zeros
  const cleanFractional = truncatedFractional.replace(/0+$/, '')

  if (cleanFractional === '') {
    return integerPart.toString()
  }

  return `${integerPart}.${cleanFractional}`
}

/**
 * Format a number with commas for thousands
 */
export function formatNumber(num: number | string, decimals = 2): string {
  const value = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(value)) return '0'

  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format USD value
 */
export function formatUSD(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '$0.00'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Parse a user input amount to bigint with decimals
 */
export function parseAmount(amount: string, decimals = 18): bigint {
  if (!amount || amount === '0' || amount === '') return BigInt(0)

  // Remove any non-numeric characters except decimal point
  const cleanAmount = amount.replace(/[^0-9.]/g, '')
  const [integer, fraction = ''] = cleanAmount.split('.')

  // Pad or truncate fractional part to match decimals
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)

  return BigInt(integer + paddedFraction)
}

/**
 * Check if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Delay execution for a specified time
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate a block explorer URL for a transaction
 */
export function getExplorerUrl(
  hash: string,
  type: 'tx' | 'address' | 'block' = 'tx',
  explorerUrl = 'https://chainscan-galileo.0g.ai'
): string {
  return `${explorerUrl}/${type}/${hash}`
}
