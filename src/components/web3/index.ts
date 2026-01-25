/**
 * Web3 Components Barrel Export
 *
 * Components organized by type:
 * - Primitives: Reusable building blocks (token-*, connect-*, network-*, etc.)
 * - Feature Panels: Main feature UIs with -panel suffix
 * - Layout: Header, Footer, etc.
 */

// ─── Primitives (reusable building blocks) ───
export { ConnectButton, type ConnectButtonProps } from './connect-button'
export { AccountInfo, type AccountInfoProps } from './account-info'
export { NetworkBadge, type NetworkBadgeProps } from './network-badge'
export { TokenIcon, TokenIconPair, type TokenIconProps } from './token-icon'
export { TokenBalance, type TokenBalanceProps } from './token-balance'
export { TokenBalanceList, type TokenBalanceListProps } from './token-balance-list'
export { TokenInput, type TokenInputProps } from './token-input'
export { TokenInputField } from './token-input-field'
export { TokenSelect, type TokenSelectProps } from './token-select'
export { TokenSelectModal, type TokenSelectModalProps } from './token-select-modal'
export { SwapSettings, type SwapSettingsProps } from './swap-settings'
export { SwapSettingsPanel } from './swap-settings-panel'
export { TxStatusModal, type TxStatusModalProps, type TxStatus } from './tx-status-modal'
export { ExplorerLink, TxLink, AddressLink, type ExplorerLinkProps } from './explorer-link'

// ─── Feature Panels (-panel suffix) ───
export { SwapPanel } from './swap-panel'
export { PoolsPanel } from './pools-panel'
export { ChartPanel } from './chart-panel'
export { PortfolioPanel } from './portfolio-panel'

// ─── Layout ───
export { Header } from './header'

// ─── Deprecated (kept for reference) ───
export { SwapCard, type SwapCardProps } from './swap-card'
