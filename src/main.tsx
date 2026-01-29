import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from './config/wagmi'
import { FeatureProvider } from './providers/feature-provider'
import { RAINBOWKIT_THEME, DESIGN_TOKENS } from './config/theme'
import App from './App'
import './index.css'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DESIGN_TOKENS.priceRefresh, // Use centralized config
      refetchOnWindowFocus: false,
    },
  },
})

// Custom RainbowKit theme - uses centralized brand colors from config/theme.ts
const customTheme = darkTheme(RAINBOWKIT_THEME)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={customTheme}
          modalSize="compact"
          appInfo={{
            appName: '0G Swap',
            learnMoreUrl: 'https://0g.ai',
          }}
        >
          <FeatureProvider>
            <App />
          </FeatureProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)
