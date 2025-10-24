import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

const GROK_ID = 'd8ed8ce7-ea5b-48dd-a4ab-22488da3f2ce';

async function eliminateGrok() {
  console.log('='.repeat(70));
  console.log('MARKING GROK AS ELIMINATED (2ND AGENT)');
  console.log('='.repeat(70));
  console.log('');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    console.log('Marking Grok 4 as eliminated...');

    const { data, error: updateError } = await supabase
      .from('agents')
      .update({
        is_eliminated: true,
        eliminated_at: new Date().toISOString(),
        elimination_order: 2
      })
      .eq('id', GROK_ID)
      .select();

    if (updateError) throw updateError;

    if (data && data.length > 0) {
      console.log('  ✓ Grok 4 marked as eliminated');
      console.log(`    - Agent: ${data[0].name}`);
      console.log(`    - Eliminated at: ${data[0].eliminated_at}`);
      console.log(`    - Elimination order: ${data[0].elimination_order}`);
    } else {
      console.log('  ⚠️  Grok not found or not updated');
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('ELIMINATION COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70));

  } catch (error: any) {
    console.error('\n❌ Elimination failed:', error.message);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  eliminateGrok()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { eliminateGrok };
