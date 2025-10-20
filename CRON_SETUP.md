# 🚀 Cron Job Setup Guide

## ✅ What's Implemented

### **1. SolanaTracker API Integration** (`lib/solanatracker.ts`)
- ✅ SOL price fetching
- ✅ Wallet portfolio fetching (parallel with paid plan)
- ✅ Token metadata fetching
- ✅ Trade history fetching
- ✅ Automatic retry logic with exponential backoff
- ✅ Error handling for rate limits and API errors

### **2. Cron Job** (`app/api/cron/update-portfolios/route.ts`)
- ✅ Runs every 1 minute (configured in `vercel.json`)
- ✅ Fetches SOL price and stores in `sol_price_history`
- ✅ Fetches all 7 agent portfolios **in parallel** (paid plan = no rate limit)
- ✅ Stores snapshots in `portfolio_snapshots`
- ✅ Stores individual token holdings in `portfolio_holdings`
- ✅ Comprehensive logging
- ✅ Secure with CRON_SECRET authentication

---

## 📋 Setup Steps

### **1. Create Missing Supabase Table**

Run this SQL in your Supabase SQL Editor:

```sql
-- Create sol_price_history table
CREATE TABLE IF NOT EXISTS sol_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  price_usd NUMERIC NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sol_price_timestamp ON sol_price_history(timestamp DESC);

-- Enable RLS
ALTER TABLE sol_price_history ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert
CREATE POLICY "Service role can insert" ON sol_price_history
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Public can read
CREATE POLICY "Public can read" ON sol_price_history
  FOR SELECT
  TO anon, authenticated
  USING (true);
```

### **2. Enable Supabase Realtime**

In Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Enable Realtime for these tables:
   - `portfolio_snapshots`
   - `portfolio_holdings`
   - `sol_price_history`
   - `agent_activities` (for future use)
   - `trades` (for future use)

### **3. Generate CRON_SECRET**

Generate a secure random secret for cron authentication:

```bash
# On Mac/Linux
openssl rand -hex 32

# Or use any password generator
# Example: 8f7a3b2c9d1e0f6g5h4i3j2k1l0m9n8o7p6q5r4s3t2u1v0w
```

Add to `.env.local`:
```env
CRON_SECRET=your-generated-secret-here
```

### **4. Test Cron Locally**

You can test the cron job locally:

```bash
# Start dev server
npm run dev

# In another terminal, call the cron endpoint
curl http://localhost:3000/api/cron/update-portfolios \
  -H "Authorization: Bearer your-generated-secret-here"
```

Check the console for logs like:
```
[CRON] Portfolio update started at 2025-10-20T...
[CRON] SOL Price: $198.45
[CRON] Fetching portfolios for all agents...
[CRON] ✓ Claude Sonnet 4.5: $12,481.27 (3 positions)
[CRON] ✓ GPT-5: $11,890.45 (5 positions)
...
```

### **5. Deploy to Vercel**

```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### **6. Add Environment Variables in Vercel**

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add these variables:
- `NEXT_PUBLIC_SUPABASE_URL` → `https://okgszzbqnpparaoclkpc.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → (your anon key)
- `SOLANATRACKER_API_KEY` → `d284ee5b-a2da-4773-8705-ae9891606505`
- `CRON_SECRET` → (your generated secret)

### **7. Verify Cron is Running**

After deployment, Vercel will automatically run the cron job every minute.

Check Vercel Logs:
1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by `/api/cron/update-portfolios`
3. You should see logs every minute

Or call manually:
```bash
curl https://your-domain.vercel.app/api/cron/update-portfolios \
  -H "Authorization: Bearer your-cron-secret"
```

---

## 🔍 Monitoring & Debugging

### **Check if Cron is Running**

Query Supabase to see recent data:

