import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .from('team_declarations')
    .select('*')
    .order('declared_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('='.repeat(70));
  console.log('VALIDIERUNG ALLER DB-EINTRÄGE');
  console.log('='.repeat(70));
  console.log('');

  const validDeclarations: any[] = [];
  const invalidDeclarations: any[] = [];

  data?.forEach(d => {
    // Check if tweet text matches the template
    const hasTemplate = /I declare that I will join .+?'s team in @TrenchMarking/i.test(d.tweet_text);

    if (hasTemplate) {
      validDeclarations.push(d);
    } else {
      invalidDeclarations.push(d);
    }
  });

  console.log(`✅ VALIDE TEAM DECLARATIONS: ${validDeclarations.length}`);
  console.log('='.repeat(70));
  validDeclarations.forEach((d, i) => {
    const time = new Date(d.declared_at).toLocaleString('de-DE');
    console.log(`\n${i+1}. @${d.twitter_username} (${time})`);
    console.log(`   Tweet: ${d.tweet_text.substring(0, 100)}...`);
    console.log(`   Tweet ID: ${d.tweet_id}`);
  });

  console.log('\n\n');
  console.log(`❌ INVALIDE EINTRÄGE (Spam/Fehler): ${invalidDeclarations.length}`);
  console.log('='.repeat(70));
  invalidDeclarations.forEach((d, i) => {
    const time = new Date(d.declared_at).toLocaleString('de-DE');
    console.log(`\n${i+1}. @${d.twitter_username} (${time})`);
    console.log(`   Tweet: ${d.tweet_text.substring(0, 100)}...`);
    console.log(`   Tweet ID: ${d.tweet_id}`);
    console.log(`   ⚠️  KEIN "I declare" Template!`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('ZUSAMMENFASSUNG');
  console.log('='.repeat(70));
  console.log(`Total Einträge in DB:     ${data.length}`);
  console.log(`Valide Declarations:      ${validDeclarations.length}`);
  console.log(`Invalide Einträge:        ${invalidDeclarations.length}`);
  console.log('='.repeat(70));
}

main();
