# Janie V3 Subgraph (Goldsky)

## API Endpoint
```
https://api.goldsky.com/api/public/YOUR_GOLDSKY_PROJECT_ID/subgraphs/jaine-v3-goldsky/0.0.2/gn
```

**Deployment ID**: `QmQujXRdmpUYtKFaPws19zJbPBoPwGT4V9zWvCNpvr6rAQ`

## Factory Stats
- **Address**: `0x9bdca5798e52e592a08e3b34d3f18eef76af7ef4`
- **Pool Count**: 74
- **Total Volume USD**: $25.8M+
- **Total TVL USD**: $1.3M+

## Top Pools by TVL

| Pool | Pair | Fee | TVL | Volume |
|------|------|-----|-----|--------|
| `0xa9e824eddb9677fb2189ab9c439238a83695c091` | W0G/USDC.e | 0.3% | $522K | $10.6M |
| `0x2bd550e4a9ab4fcb886f64475664a705a00b8481` | USDC.e/cbBTC | 0.3% | $409K | $2.5M |
| `0x411e76f26c684580edfd0867be181bba5a3a98a5` | USDC.e/WETH | 0.3% | $344K | $4.9M |
| `0x18bad16195276c998e7c4637857532730c651d76` | W0G/st0G | 0.3% | $29K | $830K |
| `0x224d0891d63ca83e6dd98b4653c27034503a5e76` | W0G/PAI | 0.3% | $24K | $6.9M |

## Top Tokens

| Token | Symbol | Address | TVL |
|-------|--------|---------|-----|
| USDC.e | Bridged USDC | `0x1f3aa82227281ca364bfb3d253b0f1af1da6473e` | $644K |
| W0G | Wrapped 0G | `0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c` | $299K |
| cbBTC | Coinbase Wrapped BTC | `0xa5613ac7f1e83a68719b1398c8f6aaa25581db82` | $189K |
| WETH | Wrapped ETH | `0x564770837ef8bbf077cfe54e5f6106538c815b22` | $181K |
| st0G | Gimo Staked 0G | `0x7bbc63d01ca42491c3e084c941c3e86e55951404` | $5.6K |

## Available Queries

### Factory Stats
```graphql
{
  factories(first: 1) {
    id
    poolCount
    txCount
    totalVolumeUSD
    totalValueLockedUSD
  }
}
```

### Pools with Token Info
```graphql
{
  pools(first: 20, orderBy: totalValueLockedUSD, orderDirection: desc) {
    id
    token0 { id symbol name decimals }
    token1 { id symbol name decimals }
    feeTier
    liquidity
    sqrtPrice
    totalValueLockedUSD
    volumeUSD
    feesUSD
    txCount
  }
}
```

### Tokens
```graphql
{
  tokens(first: 20, orderBy: totalValueLockedUSD, orderDirection: desc) {
    id
    symbol
    name
    decimals
    totalValueLockedUSD
    volumeUSD
    txCount
    derivedETH  # Price in terms of W0G
  }
}
```

### Pool Daily Data (Price History)
```graphql
{
  poolDayDatas(
    first: 30
    orderBy: date
    orderDirection: desc
    where: { pool: "0xa9e824eddb9677fb2189ab9c439238a83695c091" }
  ) {
    date
    volumeUSD
    tvlUSD
    feesUSD
    open
    high
    low
    close
  }
}
```

### Pool Hourly Data
```graphql
{
  poolHourDatas(
    first: 48
    orderBy: periodStartUnix
    orderDirection: desc
    where: { pool: "0xa9e824eddb9677fb2189ab9c439238a83695c091" }
  ) {
    periodStartUnix
    volumeUSD
    tvlUSD
    open
    high
    low
    close
  }
}
```

## Price Calculation

The `open`, `high`, `low`, `close` fields represent the price of token1 in terms of token0.

For W0G/USDC.e pool:
- Price ~0.89 means 1 W0G = 0.89 USDC.e

## Notes

- Data updates in real-time as swaps occur
- `derivedETH` on tokens = price in terms of W0G (native)
- Pool fee tiers: 100 (0.01%), 500 (0.05%), 3000 (0.3%), 10000 (1%)

---

## Config-Driven Architecture

The subgraph integration is fully config-driven. All settings are in `src/config/subgraph.ts`.

### Switching to a Different AMM

To switch to a different AMM (e.g., from Janie to another DEX), update these in `src/config/subgraph.ts`:

1. **SUBGRAPH_URLS** - Update the subgraph URL for your chain:
   ```typescript
   export const SUBGRAPH_URLS: Record<number, string | null> = {
     [CHAIN_IDS.MAINNET]: 'https://your-new-subgraph-url/graphql',
     [CHAIN_IDS.TESTNET]: null,
   }
   ```

2. **DEFAULT_CHART_POOLS** - Set the default pool for price charts:
   ```typescript
   export const DEFAULT_CHART_POOLS: Record<number, string | null> = {
     [CHAIN_IDS.MAINNET]: '0x-your-main-pool-address',
     [CHAIN_IDS.TESTNET]: null,
   }
   ```

3. **FEATURED_POOLS** - Update featured pools for quick access:
   ```typescript
   export const FEATURED_POOLS: Record<number, FeaturedPool[]> = {
     [CHAIN_IDS.MAINNET]: [
       {
         id: 'main-pair',
         address: '0x...',
         name: 'TOKEN/USDC',
         description: 'Main trading pair',
       },
       // ... more pools
     ],
   }
   ```

4. **AMM_CONFIG** - Update AMM metadata (optional, for branding):
   ```typescript
   export const AMM_CONFIG: Record<number, AMMConfig | null> = {
     [CHAIN_IDS.MAINNET]: {
       name: 'Your DEX Name',
       protocol: 'uniswap-v3', // or 'uniswap-v2', 'custom'
       website: 'https://your-dex.com',
     },
   }
   ```

### Important Requirements

The subgraph must follow the **Uniswap V3 schema** with these entities:
- `factories` - Protocol-level stats
- `pools` - Liquidity pools with token info
- `tokens` - Token data with pricing
- `poolDayDatas` - Daily OHLC data
- `poolHourDatas` - Hourly OHLC data

If your subgraph uses a different schema, you'll need to modify `src/services/subgraph.ts` to match.

### Files Involved

| File | Purpose |
|------|---------|
| `src/config/subgraph.ts` | **Config** - URLs, default pools, featured pools |
| `src/services/subgraph.ts` | GraphQL queries (modify if schema differs) |
| `src/hooks/useChartData.ts` | Chart data hook (uses config) |
| `src/hooks/useSubgraphPools.ts` | Pools data hook (uses config) |
| `src/components/web3/chart-panel.tsx` | Chart UI (uses hooks) |
| `src/components/web3/pools-panel.tsx` | Pools UI (uses hooks) |