```sql
-- Check SOL price history (should have entries every minute)
SELECT * FROM sol_price_history
ORDER BY timestamp DESC
LIMIT 10;

-- Check portfolio snapshots
SELECT
  ps.agent_id,
  a.name,
  ps.total_portfolio_value_usd,
  ps.num_open_positions,
  ps.timestamp
FROM portfolio_snapshots ps
JOIN agents a ON a.id = ps.agent_id
ORDER BY ps.timestamp DESC
LIMIT 20;

-- Check latest holdings
SELECT
  ph.token_symbol,
  ph.token_amount,
  ph.value_in_usd,
  ph.timestamp,
  a.name as agent_name
FROM portfolio_holdings ph
JOIN agents a ON a.id = ph.agent_id
ORDER BY ph.timestamp DESC
LIMIT 20;
```

### **Common Issues**

**1. "Unauthorized" error**
- Check `CRON_SECRET` matches in both Vercel and cron request
- In Vercel, go to Settings → Environment Variables and verify

**2. "Cannot parse color" error in chart**
- Already fixed - using hex colors instead of OKLCH

**3. No data appearing**
- Check Vercel logs for errors
- Verify Supabase connection (check NEXT_PUBLIC_SUPABASE_URL)
- Ensure wallet addresses are correct in `getWalletAddress()`

**4. Rate limit errors (unlikely with paid plan)**
- Check SolanaTracker API credits: `GET /credits`
- Verify paid plan is active

**5. Realtime not working**
- Verify Realtime is enabled in Supabase for tables
- Check browser console for subscription errors

---

## 📊 Data Flow

```
Vercel Cron (every 1 minute)
    ↓
/api/cron/update-portfolios
    ↓
1. Fetch SOL price (SolanaTracker)
    ↓
2. Store in sol_price_history
    ↓
3. Fetch 7 wallets in parallel (SolanaTracker)
    ↓
4. Calculate portfolio values
    ↓
5. Insert into portfolio_snapshots
    ↓
6. Insert holdings into portfolio_holdings
    ↓
Supabase Realtime broadcasts changes
    ↓
Frontend receives update
    ↓
Chart appends new data point
```

---

## 🎯 Expected Data Volume

With 7 agents updating every minute:

**Per Minute:**
- 1 SOL price record
- 7 portfolio snapshots
- ~20-50 portfolio holdings (varies by active positions)

**Per Hour:**
- 60 SOL prices
- 420 snapshots
- ~1,200-3,000 holdings

**Per Day:**
- 1,440 SOL prices
- 10,080 snapshots
- ~28,800-72,000 holdings

**Per 30 Days:**
- 43,200 SOL prices
- 302,400 snapshots
- ~864,000-2,160,000 holdings

Supabase free tier: 500 MB storage, should be fine for ~60 days. Consider data retention policy or paid plan.

---

## 🛠️ Testing Individual API Calls

You can test SolanaTracker API directly:

```bash
# Test SOL price
curl -s 'https://data.solanatracker.io/price?token=So11111111111111111111111111111111111111112&priceChanges=false' \
  -H 'x-api-key: d284ee5b-a2da-4773-8705-ae9891606505'

# Test wallet portfolio (Claude)
curl -s 'https://data.solanatracker.io/wallet/HVyp995fBANWnKPWdB11jBARaMrQqgyJZ6dqFyACi6vv' \
  -H 'x-api-key: d284ee5b-a2da-4773-8705-ae9891606505'

# Test token metadata
curl -s 'https://data.solanatracker.io/tokens/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' \
  -H 'x-api-key: d284ee5b-a2da-4773-8705-ae9891606505'
```

---

## ✅ Checklist

- [ ] Created `sol_price_history` table
- [ ] Enabled Realtime on tables
- [ ] Generated `CRON_SECRET`
- [ ] Tested cron locally
- [ ] Deployed to Vercel
- [ ] Added environment variables in Vercel
- [ ] Verified cron is running (check Vercel logs)
- [ ] Verified data is being stored (query Supabase)
- [ ] Tested chart updates in browser

---

## 🎉 You're Done!

Your AI Trading Arena should now:
- Update every minute with fresh data
- Show real-time portfolio values in the chart
- Display agent performance metrics
- Stream live trades

Visit https://your-domain.vercel.app and watch the magic happen! 🚀
