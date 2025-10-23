const data = require('./twitter-mentions-backup.json');
console.log('Total tweets:', data.length);
console.log('\nFirst 5 tweets:');
data.slice(0, 5).forEach((t, i) => {
  console.log(`\n${i+1}. @${t.author.userName}`);
  console.log(`   ${t.text.substring(0, 120)}`);
});
