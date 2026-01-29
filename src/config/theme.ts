/**
 * Theme Configuration
 *
 * Centralized brand colors and design tokens.
 * Change these values to rebrand the entire app.
 *
 * Usage:
 * - Tailwind classes use these via tailwind.config.js
 * - RainbowKit theme uses BRAND_COLORS
 * - Components should use Tailwind classes (primary-*, secondary-*)
 */

/**
 * Brand Colors - Single source of truth
 * Change these to rebrand your app
 */
export const BRAND_COLORS = {
  // Primary brand color (violet/purple)
  primary: '#8B5CF6',
  primaryForeground: '#ffffff',

  // Secondary brand color (pink/fuchsia gradient accent)
  secondary: '#ec4899',
  secondaryForeground: '#ffffff',

  // Background colors
  background: {
    dark: '#0a0a0f',
    gradientStart: '#1a0533',
    gradientMid: '#2d1b4e',
    gradientEnd: '#0f172a',
  },

  // Status colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
} as const

/**
 * RainbowKit theme configuration
 * Used in main.tsx for wallet connection modal styling
 */
export const RAINBOWKIT_THEME = {
  accentColor: BRAND_COLORS.primary,
  accentColorForeground: BRAND_COLORS.primaryForeground,
  borderRadius: 'large' as const,
  fontStack: 'system' as const,
  overlayBlur: 'small' as const,
}

/**
 * Design tokens for consistent spacing and sizing
 */
export const DESIGN_TOKENS = {
  // Layout
  headerHeight: 64, // h-16 = 64px
  maxContentWidth: '7xl', // max-w-7xl
  containerPadding: 16, // px-4 = 16px

  // Timing (ms)
  transitionFast: 150,
  transitionNormal: 200,
  transitionSlow: 300,

  // Refresh intervals (ms)
  balanceRefresh: 15000, // 15 seconds
  priceRefresh: 30000, // 30 seconds
  poolRefresh: 60000, // 1 minute

  // Border radius
  radiusSmall: 8,
  radiusMedium: 12,
  radiusLarge: 16,
  radiusXLarge: 24,
} as const

/**
 * Animation durations for animated background
 */
export const ANIMATION_CONFIG = {
  orbDuration: { min: 15, max: 25 }, // seconds
  orbDelay: { max: 5 }, // seconds
  orbCount: 5,
} as const

export type BrandColors = typeof BRAND_COLORS
export type DesignTokens = typeof DESIGN_TOKENS
