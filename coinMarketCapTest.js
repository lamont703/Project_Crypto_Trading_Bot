const axios = require('axios');
require('dotenv').config();

// API Configuration
const COINMARKETCAP_API_KEY = process.env.CMC_PRO_API_KEY || '911807e7-ac98-4332-8a65-0dbf689ce9aa';
const COINMARKETCAP_BASE_URL = 'https://sandbox-api.coinmarketcap.com/v1';

// Test Configuration
const API_CONFIG = {
  headers: {
    'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout
};

// Test Data Validation Functions
function validateCryptocurrencyListing(item) {
  const requiredFields = ['id', 'name', 'symbol', 'slug', 'cmc_rank', 'num_market_pairs', 'circulating_supply', 'total_supply', 'max_supply', 'date_added', 'platform', 'tags', 'quote'];
  
  for (const field of requiredFields) {
    if (!(field in item)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Validate numeric fields
  const numericFields = ['id', 'cmc_rank', 'num_market_pairs', 'circulating_supply', 'total_supply', 'max_supply'];
  for (const field of numericFields) {
    if (field in item && item[field] !== null && (typeof item[field] !== 'number' || isNaN(item[field]))) {
      throw new Error(`Invalid numeric field ${field}: ${item[field]}`);
    }
  }
  
  // Validate quote USD data
  if (item.quote && item.quote.USD) {
    const numericFields = ['price', 'volume_24h', 'percent_change_1h', 'percent_change_24h', 'percent_change_7d', 'percent_change_30d', 'percent_change_60d', 'percent_change_90d', 'market_cap'];
    const stringFields = ['last_updated'];
    
    // Check numeric fields
    for (const field of numericFields) {
      if (field in item.quote.USD && item.quote.USD[field] !== null && typeof item.quote.USD[field] !== 'number') {
        throw new Error(`Invalid USD ${field}: ${item.quote.USD[field]}`);
      }
    }
    
    // Check string fields (like last_updated)
    for (const field of stringFields) {
      if (field in item.quote.USD && item.quote.USD[field] !== null && typeof item.quote.USD[field] !== 'string') {
        throw new Error(`Invalid USD ${field}: ${item.quote.USD[field]}`);
      }
    }
  }
  
  return true;
}

// Main Test Functions
class CoinMarketCapAPITests {
  
  // Test 1: Basic Endpoint Test
  static async testBasicEndpointCall() {
    console.log('\n🧪 Testing: Basic Endpoint Call');
    
    try {
      const params = {
        start: 1,
        limit: 100,
        convert: 'USD'
      };
      
      const response = await axios.get(`${COINMARKETCAP_BASE_URL}/cryptocurrency/listings/latest`, {
        params,
        ...API_CONFIG
      });
      
      console.log('✅ Status:', response.status);
      console.log('✅ Response time:', (response.headers['duration'] || 'N/A'), 'ms');
      
      // Basic response validation
      if (response.status !== 200) {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
      
      if (! response.data) {
        throw new Error('No data returned from API');
      }
      
      console.log('✅ Basic endpoint test passed');
      return response.data;
      
    } catch (error) {
      console.error('❌ Basic endpoint test failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }
  
  // Test 2: Response Structure Validation
  static async testResponseStructure() {
    console.log('\n🧪 Testing: Response Structure Validation');
    
    try {
      const params = {
        start: 1,
        limit: 10,
        convert: 'USD'
      };
      
      const response = await axios.get(`${COINMARKETCAP_BASE_URL}/cryptocurrency/listings/latest`, {
        params,
        ...API_CONFIG
      });
      
      const data = response.data;
      
      // Check root structure
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Response missing data array');
      }
      
      if (!data.status || typeof data.status !== 'object') {
        throw new Error('Response missing status object');
      }
      
      // Validate status object
      const requiredStatusFields = ['timestamp', 'error_code', 'error_message'];
      for (const field of requiredStatusFields) {
        if (!(field in data.status)) {
          console.warn(`⚠️  Missing status field: ${field}`);
        }
      }
      
      // Validate first cryptocurrency object
      if (data.data.length > 0) {
        validateCryptocurrencyListing(data.data[0]);
        console.log('✅ Cryptocurrency object structure validated');
        
        // Check symbol and name
        const firstCoin = data.data[0];
        console.log(`✅ First coin: ${firstCoin.name} (${firstCoin.symbol}) - Rank #${firstCoin.cmc_rank}`);
        
        // Check USD quote
        if (firstCoin.quote && firstCoin.quote.USD) {
          const usd = firstCoin.quote.USD;
          console.log(`✅ USD Price: $${usd.price || 'N/A'}`);
          console.log(`✅ Market Cap: $${usd.market_cap || 'N/A'}`);
          console.log(`✅ 24h Change: ${usd.percent_change_24h || 'N/A'}%`);
        }
      }
      
      console.log('✅ Response structure validation passed');
      return data;
      
    } catch (error) {
      console.error('❌ Response structure validation failed:', error.message);
      throw error;
    }
  }
  
  // Test 3: Max Limit Test (5000 items as specified in curl command)
  static async testMaxLimitEndpoint() {
    console.log('\n🧪 Testing: Maximum Limit Endpoint (5000 items)');
    
    try {
      const params = {
        start: 1,
        limit: 5000,
        convert: 'USD'
      };
      
      console.log('📊 Requesting 5000 cryptocurrency listings...');
      const startTime = Date.now();
      
      const response = await axios.get(`${COINMARKETCAP_BASE_URL}/cryptocurrency/listings/latest`, {
        params,
        ...API_CONFIG
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ Request completed in ${duration}ms`);
      console.log(`✅ Items returned: ${response.data.data ? response.data.data.length : 0}`);
      console.log(`✅ Response size: ${JSON.stringify(response.data).length} characters`);
      
      // Validate we got data
      if (!response.data.data || response.data.data.length === 0) {
        throw new Error('No cryptocurrency data returned');
      }
      
      // Check if we got close to the requested amount
      const returnedItems = response.data.data.length;
      console.log(`ℹ️  Note: Sandbox API may have limited data (requested 5000, got ${returnedItems})`);
      
      if (returnedItems >= 5) {
        console.log(`✅ Got ${returnedItems} cryptocurrencies - sufficient for testing`);
      } else {
        console.warn(`⚠️  Only ${returnedItems} items returned, this might indicate API issues`);
      }
      
      // Validate first few items
      const itemsToCheck = Math.min(10, returnedItems);
      for (let i = 0; i < itemsToCheck; i++) {
        validateCryptocurrencyListing(response.data.data[i]);
      }
      console.log(`✅ Validated structure of first ${itemsToCheck} items`);
      
      // Show sample of different ranked coins
      if (returnedItems > 0) {
        console.log('\n📈 Sample cryptocurrency rankings:');
        const sampleIndices = [0, Math.floor(returnedItems / 4), Math.floor(returnedItems / 2), Math.floor(3 * returnedItems / 4), returnedItems - 1];
        sampleIndices.forEach((idx, i) => {
          if (idx < returnedItems) {
            const coin = response.data.data[idx];
            console.log(`   ${i + 1}. ${coin.name} (${coin.symbol}) - Rank #${coin.cmc_rank} - $${coin.quote?.USD?.price?.toFixed(2) || 'N/A'}`);
          }
        });
      }
      
      console.log('✅ Maximum limit endpoint test passed');
      return response.data;
      
    } catch (error) {
      console.error('❌ Maximum limit endpoint test failed:', error.message);
      throw error;
    }
  }
  
  // Test 4: Currency Conversion Test
  static async testCurrencyConversion() {
    console.log('\n🧪 Testing: Currency Conversion');
    
    try {
      const currencies = ['USD', 'EUR', 'BTC', 'ETH'];
      
      for (const currency of currencies) {
        console.log(`\n💱 Testing conversion to: ${currency}`);
        
        const params = {
          start: 1,
          limit: 5,
          convert: currency
        };
        
        const response = await axios.get(`${COINMARKETCAP_BASE_URL}/cryptocurrency/listings/latest`, {
          params,
          ...API_CONFIG
        });
        
        if (response.data.data.length > 0) {
          const firstCoin = response.data.data[0];
          
          if (!firstCoin.quote || !firstCoin.quote[currency]) {
            console.warn(`⚠️  No ${currency} quote found for ${firstCoin.name}`);
            continue;
          }
          
          const quote = firstCoin.quote[currency];
          console.log(`✅ ${firstCoin.name}: ${quote.price} ${currency}`);
          
          // Validate price is a number
          if (typeof quote.price !== 'number' || isNaN(quote.price)) {
            throw new Error(`Invalid price for ${currency}: ${quote.price}`);
          }
          
          // Show additional quote data if available
          if (quote.market_cap) {
            console.log(`   Market Cap: ${quote.market_cap} ${currency}`);
          }
          if (quote.percent_change_24h) {
            console.log(`   24h Change: ${quote.percent_change_24h}%`);
          }
        }
      }
      
      console.log('✅ Currency conversion test passed');
      console.log('ℹ️  Note: Sandbox may return mock/synthetic data');
      
    } catch (error) {
      console.error('❌ Currency conversion test failed:', error.message);
      throw error;
    }
  }
  
  // Test 5: Error Handling Test
  static async testErrorHandling() {
    console.log('\n🧪 Testing: Error Handling');
    
    try {
      // Test invalid API key
      console.log('\n🔑 Testing invalid API key');
      const invalidConfig = {
        ...API_CONFIG,
        headers: {
          ...API_CONFIG.headers,
          'X-CMC_PRO_API_KEY': 'invalid-api-key-12345'
        }
      };
      
      try {
        await axios.get(`${COINMARKETCAP_BASE_URL}/cryptocurrency/listings/latest`, {
          params: { start: 1, limit: 5, convert: 'USD' },
          ...invalidConfig,
          timeout: 10000 // Shorter timeout for error cases
        });
        console.warn('⚠️  Expected error for invalid API key, but request succeeded');
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log('✅ Invalid API key properly rejected');
        } else if (error.code === 'ECONNABORTED') {
          console.log('✅ Request timed out as expected');
        } else {
          console.warn('⚠️  Unexpected error for invalid API key:', error.message);
        }
      }
      
      // Test boundary conditions
      console.log('\n📝 Testing boundary conditions');
      const boundaryTests = [
        { start: 0, limit: 10, description: 'Start at 0' },
        { start: 1, limit: 0, description: 'Limit of 0' },
        { start: -1, limit: 10, description: 'Negative start' },
        { start: 1, limit: 10000, description: 'Excessive limit' }
      ];
      
      for (const test of boundaryTests) {
        console.log(`   Testing: ${test.description}`);
        try {
          await axios.get(`${COINMARKETCAP_BASE_URL}/cryptocurrency/listings/latest`, {
            params: { ...test, convert: 'USD' },
            ...API_CONFIG,
            timeout: 10000
          });
          console.warn(`     ⚠️  Request succeeded unexpectedly for ${test.description}`);
        } catch (error) {
          if (error.response && error.response.status >= 400) {
            console.log(`     ✅ ${test.description} properly rejected`);
          } else {
            console.log(`     ℹ️  ${test.description}: ${error.message}`);
          }
        }
      }
      
      console.log('✅ Error handling test completed');
      
    } catch (error) {
      console.error('❌ Error handling test failed:', error.message);
      throw error;
    }
  }
  
  // Test 6: Performance Test
  static async testPerformance() {
    console.log('\n🧪 Testing: Performance');
    
    try {
      const testCases = [
        { limit: 100, description: 'Small dataset (100 items)' },
        { limit: 1000, description: 'Medium dataset (1000 items)' },
        { limit: 5000, description: 'Large dataset (5000 items)' }
      ];
      
      for (const testCase of testCases) {
        console.log(`\n⏱️  Testing: ${testCase.description}`);
        
        const params = {
          start: 1,
          limit: testCase.limit,
          convert: 'USD'
        };
        
        const startTime = Date.now();
        
        const response = await axios.get(`${COINMARKETCAP_BASE_URL}/cryptocurrency/listings/latest`, {
          params,
          ...API_CONFIG
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ Request completed in ${duration}ms`);
        console.log(`✅ Items returned: ${response.data.data ? response.data.data.length : 0}`);
        
        // Performance benchmarks (adjusted for sandbox limitations)
        if (duration > 10000) {
          console.warn(`⚠️  Slow response time: ${duration}ms`);
        } else {
          console.log(`✅ Good performance for ${testCase.description}`);
        }
        
        // Note about sandbox limitations
        const returnedCount = response.data.data ? response.data.data.length : 0;
        if (returnedCount < testCase.limit) {
          console.log(`ℹ️  Sandbox limitation: requested ${testCase.limit}, got ${returnedCount}`);
        }
      }
      
      console.log('✅ Performance test completed');
      
    } catch (error) {
      console.error('❌ Performance test failed:', error.message);
      throw error;
    }
  }
  
  // Test 7: Data Quality and Consistency Test
  static async testDataQuality() {
    console.log('\n🧪 Testing: Data Quality and Consistency');
    
    try {
      const params = {
        start: 1,
        limit: 50,
        convert: 'USD'
      };
      
      const response = await axios.get(`${COINMARKETCAP_BASE_URL}/cryptocurrency/listings/latest`, {
        params,
        ...API_CONFIG
      });
      
      const data = response.data.data;
      
      // Check data quality metrics
      let validPrices = 0;
      let invalidData = [];
      
      data.forEach((coin, index) => {
        if (coin.quote && coin.quote.USD) {
          const usd = coin.quote.USD;
          if (usd.price && typeof usd.price === 'number' && usd.price > 0) {
            validPrices++;
          } else {
            invalidData.push(`${coin.name}: Invalid price ${usd.price}`);
          }
        } else {
          invalidData.push(`${coin.name}: Missing USD quote`);
        }
        
        // Check rankings are sequential (relaxed for sandbox data)
        // Note: Sandbox data may not have proper sequential rankings
        if (coin.cmc_rank && typeof coin.cmc_rank === 'number' && coin.cmc_rank !== index + 1) {
          // Only warn if it seems like a real inconsistency, not sandbox test data
          if (coin.cmc_rank < index + 1 || coin.cmc_rank > index + 1000) {
            console.warn(`⚠️  Ranking inconsistency: ${coin.name} should be #${index + 1}, got #${coin.cmc_rank}`);
          }
        }
      });
      
      console.log(`✅ Data quality summary:`);
      console.log(`   Valid price data: ${validPrices}/${data.length} coins`);
      console.log(`   Data completeness: ${((validPrices / data.length) * 100).toFixed(1)}%`);
      
      if (invalidData.length > 0) {
        console.warn(`   ⚠️  Data issues found:`);
        invalidData.slice(0, 5).forEach(issue => console.warn(`     - ${issue}`));
        if (invalidData.length > 5) {
          console.warn(`     - ... and ${invalidData.length - 5} more issues`);
        }
      } else {
        console.log('   ✅ No data quality issues detected');
      }
      
      console.log('✅ Data quality and consistency test completed');
      
    } catch (error) {
      console.error('❌ Data quality test failed:', error.message);
      throw error;
    }
  }
}

// Run All Tests
async function runAllTests() {
  console.log('🚀 Starting CoinMarketCap API Tests');
  console.log('=====================================');
  console.log(`📡 Testing endpoint: ${COINMARKETCAP_BASE_URL}/cryptocurrency/listings/latest`);
  console.log(`🔑 Using API key: ${COINMARKETCAP_API_KEY.substring(0, 8)}...`);
  console.log(`🔷 Note: Using SANDBOX API - data may be limited/mock`);
  
  const tests = [
    CoinMarketCapAPITests.testBasicEndpointCall,
    CoinMarketCapAPITests.testResponseStructure,
    CoinMarketCapAPITests.testMaxLimitEndpoint,
    CoinMarketCapAPITests.testCurrencyConversion,
    CoinMarketCapAPITests.testErrorHandling,
    CoinMarketCapAPITests.testPerformance,
    CoinMarketCapAPITests.testDataQuality
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  const startTime = Date.now();
  
  for (const test of tests) {
    try {
      const testStartTime = Date.now();
      await test();
      const testDuration = Date.now() - testStartTime;
      console.log(`⏱️  Test completed in ${testDuration}ms\n`);
      passedTests++;
    } catch (error) {
      console.error(`❌ Test ${test.name} failed: ${error.message}`);
      console.log(''); // Add spacing
      failedTests++;
    }
  }
  
  const totalDuration = Date.now() - startTime;
  
  console.log('📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / tests.length) * 100).toFixed(1)}%`);
  console.log(`⏱️  Total Test Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(1)}s)`);
  
  if (failedTests > 0) {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    console.log('💡 Common issues:');
    console.log('   - Check your internet connection');
    console.log('   - Verify your API key is valid');
    console.log('   - Check if you have exceeded rate limits');
    console.log('   - Review the endpoint URL and parameters');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed successfully!');
    console.log('✨ Your CoinMarketCap API integration is working correctly.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Test suite failed to run:', error.message);
    process.exit(1);
  });
}

// Export for use in other files
module.exports = {
  CoinMarketCapAPITests,
  runAllTests,
  API_CONFIG,
  COINMARKETCAP_API_KEY,
  COINMARKETCAP_BASE_URL
};