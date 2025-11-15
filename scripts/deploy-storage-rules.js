#!/usr/bin/env node

/**
 * Script to deploy Firebase Storage rules
 * Run this after Firebase Storage is set up in Firebase Console
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('Deploying Firebase Storage rules...');

try {
  const projectRoot = path.resolve(__dirname, '..');
  process.chdir(projectRoot);
  
  execSync('firebase deploy --only storage', { 
    stdio: 'inherit',
    cwd: projectRoot
  });
  
  console.log('✅ Storage rules deployed successfully!');
} catch (error) {
  console.error('❌ Error deploying storage rules:', error.message);
  console.error('\nMake sure:');
  console.error('1. Firebase Storage is set up in Firebase Console');
  console.error('2. You are logged in: firebase login');
  console.error('3. Firebase CLI is installed: npm install -g firebase-tools');
  process.exit(1);
}

