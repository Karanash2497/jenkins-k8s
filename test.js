const fs = require('fs');
const appContent = fs.readFileSync('./app.js', 'utf8');

if (appContent.includes('app.listen')) {
  console.log('✅ TEST PASSED: app.js is valid');
  process.exit(0);
} else {
  console.log('❌ TEST FAILED: app.js missing app.listen');
  process.exit(1);
}
