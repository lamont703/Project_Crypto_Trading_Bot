# Data Model

## Overview

The Crypto Trading Bot uses a comprehensive data model to represent users, trading strategies, market data, and portfolio information. All data is stored client-side using localStorage and sample data files.

## Core Entities

### User
Represents the application user with preferences and settings.

```javascript
{
  id: "user_001",
  name: "Alex Johnson",
  email: "alex@example.com",
  riskProfile: "moderate", // conservative, moderate, aggressive
  preferences: {
    theme: "auto", // light, dark, auto
    notifications: true,
    defaultExchange: "binance",
    currency: "USD"
  },
  createdAt: "2024-01-15T10:30:00Z",
  lastLogin: "2024-01-20T14:22:00Z"
}
```

### ExchangeKey
Stores encrypted API keys for exchange connections.

```javascript
{
  id: "key_001",
  userId: "user_001",
  exchange: "binance", // binance, coinbase, kraken, etc.
  name: "Main Trading Account",
  apiKey: "encrypted_api_key",
  secretKey: "encrypted_secret_key",
  permissions: ["read", "trade"], // read, trade, withdraw
  isActive: true,
  createdAt: "2024-01-15T10:30:00Z",
  lastUsed: "2024-01-20T14:22:00Z"
}
```

### Strategy
Represents a trading strategy with rules and configuration.

```javascript
{
  id: "strategy_001",
  userId: "user_001",
  name: "BTC Range Trading",
  description: "Buy BTC when price drops 5%, sell when up 10%",
  isActive: true,
  riskLevel: "moderate",
  maxPositionSize: 0.1, // 10% of portfolio
  rules: [
    {
      id: "rule_001",
      condition: {
        type: "price_change",
        asset: "BTC",
        operator: "<=",
        value: -0.05, // -5%
        timeframe: "1h"
      },
      action: {
        type: "buy",
        asset: "BTC",
        amount: 0.5, // 50% of available balance
        orderType: "market"
      }
    },
    {
      id: "rule_002",
      condition: {
        type: "price_change",
        asset: "BTC",
        operator: ">=",
        value: 0.10, // +10%
        timeframe: "1h"
      },
      action: {
        type: "sell",
        asset: "BTC",
        amount: 0.5, // 50% of position
        orderType: "market",
        convertTo: "USDT"
      }
    }
  ],
  createdAt: "2024-01-15T10:30:00Z",
  lastModified: "2024-01-20T14:22:00Z"
}
```

### Rule
Individual trading rule within a strategy.

```javascript
{
  id: "rule_001",
  strategyId: "strategy_001",
  name: "BTC Buy Signal",
  priority: 1,
  condition: {
    type: "price_change", // price_change, volume_spike, sentiment, time_based
    asset: "BTC",
    operator: "<=", // <=, >=, ==, !=
    value: -0.05,
    timeframe: "1h", // 1m, 5m, 15m, 1h, 4h, 1d
    additionalFilters: {
      volumeThreshold: 1.5, // 1.5x average volume
      rsiRange: [20, 80]
    }
  },
  action: {
    type: "buy", // buy, sell, hold, convert
    asset: "BTC",
    amount: 0.5, // percentage or fixed amount
    orderType: "market", // market, limit, stop
    price: null, // for limit orders
    convertTo: null, // for conversions
    timeInTrade: 24 // hours
  },
  isEnabled: true,
  createdAt: "2024-01-15T10:30:00Z"
}
```

### Position
Represents an open trading position.

```javascript
{
  id: "position_001",
  userId: "user_001",
  strategyId: "strategy_001",
  asset: "BTC",
  side: "long", // long, short
  size: 0.5, // BTC amount
  entryPrice: 45000.00,
  currentPrice: 46500.00,
  unrealizedPnl: 750.00,
  unrealizedPnlPercent: 0.033, // 3.3%
  entryTime: "2024-01-20T10:30:00Z",
  timeInTrade: 3.5, // hours
  stopLoss: 42750.00, // -5%
  takeProfit: 49500.00, // +10%
  riskAmount: 1125.00, // risk in USD
  isActive: true,
  tags: ["range_trading", "btc_strategy"]
}
```

### Order
Represents a trading order (executed or pending).

```javascript
{
  id: "order_001",
  userId: "user_001",
  strategyId: "strategy_001",
  positionId: "position_001",
  exchange: "binance",
  asset: "BTC",
  side: "buy", // buy, sell
  type: "market", // market, limit, stop, stop_limit
  size: 0.5,
  price: 45000.00,
  filledPrice: 45025.00,
  filledSize: 0.5,
  status: "filled", // pending, filled, cancelled, rejected
  fees: 22.51, // USD
  createdAt: "2024-01-20T10:30:00Z",
  filledAt: "2024-01-20T10:30:15Z",
  exchangeOrderId: "binance_12345"
}
```

### Trade
Represents a completed trade with P&L.

