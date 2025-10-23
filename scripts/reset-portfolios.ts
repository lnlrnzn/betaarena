import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables manually
const envFile = readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Key:', supabaseServiceKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Available keys:', Object.keys(envVars));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetPortfolios() {
  console.log('Deleting all portfolio snapshots...');

  const { error, count } = await supabase
    .from('portfolio_snapshots')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log(`✓ Deleted ${count} portfolio snapshots`);

  // Verify
  const { count: remaining } = await supabase
    .from('portfolio_snapshots')
    .select('*', { count: 'exact', head: true });

  console.log(`Remaining snapshots: ${remaining}`);
}

resetPortfolios();
