#!/usr/bin/env node
/**
 * Data Validation Script
 * Validates data consistency between MySQL and PostgreSQL databases
 */

const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const chalk = require('chalk');
const ora = require('ora');
require('dotenv').config();

// Database connections
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'plp_legacy'
};

const pgPool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || 'plp_new',
  port: process.env.PG_PORT || 5432
});

// Validation results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

/**
 * Main validation function
 */
async function validateAllData() {
  console.log(chalk.cyan('=== PLP Data Validation ===\n'));
  const spinner = ora('Starting validation...').start();
  let mysqlConnection;

  try {
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    // Run all validations
    await validateUserCounts(mysqlConnection, spinner);
    await validateChildrenCounts(mysqlConnection, spinner);
    await validateUserData(mysqlConnection, spinner);
    await validateExerciseData(mysqlConnection, spinner);
    await validateForumData(mysqlConnection, spinner);
    await validatePaymentData(mysqlConnection, spinner);
    await validateDataIntegrity(mysqlConnection, spinner);
    
    spinner.succeed('Validation completed!');
    printResults();

  } catch (error) {
    spinner.fail('Validation failed!');
    console.error(chalk.red('Error:'), error.message);
  } finally {
    if (mysqlConnection) await mysqlConnection.end();
    await pgPool.end();
  }
}

/**
 * Validate user counts
 */
async function validateUserCounts(mysqlConnection, spinner) {
  spinner.text = 'Validating user counts...';
  
  try {
    // Get MySQL count
    const [mysqlResult] = await mysqlConnection.execute(
      'SELECT COUNT(*) as total, COUNT(DISTINCT usrPhone) as unique_phones FROM tbl_users_register'
    );
    
    // Get PostgreSQL count
    const pgResult = await pgPool.query(
      'SELECT COUNT(*) as total, COUNT(DISTINCT phone) as unique_phones FROM users'
    );
    
    const mysqlCount = mysqlResult[0].total;
    const pgCount = parseInt(pgResult.rows[0].total);
    
    if (mysqlCount === pgCount) {
      results.passed.push(`✓ User count matches: ${mysqlCount}`);
    } else {
      results.failed.push(`✗ User count mismatch: MySQL=${mysqlCount}, PostgreSQL=${pgCount}`);
    }
    
    // Check unique phones
    const mysqlPhones = mysqlResult[0].unique_phones;
    const pgPhones = parseInt(pgResult.rows[0].unique_phones);
    
    if (mysqlPhones === pgPhones) {
      results.passed.push(`✓ Unique phone count matches: ${mysqlPhones}`);
    } else {
      results.failed.push(`✗ Phone count mismatch: MySQL=${mysqlPhones}, PostgreSQL=${pgPhones}`);
    }
    
  } catch (error) {
    results.failed.push(`✗ User count validation error: ${error.message}`);
  }
}

/**
 * Validate children counts
 */
async function validateChildrenCounts(mysqlConnection, spinner) {
  spinner.text = 'Validating children counts...';
  
  try {
    const [mysqlResult] = await mysqlConnection.execute(
      'SELECT COUNT(*) as total FROM tbl_child'
    );
    
    const pgResult = await pgPool.query(
      'SELECT COUNT(*) as total FROM children'
    );
    
    const mysqlCount = mysqlResult[0].total;
    const pgCount = parseInt(pgResult.rows[0].total);
    
    if (mysqlCount === pgCount) {
      results.passed.push(`✓ Children count matches: ${mysqlCount}`);
    } else {
      results.failed.push(`✗ Children count mismatch: MySQL=${mysqlCount}, PostgreSQL=${pgCount}`);
    }
    
  } catch (error) {
    results.failed.push(`✗ Children count validation error: ${error.message}`);
  }
}

/**
 * Validate user data integrity
 */
