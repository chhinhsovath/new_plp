#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for output
const colors = {
  reset: '\033[0m',
  red: '\033[0;31m',
  green: '\033[0;32m',
  yellow: '\033[1;33m',
  blue: '\033[0;34m',
  cyan: '\033[0;36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description}`, 'red');
    return false;
  }
}

function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'blue');
    execSync(command, { stdio: 'pipe' });
    log(`✓ ${description}`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${description}`, 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🔍 Verifying PLP Project Build Status\n', 'cyan');

  let allChecksPass = true;

  // Check project structure
  log('📁 Checking project structure:', 'yellow');
  allChecksPass &= checkFile('package.json', 'Root package.json exists');
  allChecksPass &= checkFile('turbo.json', 'Turbo configuration exists');
  allChecksPass &= checkFile('pnpm-workspace.yaml', 'pnpm workspace configuration exists');
  allChecksPass &= checkFile('apps/web/package.json', 'Frontend package.json exists');
  allChecksPass &= checkFile('apps/api/package.json', 'Backend package.json exists');
  allChecksPass &= checkFile('packages/database/package.json', 'Database package.json exists');
  console.log();

  // Check environment files
  log('🔧 Checking environment configuration:', 'yellow');
  allChecksPass &= checkFile('apps/web/.env.local', 'Frontend environment file exists');
  allChecksPass &= checkFile('apps/api/.env', 'Backend environment file exists');
  allChecksPass &= checkFile('packages/database/.env', 'Database environment file exists');
  console.log();

  // Check dependencies
  log('📦 Checking dependencies:', 'yellow');
  allChecksPass &= checkFile('node_modules', 'Dependencies installed');
  allChecksPass &= checkFile('apps/web/node_modules', 'Frontend dependencies installed');
  allChecksPass &= checkFile('apps/api/node_modules', 'Backend dependencies installed');
  console.log();

  // Check database
  log('💾 Checking database:', 'yellow');
  allChecksPass &= runCommand('pnpm -F @plp/database db:generate', 'Prisma client generation');
  
  // Try to connect to database
  try {
    const { PrismaClient } = require('./packages/database/dist/index.js');
    const prisma = new PrismaClient();
    await prisma.$connect();
    log('✓ Database connection successful', 'green');
    await prisma.$disconnect();
  } catch (error) {
    log('✗ Database connection failed', 'red');
    log(`Error: ${error.message}`, 'red');
    allChecksPass = false;
  }
  console.log();

  // Check build capability
  log('🏗️ Checking build capability:', 'yellow');
  allChecksPass &= runCommand('pnpm typecheck', 'TypeScript type checking');
  console.log();

  // Check if we can start development servers
  log('🚀 Checking development servers:', 'yellow');
  
  // Test if ports are available
  const net = require('net');
  
  const checkPort = (port, service) => {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.close(() => {
          log(`✓ Port ${port} available for ${service}`, 'green');
          resolve(true);
        });
      });
      server.on('error', () => {
        log(`✗ Port ${port} in use (${service})`, 'red');
        resolve(false);
      });
    });
  };

  const port3000Available = await checkPort(3000, 'Frontend');
  const port3001Available = await checkPort(3001, 'Backend');
  
  allChecksPass &= port3000Available;
  allChecksPass &= port3001Available;
  console.log();

  // Final summary
  if (allChecksPass) {
    log('🎉 All checks passed! Project is ready to run.', 'green');
    log('\nTo start the project:', 'cyan');
    log('  pnpm dev        # Start both frontend and backend', 'blue');
    log('  pnpm dev:web    # Start frontend only', 'blue');
    log('  pnpm dev:api    # Start backend only', 'blue');
    log('\nAccess points:', 'cyan');
    log('  Frontend: http://localhost:3000', 'blue');
    log('  Backend: http://localhost:3001', 'blue');
    log('  Database Studio: pnpm db:studio', 'blue');
  } else {
    log('❌ Some checks failed. Please fix the issues above.', 'red');
    log('\nCommon solutions:', 'cyan');
    log('  1. Run: pnpm install', 'blue');
    log('  2. Check MySQL is running', 'blue');
    log('  3. Configure environment files', 'blue');
    log('  4. Run: pnpm db:push', 'blue');
    log('  5. See BUILD_AND_RUN_GUIDE.md for details', 'blue');
  }

  process.exit(allChecksPass ? 0 : 1);
}

main().catch(console.error);