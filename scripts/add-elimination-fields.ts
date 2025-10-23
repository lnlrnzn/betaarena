import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

const GPT5_ID = '0b63001e-f3b3-4eb9-94f1-0dd63b66ebbc';

async function runMigration() {
  console.log('='.repeat(70));
  console.log('ADDING ELIMINATION FIELDS TO AGENTS TABLE');
  console.log('='.repeat(70));
  console.log('');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Step 1: Add columns to agents table using direct SQL
    console.log('Step 1: Adding elimination columns to agents table...');
    console.log('  This requires manually running SQL in Supabase dashboard.\n');
    console.log('  Please run the following SQL in your Supabase SQL Editor:');
    console.log('  ' + '-'.repeat(66));
    console.log(`
-- Add elimination tracking columns to agents table
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS is_eliminated BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS eliminated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS elimination_order INTEGER;

-- Create index for efficient queries on eliminated status
CREATE INDEX IF NOT EXISTS idx_agents_elimination ON agents(is_eliminated, elimination_order);
    `);
    console.log('  ' + '-'.repeat(66));
    console.log('');
    console.log('  After running the SQL, press Enter to continue...');

    // Wait for user confirmation (skip in non-interactive mode)
    if (process.stdin.isTTY) {
      await new Promise((resolve) => {
        process.stdin.once('data', resolve);
      });
    } else {
      console.log('  Skipping confirmation in non-interactive mode...\n');
    }

    console.log('  ✓ Proceeding with GPT-5 update\n');

    // Step 2: Mark GPT-5 as eliminated
    console.log('Step 2: Marking GPT-5 as eliminated...');

    const { data, error: updateError } = await supabase
      .from('agents')
      .update({
        is_eliminated: true,
        eliminated_at: new Date().toISOString(),
        elimination_order: 1
      })
      .eq('id', GPT5_ID)
      .select();

    if (updateError) throw updateError;

    if (data && data.length > 0) {
      console.log('  ✓ GPT-5 marked as eliminated');
      console.log(`    - Agent: ${data[0].name}`);
      console.log(`    - Eliminated at: ${data[0].eliminated_at}`);
      console.log(`    - Elimination order: ${data[0].elimination_order}`);
    } else {
      console.log('  ⚠️  GPT-5 not found or not updated');
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('MIGRATION COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70));

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runMigration };