async function validateUserData(mysqlConnection, spinner) {
  spinner.text = 'Validating user data integrity...';
  
  try {
    // Sample 100 random users for detailed validation
    const [mysqlUsers] = await mysqlConnection.execute(`
      SELECT usrID, usrName, usrPhone, usrEmail, usrGrade
      FROM tbl_users_register
      ORDER BY RAND()
      LIMIT 100
    `);
    
    let mismatches = 0;
    
    for (const mysqlUser of mysqlUsers) {
      const pgResult = await pgPool.query(
        'SELECT full_name, phone, email, grade FROM users WHERE legacy_id = $1',
        [mysqlUser.usrID]
      );
      
      if (pgResult.rows.length === 0) {
        mismatches++;
        results.warnings.push(`⚠ User ${mysqlUser.usrID} not found in PostgreSQL`);
        continue;
      }
      
      const pgUser = pgResult.rows[0];
      
      // Validate fields
      if (mysqlUser.usrName !== pgUser.full_name) {
        mismatches++;
        results.warnings.push(`⚠ Name mismatch for user ${mysqlUser.usrID}`);
      }
      
      if (mysqlUser.usrPhone !== pgUser.phone) {
        mismatches++;
        results.warnings.push(`⚠ Phone mismatch for user ${mysqlUser.usrID}`);
      }
    }
    
    if (mismatches === 0) {
      results.passed.push('✓ User data integrity check passed (100 samples)');
    } else {
      results.failed.push(`✗ Found ${mismatches} data mismatches in user sample`);
    }
    
  } catch (error) {
    results.failed.push(`✗ User data validation error: ${error.message}`);
  }
}

/**
 * Validate exercise data
 */
async function validateExerciseData(mysqlConnection, spinner) {
  spinner.text = 'Validating exercise data...';
  
  try {
    // Check exercise counts for each subject
    const subjects = ['exercise', 'english_exercise', 'khmer_exercise', 'math_exercise', 'science_exercise'];
    
    for (const subject of subjects) {
      const [mysqlResult] = await mysqlConnection.execute(
        `SELECT COUNT(*) as total FROM tbl_${subject}`
      );
      
      const tableName = subject.replace('_exercise', '') + '_exercises';
      const pgResult = await pgPool.query(
        `SELECT COUNT(*) as total FROM ${tableName}`
      );
      
      const mysqlCount = mysqlResult[0].total;
      const pgCount = parseInt(pgResult.rows[0].total);
      
      if (mysqlCount === pgCount) {
        results.passed.push(`✓ ${subject} count matches: ${mysqlCount}`);
      } else {
        results.warnings.push(`⚠ ${subject} count differs: MySQL=${mysqlCount}, PostgreSQL=${pgCount}`);
      }
    }
    
  } catch (error) {
    results.warnings.push(`⚠ Exercise validation error: ${error.message}`);
  }
}

/**
 * Validate forum data
 */
async function validateForumData(mysqlConnection, spinner) {
  spinner.text = 'Validating forum data...';
  
  try {
    // Check forum posts
    const [postsResult] = await mysqlConnection.execute(
      'SELECT COUNT(*) as total FROM tbl_forum_post'
    );
    
    const pgPostsResult = await pgPool.query(
      'SELECT COUNT(*) as total FROM forum_posts'
    );
    
    const mysqlPosts = postsResult[0].total;
    const pgPosts = parseInt(pgPostsResult.rows[0].total);
    
    if (mysqlPosts === pgPosts) {
      results.passed.push(`✓ Forum posts count matches: ${mysqlPosts}`);
    } else {
      results.warnings.push(`⚠ Forum posts differ: MySQL=${mysqlPosts}, PostgreSQL=${pgPosts}`);
    }
    
  } catch (error) {
    results.warnings.push(`⚠ Forum validation error: ${error.message}`);
  }
}

/**
 * Validate payment data
 */