```javascript
{
  id: "trade_001",
  userId: "user_001",
  strategyId: "strategy_001",
  asset: "BTC",
  side: "buy",
  size: 0.5,
  entryPrice: 45000.00,
  exitPrice: 46500.00,
  pnl: 750.00,
  pnlPercent: 0.033,
  fees: 45.02,
  netPnl: 704.98,
  entryTime: "2024-01-20T10:30:00Z",
  exitTime: "2024-01-20T14:22:00Z",
  duration: 3.87, // hours
  tags: ["range_trading", "profitable"]
}
```

### PortfolioMetric
Aggregated portfolio performance metrics.

```javascript
{
  id: "metric_001",
  userId: "user_001",
  date: "2024-01-20",
  totalValue: 10500.00,
  totalPnl: 500.00,
  totalPnlPercent: 0.05,
  dailyPnl: 125.00,
  dailyPnlPercent: 0.012,
  winRate: 0.65, // 65%
  avgWin: 250.00,
  avgLoss: -150.00,
  profitFactor: 1.67, // avgWin / avgLoss
  maxDrawdown: -0.08, // -8%
  sharpeRatio: 1.45,
  totalTrades: 20,
  winningTrades: 13,
  losingTrades: 7,
  avgTimeInTrade: 4.2, // hours
  riskAdjustedReturn: 0.12
}
```

### SentimentTick
News sentiment data point.

```javascript
{
  id: "sentiment_001",
  asset: "BTC",
  timestamp: "2024-01-20T14:22:00Z",
  score: 0.75, // -1.0 to 1.0
  confidence: 0.85, // 0.0 to 1.0
  source: "news_api",
  headline: "Bitcoin reaches new all-time high",
  summary: "Bitcoin price surges past $50,000...",
  impact: "positive", // positive, negative, neutral
  category: "price_movement",
  tags: ["bitcoin", "price", "bullish"]
}
```

## Market Data Structures

### PriceCandle
OHLCV price data for charting.

```javascript
{
  timestamp: "2024-01-20T14:00:00Z",
  open: 45000.00,
  high: 45250.00,
  low: 44800.00,
  close: 45100.00,
  volume: 1250.5,
  timeframe: "1h"
}
```

### TickerData
Current market ticker information.

```javascript
{
  asset: "BTC",
  price: 45100.00,
  change24h: 1250.00,
  change24hPercent: 0.028, // 2.8%
  volume24h: 28500000.00,
  marketCap: 850000000000.00,
  rank: 1,
  lastUpdate: "2024-01-20T14:22:00Z"
}
```

## Data Relationships

### Entity Relationships
```
User (1) ──→ (N) ExchangeKey
User (1) ──→ (N) Strategy
User (1) ──→ (N) Position
User (1) ──→ (N) Order
User (1) ──→ (N) Trade
User (1) ──→ (N) PortfolioMetric

Strategy (1) ──→ (N) Rule
Strategy (1) ──→ (N) Position
Strategy (1) ──→ (N) Order
Strategy (1) ──→ (N) Trade

Position (1) ──→ (N) Order
Position (1) ──→ (1) Trade (when closed)
```

### Data Flow
```
Market Data → PriceCandle → Chart Display
Market Data → TickerData → Market Watch
News Data → SentimentTick → Sentiment Analysis
User Input → Strategy → Rule → Order → Position → Trade
Portfolio Data → PortfolioMetric → Dashboard
```

## Storage Strategy

### Local Storage
- **User Preferences**: Theme, notifications, default settings
- **Strategies**: User-created trading strategies
- **API Keys**: Encrypted exchange credentials
- **Trade History**: Completed trades and performance data

### Sample Data (JSON)
- **Market Data**: Historical price candles, current tickers
- **News Data**: Sample news articles with sentiment scores
- **Trade Examples**: Mock trades for demonstration
- **Strategy Templates**: Pre-built strategy examples

### Memory Cache
- **Active Positions**: Currently open positions
- **Market Data**: Recent price data for charts
- **Calculations**: Computed metrics and indicators
- **UI State**: Current screen state and user interactions

## Data Validation

### Input Validation
- **Required Fields**: Ensure all required fields are present
- **Data Types**: Validate data types and formats
- **Ranges**: Check numeric values are within valid ranges
- **References**: Validate foreign key relationships

### Business Rules
- **Position Limits**: Maximum position size constraints
- **Risk Limits**: Risk tolerance enforcement
- **Order Validation**: Order size and price validation
- **Strategy Rules**: Rule logic validation

## Performance Considerations

### Data Optimization
- **Indexing**: Efficient data retrieval patterns
- **Caching**: Frequently accessed data in memory
- **Pagination**: Large datasets loaded incrementally
- **Compression**: Data compression for storage efficiency

### Memory Management
- **Cleanup**: Remove unused data from memory
- **Limits**: Implement data size limits
- **Garbage Collection**: Regular cleanup of old data
- **Monitoring**: Track memory usage patterns
