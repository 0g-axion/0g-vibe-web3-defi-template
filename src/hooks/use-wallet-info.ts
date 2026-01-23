import { useAccount, useBalance, useChainId } from "wagmi"
import { zgMainnet, zgTestnet, CHAIN_IDS } from "@/config/chains"

export function useWalletInfo() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balanceData } = useBalance({
    address: address,
  })

  // Get current chain info (0G chains only)
  const chains = [zgMainnet, zgTestnet]
  const currentChain = chains.find((chain) => chain.id === chainId) || zgTestnet

  return {
    address: address || null,
    isConnected,
    chainId,
    chainName: currentChain.name || "0G Network",
    balance: balanceData ? balanceData.formatted : "0",
    symbol: balanceData ? balanceData.symbol : "0G",
    chains,
    isMainnet: chainId === CHAIN_IDS.MAINNET,
    isTestnet: chainId === CHAIN_IDS.TESTNET,
  }
}
