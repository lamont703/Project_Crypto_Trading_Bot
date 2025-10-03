# CoinMarketCap API Test Instructions

## Overview

The `CoinMarketCap.test.js` file contains comprehensive tests for the CoinMarketCap cryptocurrency listings API endpoint.

## Setup

### 1. Environment Variables

Create a `.env` file in the project root with:

```
CMC_PRO_API_KEY=911807e7-ac98-4332-8a65-0dbf689ce9aa
```

### 2. Installation

Ensure all dependencies are installed:

```bash
npm install
```

## Running the Tests

### Run All Tests

```bash
npm run test:cmc
```

### Run Individual Tests

You can modify the `runAllTests()` function to run specific tests only.

## Test Coverage

The test suite includes the following comprehensive tests:

### 1. Basic Endpoint Test

- Tests basic connectivity to the API
- Validates HTTP response status
- Checks response time

### 2. Response Structure Validation

- Validates JSON response structure
- Checks required fields in cryptocurrency objects
- Verifies data types and formats

### 3. Pagination Test

- Tests different start positions and limits
- Validates unique IDs across pages
- Checks data consistency across paginated requests

### 4. Currency Conversion Test

- Tests USD, EUR, and BTC currency conversions
- Validates price formats for each currency
- Checks quote data structure

### 5. Error Handling Test

- Tests invalid API key scenarios
- Tests invalid parameters
- Tests invalid endpoints
- Validates proper error responses

### 6. Performance Test

- Tests large dataset requests (5000 items)
- Measures response times
- Checks response sizes

### 7. Data Consistency Test

- Makes multiple concurrent requests
- Validates data consistency across requests
- Checks for data integrity

## API Endpoint Tested

The tests target this specific endpoint:

```
GET https://sandbox-api.coinmarketcap.com/v1/crystallocurrency/listings/Latest
```

With parameters:

- `start`: Starting position (default: 1)
- `limit`: Number of items to return (max: 5000)
- `convert`: Currency for price conversion (default: USD)

## Expected Output

When all tests pass, you'll see:

```
🚀 Starting CoinMarketCap API Tests
=====================================

🧪 Testing: Basic Endpoint Call
✅ Status: 200
✅ Response time: X ms
✅ Basic endpoint test passed

🧪 Testing: Response Structure Validation
✅ Cryptocurrency object structure validated
✅ First coin: Bitcoin (BTC) - Rank #1
✅ USD Price: $45000.00
✅ Market Cap: $850000000000.00
✅ 24h Change: 2.5%
✅ Response structure validation passed

[Additional test outputs...]

📊 Test Results Summary
=======================
✅ Passed: 7
❌ Failed: 0
📈 Success Rate: 100.0%

🎉 All tests passed successfully!
```

## Error Handling

The tests include comprehensive error handling for:

- Network timeouts
- Invalid API keys
- Malformed requests
- Rate limiting
- Server errors

## Notes

- Uses sandbox API endpoint for testing
- Includes 30-second timeout for requests
- Validates both response structure and data types
- Provides detailed logging for debugging
- Handles edge cases and error scenarios

## Customization

You can modify the test parameters by updating the constants at the top of the file:

- `COINMARKETCAP_API_KEY`: Your API key
- `COINMARKETCAP_BASE_URL`: API base URL
- `API_CONFIG`: Request configuration options
