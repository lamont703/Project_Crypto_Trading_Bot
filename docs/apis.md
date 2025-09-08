# API Specifications

## Overview

This document outlines the API specifications for the Crypto Trading Bot. While the current implementation uses mock data, these APIs represent the future integration points with real exchanges and data providers.

## Base Configuration

### Base URL
```
Production: https://api.cryptobot.com/v1
Sandbox: https://api-sandbox.cryptobot.com/v1
```

### Authentication
All API requests require authentication using JWT tokens:

```http
Authorization: Bearer <jwt_token>
```

### Rate Limiting
- **Standard**: 1000 requests per hour
- **Premium**: 5000 requests per hour
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Market Data APIs

### Get Market Tickers
Get current market data for top cryptocurrencies.

```http
GET /market/tickers
```

**Query Parameters:**
- `assets` (optional): Comma-separated list of assets (default: top 10)
- `include_volume` (optional): Include 24h volume data (default: true)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "asset": "BTC",
      "price": 45100.00,
      "change24h": 1250.00,
      "change24hPercent": 0.028,
      "volume24h": 28500000.00,
      "marketCap": 850000000000.00,
      "rank": 1,
      "lastUpdate": "2024-01-20T14:22:00Z"
    }
  ],
  "timestamp": "2024-01-20T14:22:00Z"
}
```

### Get Price History
Get historical price data for charting.

```http
GET /market/history/{asset}
```

**Path Parameters:**
- `asset`: Asset symbol (e.g., BTC, ETH)

**Query Parameters:**
- `timeframe`: 1m, 5m, 15m, 1h, 4h, 1d (default: 1h)
- `start`: Start timestamp (ISO 8601)
- `end`: End timestamp (ISO 8601)
- `limit`: Number of candles (max: 1000, default: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "asset": "BTC",
    "timeframe": "1h",
    "candles": [
      {
        "timestamp": "2024-01-20T14:00:00Z",
        "open": 45000.00,
        "high": 45250.00,
        "low": 44800.00,
        "close": 45100.00,
        "volume": 1250.5
      }
    ]
  },
  "count": 100
}
```

## Trading APIs

### Get Portfolio
Get user's portfolio overview.

```http
GET /trading/portfolio
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalValue": 10500.00,
    "totalPnl": 500.00,
    "totalPnlPercent": 0.05,
    "dailyPnl": 125.00,
    "dailyPnlPercent": 0.012,
    "positions": [
      {
        "id": "position_001",
        "asset": "BTC",
        "size": 0.5,
        "entryPrice": 45000.00,
        "currentPrice": 46500.00,
        "unrealizedPnl": 750.00,
        "unrealizedPnlPercent": 0.033
      }
    ],
    "balances": {
      "BTC": 0.5,
      "USDT": 2500.00,
      "ETH": 2.0
    }
  }
}
```

### Get Positions
Get all open positions.

```http
GET /trading/positions
```

**Query Parameters:**
- `status`: open, closed, all (default: open)
- `asset` (optional): Filter by asset
- `strategy_id` (optional): Filter by strategy

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "position_001",
      "asset": "BTC",
      "side": "long",
      "size": 0.5,
      "entryPrice": 45000.00,
      "currentPrice": 46500.00,
      "unrealizedPnl": 750.00,
      "unrealizedPnlPercent": 0.033,
      "entryTime": "2024-01-20T10:30:00Z",
      "timeInTrade": 3.5,
      "stopLoss": 42750.00,
      "takeProfit": 49500.00,
      "riskAmount": 1125.00,
      "isActive": true
    }
  ],
  "count": 1
}
```

### Place Order
Place a new trading order.

```http
POST /trading/orders
```

**Request Body:**
```json
{
  "asset": "BTC",
  "side": "buy",
  "type": "market",
  "size": 0.5,
  "price": null,
  "stopLoss": 42750.00,
  "takeProfit": 49500.00,
  "timeInTrade": 24,
  "strategyId": "strategy_001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_001",
    "status": "pending",
    "asset": "BTC",
    "side": "buy",
    "type": "market",
    "size": 0.5,
    "price": null,
    "createdAt": "2024-01-20T14:22:00Z",
    "exchangeOrderId": null
  }
}
```

### Get Orders
Get order history.

```http
GET /trading/orders
```

**Query Parameters:**
- `status`: pending, filled, cancelled, rejected, all (default: all)
- `asset` (optional): Filter by asset
- `start` (optional): Start timestamp
- `end` (optional): End timestamp
- `limit`: Number of orders (max: 100, default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order_001",
      "asset": "BTC",
      "side": "buy",
      "type": "market",
      "size": 0.5,
      "price": 45000.00,
      "filledPrice": 45025.00,
      "filledSize": 0.5,
      "status": "filled",
      "fees": 22.51,
      "createdAt": "2024-01-20T10:30:00Z",
      "filledAt": "2024-01-20T10:30:15Z"
    }
  ],
  "count": 1
}
```

