import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

const DEEPSEEK_ID = '32c614c8-c36b-49a6-abd1-a36620dfd359';

async function eliminateDeepSeek() {
  console.log('='.repeat(70));
  console.log('MARKING DEEPSEEK AS ELIMINATED (3RD AGENT)');
  console.log('='.repeat(70));
  console.log('');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    console.log('Marking DeepSeek V3 as eliminated...');

    const { data, error: updateError } = await supabase
      .from('agents')
      .update({
        is_eliminated: true,
        eliminated_at: new Date().toISOString(),
        elimination_order: 3
      })
      .eq('id', DEEPSEEK_ID)
      .select();

    if (updateError) throw updateError;

    if (data && data.length > 0) {
      console.log('  ✓ DeepSeek V3 marked as eliminated');
      console.log(`    - Agent: ${data[0].name}`);
      console.log(`    - Eliminated at: ${data[0].eliminated_at}`);
      console.log(`    - Elimination order: ${data[0].elimination_order}`);
    } else {
      console.log('  ⚠️  DeepSeek not found or not updated');
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
  eliminateDeepSeek()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { eliminateDeepSeek };
