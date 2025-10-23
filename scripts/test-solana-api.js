// Test SolanaTracker API directly for GPT-5 wallet
const WALLET = '4isFg6MFZDt1YYYAFFSgtY2fiMSKx82ueT5njMENTCDJ';
const TLM_MINT = '3XAWJDr47NPzUfFgj3M6TamhRkJJQzgR86gizssBpump';
const wSOL_MINT = 'So11111111111111111111111111111111111111112';

async function testAPI() {
  const API_KEY = process.env.SOLANATRACKER_API_KEY;
  if (!API_KEY) {
    console.error('SOLANATRACKER_API_KEY not set');
    process.exit(1);
  }

  const url = `https://data.solanatracker.io/wallet/${WALLET}`;
  console.log('Fetching:', url);

  const response = await fetch(url, {
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('API Error:', response.status, await response.text());
    process.exit(1);
  }

  const data = await response.json();

  console.log('\n=== API Response Summary ===');
  console.log('Total (from API summary):', data.total);
  console.log('Total SOL (from API summary):', data.totalSol);
  console.log('Token count:', data.tokens.length);

  console.log('\n=== All Tokens ===');
  const nonSolTokens = data.tokens.filter(t => t.token.mint !== wSOL_MINT);

  let calculatedTotal = 0;
  nonSolTokens.forEach((token) => {
    const value = token.value || 0;
    calculatedTotal += value;
    const isTLM = token.token.mint === TLM_MINT;
    console.log(`${isTLM ? '>>> ' : '    '}${token.token.symbol.padEnd(15)} $${value.toFixed(2).padStart(10)} ${isTLM ? '<<< TLM' : ''}`);
  });

  console.log('\n=== Comparison ===');
  console.log('API summary.total:    $' + data.total.toFixed(2));
  console.log('Calculated from tokens: $' + calculatedTotal.toFixed(2));
  console.log('Difference:           $' + (calculatedTotal - data.total).toFixed(2));

  const tlmToken = nonSolTokens.find(t => t.token.mint === TLM_MINT);
  if (tlmToken) {
    console.log('\n=== TLM Details ===');
    console.log('TLM in tokens array: YES');
    console.log('TLM value: $' + tlmToken.value.toFixed(2));
    console.log('TLM included in summary.total?', data.total >= tlmToken.value ? 'MAYBE' : 'NO');
  } else {
    console.log('\n=== TLM Details ===');
    console.log('TLM in tokens array: NO');
  }
}

testAPI().catch(console.error);