## Strategy APIs

### Get Strategies
Get user's trading strategies.

```http
GET /strategies
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "strategy_001",
      "name": "BTC Range Trading",
      "description": "Buy BTC when price drops 5%, sell when up 10%",
      "isActive": true,
      "riskLevel": "moderate",
      "maxPositionSize": 0.1,
      "rules": [
        {
          "id": "rule_001",
          "condition": {
            "type": "price_change",
            "asset": "BTC",
            "operator": "<=",
            "value": -0.05,
            "timeframe": "1h"
          },
          "action": {
            "type": "buy",
            "asset": "BTC",
            "amount": 0.5,
            "orderType": "market"
          }
        }
      ],
      "createdAt": "2024-01-15T10:30:00Z",
      "lastModified": "2024-01-20T14:22:00Z"
    }
  ],
  "count": 1
}
```

### Create Strategy
Create a new trading strategy.

```http
POST /strategies
```

**Request Body:**
```json
{
  "name": "ETH Momentum Strategy",
  "description": "Buy ETH on momentum, sell on reversal",
  "riskLevel": "aggressive",
  "maxPositionSize": 0.2,
  "rules": [
    {
      "condition": {
        "type": "price_change",
        "asset": "ETH",
        "operator": ">=",
        "value": 0.03,
        "timeframe": "15m"
      },
      "action": {
        "type": "buy",
        "asset": "ETH",
        "amount": 0.3,
        "orderType": "market"
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "strategy_002",
    "name": "ETH Momentum Strategy",
    "description": "Buy ETH on momentum, sell on reversal",
    "isActive": false,
    "riskLevel": "aggressive",
    "maxPositionSize": 0.2,
    "rules": [
      {
        "id": "rule_002",
        "condition": {
          "type": "price_change",
          "asset": "ETH",
          "operator": ">=",
          "value": 0.03,
          "timeframe": "15m"
        },
        "action": {
          "type": "buy",
          "asset": "ETH",
          "amount": 0.3,
          "orderType": "market"
        }
      }
    ],
    "createdAt": "2024-01-20T14:22:00Z",
    "lastModified": "2024-01-20T14:22:00Z"
  }
}
```

### Update Strategy
Update an existing strategy.

```http
PUT /strategies/{strategy_id}
```

### Delete Strategy
Delete a strategy.

```http
DELETE /strategies/{strategy_id}
```

## Backtesting APIs

### Run Backtest
Run a backtest on historical data.

```http
POST /backtesting/run
```

**Request Body:**
```json
{
  "strategyId": "strategy_001",
  "asset": "BTC",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-20T23:59:59Z",
  "initialCapital": 10000.00,
  "timeframe": "1h"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "backtestId": "backtest_001",
    "status": "completed",
    "results": {
      "totalReturn": 0.15,
      "totalReturnPercent": 15.0,
      "maxDrawdown": -0.08,
      "maxDrawdownPercent": -8.0,
      "winRate": 0.65,
      "profitFactor": 1.67,
      "sharpeRatio": 1.45,
      "totalTrades": 20,
      "winningTrades": 13,
      "losingTrades": 7,
      "avgWin": 250.00,
      "avgLoss": -150.00,
      "avgTimeInTrade": 4.2
    },
    "trades": [
      {
        "entryTime": "2024-01-05T10:30:00Z",
        "exitTime": "2024-01-05T14:22:00Z",
        "entryPrice": 45000.00,
        "exitPrice": 46500.00,
        "pnl": 750.00,
        "pnlPercent": 0.033
      }
    ],
    "createdAt": "2024-01-20T14:22:00Z"
  }
}
```

