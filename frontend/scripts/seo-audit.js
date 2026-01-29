#!/usr/bin/env node
/**
 * SEO Audit Script
 * Checks for common SEO issues in the codebase
 *
 * Usage: node scripts/seo-audit.js
 */

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '../src/app');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

const issues = [];
const warnings = [];
const successes = [];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(APP_DIR, filePath);

  // Check for metadata export
  const hasMetadata = content.includes('export const metadata') || content.includes('export async function generateMetadata');

  // Check for canonical tag in metadata
  const hasCanonical = content.includes('canonical:') || content.includes('alternates:');

  // Check for robots configuration
  const hasRobots = content.includes('robots:');

  // Check for OpenGraph
  const hasOpenGraph = content.includes('openGraph:');

  return {
    path: relativePath,
    hasMetadata,
    hasCanonical,
    hasRobots,
    hasOpenGraph,
  };
}

function findPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (!file.startsWith('.') && file !== 'node_modules') {
        findPageFiles(filePath, fileList);
      }
    } else if (file === 'page.tsx' || file === 'layout.tsx') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function analyzeRoute(filePath, analysis) {
  const relativePath = analysis.path;
  const routePath = relativePath
    .replace(/\\/g, '/')
    .replace(/page\.tsx$/, '')
    .replace(/layout\.tsx$/, '')
    .replace(/\/$/, '') || '/';

  const isLayoutFile = filePath.endsWith('layout.tsx');
  const isPageFile = filePath.endsWith('page.tsx');

  // Page files should have metadata (or their layout should)
  if (isPageFile) {
    if (!analysis.hasMetadata) {
      warnings.push(`⚠️  Page missing metadata: ${routePath}`);
    }

    if (!analysis.hasCanonical) {
      warnings.push(`⚠️  Page missing canonical tag: ${routePath}`);
    }

    if (analysis.hasMetadata && analysis.hasCanonical) {
      successes.push(`✅ ${routePath}`);
    }
  }

  // Layout files often have metadata
  if (isLayoutFile && analysis.hasMetadata) {
    successes.push(`✅ ${routePath} (layout)`);
  }
}

function checkSitemapExists() {
  const sitemapPath = path.join(APP_DIR, 'sitemap.xml', 'route.ts');
  const sitemapIndexPath = path.join(APP_DIR, 'sitemap-index.xml', 'route.ts');
  const robotsPath = path.join(APP_DIR, 'robots.ts');

  if (fs.existsSync(sitemapPath)) {
    successes.push('✅ Sitemap configuration found');
  } else {
    issues.push('❌ Missing sitemap configuration');
  }

  if (fs.existsSync(sitemapIndexPath)) {
    successes.push('✅ Sitemap index configuration found');
  } else {
    issues.push('❌ Missing sitemap index configuration');
  }

  if (fs.existsSync(robotsPath)) {
    successes.push('✅ Robots.txt configuration found');
  } else {
    issues.push('❌ Missing robots.txt configuration');
  }
}

function main() {
  console.log('🔍 Starting SEO Audit...\n');
  console.log(`📁 Scanning directory: ${APP_DIR}\n`);

  // Check sitemap and robots
  checkSitemapExists();

  // Find all page and layout files
  const files = findPageFiles(APP_DIR);
  console.log(`📄 Found ${files.length} page/layout files\n`);

  // Analyze each file
  files.forEach(file => {
    const analysis = checkFile(file);
    analyzeRoute(file, analysis);
  });

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('SEO AUDIT RESULTS');
  console.log('='.repeat(60) + '\n');

  if (issues.length > 0) {
    console.log('🚨 CRITICAL ISSUES:\n');
    issues.forEach(issue => console.log(issue));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${warnings.length}):\n`);
    warnings.forEach(warning => console.log(warning));
    console.log('');
  }

  console.log(`✅ PASSING (${successes.length}):\n`);
  if (successes.length <= 10) {
    successes.forEach(success => console.log(success));
  } else {
    console.log(`${successes.length} routes have proper SEO configuration`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files checked: ${files.length}`);
  console.log(`✅ Passing: ${successes.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);
  console.log(`❌ Critical issues: ${issues.length}`);

  console.log('\n' + '='.repeat(60));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(60));

  if (warnings.length > 0) {
    console.log('\n1. Pages with warnings may need metadata added:');
    console.log('   - Add generateMetadata() function to page.tsx');
    console.log('   - OR add metadata export to layout.tsx');
    console.log('   - Always include canonical URL');
  }

  console.log('\n2. Submit sitemaps to Google Search Console:');
  console.log(`   - ${SITE_URL}/sitemap-index.xml`);
  console.log(`   - ${SITE_URL}/sitemap-static.xml`);
  console.log(`   - ${SITE_URL}/sitemap-salons.xml`);

  console.log('\n3. Monitor indexing in Google Search Console:');
  console.log('   - Check Coverage report');
  console.log('   - Use URL Inspection tool for failed pages');
  console.log('   - Request indexing for important pages');

  console.log('\n4. For detailed guidance, see: SEO_FIX_GUIDE.md\n');

  // Exit with error code if there are critical issues
  process.exit(issues.length > 0 ? 1 : 0);
}

main();