async function validatePaymentData(mysqlConnection, spinner) {
  spinner.text = 'Validating payment data...';
  
  try {
    // Check card requests
    const [cardsResult] = await mysqlConnection.execute(
      'SELECT COUNT(*) as total, SUM(racPrice) as total_amount FROM tbl_request_add_card WHERE racStatus = 1'
    );
    
    const pgCardsResult = await pgPool.query(
      "SELECT COUNT(*) as total, SUM(amount) as total_amount FROM payment_requests WHERE status = 'approved'"
    );
    
    const mysqlCards = cardsResult[0].total;
    const pgCards = parseInt(pgCardsResult.rows[0].total);
    
    if (mysqlCards === pgCards) {
      results.passed.push(`✓ Payment requests count matches: ${mysqlCards}`);
    } else {
      results.warnings.push(`⚠ Payment requests differ: MySQL=${mysqlCards}, PostgreSQL=${pgCards}`);
    }
    
  } catch (error) {
    results.warnings.push(`⚠ Payment validation error: ${error.message}`);
  }
}

/**
 * Validate data integrity and relationships
 */
async function validateDataIntegrity(mysqlConnection, spinner) {
  spinner.text = 'Validating data integrity...';
  
  try {
    // Check orphaned children
    const orphanedResult = await pgPool.query(`
      SELECT COUNT(*) as orphaned
      FROM children c
      WHERE NOT EXISTS (
        SELECT 1 FROM users u WHERE u.id = c.parent_id
      )
    `);
    
    const orphaned = parseInt(orphanedResult.rows[0].orphaned);
    
    if (orphaned === 0) {
      results.passed.push('✓ No orphaned children records');
    } else {
      results.failed.push(`✗ Found ${orphaned} orphaned children records`);
    }
    
    // Check duplicate phones
    const duplicatesResult = await pgPool.query(`
      SELECT phone, COUNT(*) as count
      FROM users
      GROUP BY phone
      HAVING COUNT(*) > 1
    `);
    
    if (duplicatesResult.rows.length === 0) {
      results.passed.push('✓ No duplicate phone numbers');
    } else {
      results.failed.push(`✗ Found ${duplicatesResult.rows.length} duplicate phone numbers`);
    }
    
  } catch (error) {
    results.failed.push(`✗ Integrity validation error: ${error.message}`);
  }
}

/**
 * Print validation results
 */
function printResults() {
  console.log('\n' + chalk.cyan('=== Validation Results ===\n'));
  
  // Passed tests
  if (results.passed.length > 0) {
    console.log(chalk.green('Passed Tests:'));
    results.passed.forEach(test => console.log(chalk.green(test)));
    console.log();
  }
  
  // Failed tests
  if (results.failed.length > 0) {
    console.log(chalk.red('Failed Tests:'));
    results.failed.forEach(test => console.log(chalk.red(test)));
    console.log();
  }
  
  // Warnings
  if (results.warnings.length > 0) {
    console.log(chalk.yellow('Warnings:'));
    results.warnings.slice(0, 10).forEach(warning => console.log(chalk.yellow(warning)));
    if (results.warnings.length > 10) {
      console.log(chalk.yellow(`... and ${results.warnings.length - 10} more warnings`));
    }
    console.log();
  }
  
  // Summary
  const total = results.passed.length + results.failed.length;
  const passRate = total > 0 ? Math.round((results.passed.length / total) * 100) : 0;
  
  console.log(chalk.cyan('=== Summary ==='));
  console.log(`Total Tests: ${total}`);
  console.log(chalk.green(`Passed: ${results.passed.length}`));
  console.log(chalk.red(`Failed: ${results.failed.length}`));
  console.log(chalk.yellow(`Warnings: ${results.warnings.length}`));
  console.log(`Pass Rate: ${passRate}%`);
  
  if (passRate >= 95) {
    console.log(chalk.green('\n✓ Validation successful! Data migration looks good.'));
  } else if (passRate >= 80) {
    console.log(chalk.yellow('\n⚠ Validation passed with warnings. Review failed tests.'));
  } else {
    console.log(chalk.red('\n✗ Validation failed! Critical issues found.'));
  }
}

// Run validation
if (require.main === module) {
  validateAllData().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

module.exports = { validateAllData };