### Get Backtest Results
Get backtest results by ID.

```http
GET /backtesting/{backtest_id}
```

## News & Sentiment APIs

### Get News Sentiment
Get news sentiment data for assets.

```http
GET /news/sentiment
```

**Query Parameters:**
- `asset` (optional): Asset symbol
- `start` (optional): Start timestamp
- `end` (optional): End timestamp
- `limit`: Number of items (max: 100, default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sentiment_001",
      "asset": "BTC",
      "timestamp": "2024-01-20T14:22:00Z",
      "score": 0.75,
      "confidence": 0.85,
      "source": "news_api",
      "headline": "Bitcoin reaches new all-time high",
      "summary": "Bitcoin price surges past $50,000...",
      "impact": "positive",
      "category": "price_movement"
    }
  ],
  "count": 1
}
```

### Get Market Signals
Get trading signals based on analysis.

```http
GET /signals
```

**Query Parameters:**
- `asset` (optional): Asset symbol
- `type`: price, sentiment, volume, all (default: all)
- `strength`: weak, moderate, strong, all (default: all)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "signal_001",
      "asset": "BTC",
      "type": "price",
      "strength": "moderate",
      "direction": "bullish",
      "confidence": 0.75,
      "reason": "Price above 20-day moving average with increasing volume",
      "timestamp": "2024-01-20T14:22:00Z"
    }
  ],
  "count": 1
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": {
      "field": "asset",
      "issue": "Asset symbol is required"
    }
  },
  "timestamp": "2024-01-20T14:22:00Z"
}
```

### Error Codes
- `INVALID_REQUEST`: Invalid request parameters
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Rate limit exceeded
- `EXCHANGE_ERROR`: Exchange API error
- `INSUFFICIENT_BALANCE`: Insufficient balance for order
- `INVALID_ORDER`: Invalid order parameters
- `STRATEGY_ERROR`: Strategy execution error
- `INTERNAL_ERROR`: Internal server error

## WebSocket APIs

### Market Data Stream
Real-time market data updates.

```javascript
// Connection
const ws = new WebSocket('wss://api.cryptobot.com/v1/stream/market');

// Subscribe to tickers
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'tickers',
  assets: ['BTC', 'ETH', 'SOL']
}));

// Subscribe to price updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'prices',
  asset: 'BTC',
  timeframe: '1m'
}));
```

### Order Updates Stream
Real-time order status updates.

```javascript
// Subscribe to order updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'orders',
  userId: 'user_001'
}));
```

## SDK Examples

### JavaScript SDK
```javascript
import { CryptoBotAPI } from '@cryptobot/sdk';

const api = new CryptoBotAPI({
  apiKey: 'your_api_key',
  baseURL: 'https://api.cryptobot.com/v1'
});

// Get market data
const tickers = await api.market.getTickers(['BTC', 'ETH']);

// Place order
const order = await api.trading.placeOrder({
  asset: 'BTC',
  side: 'buy',
  type: 'market',
  size: 0.5
});

// Get portfolio
const portfolio = await api.trading.getPortfolio();
```

### Python SDK
```python
from cryptobot import CryptoBotAPI

api = CryptoBotAPI(api_key='your_api_key')

# Get market data
tickers = api.market.get_tickers(['BTC', 'ETH'])

# Place order
order = api.trading.place_order(
    asset='BTC',
    side='buy',
    type='market',
    size=0.5
)

# Get portfolio
portfolio = api.trading.get_portfolio()
```
