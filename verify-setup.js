#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying PLP setup...\n');

// Check for required files
const requiredFiles = [
  'package.json',
  'pnpm-workspace.yaml',
  '.env',
  'apps/web/package.json',
  'apps/api/package.json',
  'packages/database/package.json',
  'packages/database/prisma/schema.prisma'
];

let allGood = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allGood = false;
});

console.log('\n📦 Checking environment variables...');
const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const hasDbUrl = envFile.includes('DATABASE_URL=');
console.log(`${hasDbUrl ? '✅' : '❌'} DATABASE_URL is configured`);

if (allGood && hasDbUrl) {
  console.log('\n✨ Setup verification complete! You can now run:');
  console.log('   pnpm dev         - Start all services');
  console.log('   pnpm db:studio   - Open database GUI');
} else {
  console.log('\n❌ Some issues found. Please check the errors above.');
}