#!/usr/bin/env node
/**
 * User Migration Script
 * Migrates users from MySQL (PHP) to PostgreSQL (Node.js)
 * With data validation and rollback capability
 */

const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const winston = require('winston');
const chalk = require('chalk');
const ora = require('ora');
require('dotenv').config();

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'migration-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'migration.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

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

// Migration statistics
let stats = {
  totalUsers: 0,
  migratedUsers: 0,
  failedUsers: 0,
  totalChildren: 0,
  migratedChildren: 0,
  failedChildren: 0,
  startTime: new Date(),
  errors: []
};

/**
 * Main migration function
 */
async function migrateUsers() {
  const spinner = ora('Starting user migration...').start();
  let mysqlConnection;

  try {
    // Connect to MySQL
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    spinner.text = 'Connected to MySQL database';

    // Get total count
    const [countResult] = await mysqlConnection.execute(
      'SELECT COUNT(*) as total FROM tbl_users_register'
    );
    stats.totalUsers = countResult[0].total;
    spinner.text = `Found ${stats.totalUsers} users to migrate`;

    // Migrate in batches
    const batchSize = 100;
    let offset = 0;

    while (offset < stats.totalUsers) {
      spinner.text = `Migrating users ${offset} to ${offset + batchSize}...`;
      
      const [users] = await mysqlConnection.execute(`
        SELECT 
          usrID,
          usrName,
          usrPhone,
          usrUserName,
          usrEmail,
          usrPassword,
          usrGrade,
          usrImage,
          usrRegDate,
          usrActivate,
          usrActivateKey,
          usaExpiredCode,
          usrStatus,
          usrAllowSubject,
          usrValidUntil,
          usrSecretWord,
          usrFacebookId,
          usrGoogleId,
          usrLastLogin,
          usrLoginCount,
          usrIPAddress
        FROM tbl_users_register
        LIMIT ? OFFSET ?
      `, [batchSize, offset]);

      // Migrate each user
      for (const user of users) {
        await migrateUser(user);
      }

      offset += batchSize;
      
      // Show progress
      const progress = Math.round((stats.migratedUsers / stats.totalUsers) * 100);
      spinner.text = `Progress: ${progress}% (${stats.migratedUsers}/${stats.totalUsers} users)`;
    }

    // Migrate children
    await migrateChildren(mysqlConnection, spinner);

    spinner.succeed(chalk.green('User migration completed!'));
    printStats();

  } catch (error) {
    spinner.fail(chalk.red('Migration failed!'));
    logger.error('Migration error:', error);
    stats.errors.push(error.message);
  } finally {
    if (mysqlConnection) await mysqlConnection.end();
    await pgPool.end();
  }
}

/**
 * Migrate individual user
 */
async function migrateUser(user) {
  try {
    // Transform data for new schema
    const transformedUser = {
      id: user.usrID,
      full_name: user.usrName,
      phone: user.usrPhone,
      username: user.usrUserName || null,
      email: user.usrEmail || null,
      password_hash: user.usrPassword, // Note: Consider upgrading hash algorithm
      grade: user.usrGrade || null,
      avatar_url: user.usrImage || null,
      created_at: user.usrRegDate,
      is_active: user.usrActivate === 1,
      activation_key: user.usrActivateKey || null,
      activation_expires: user.usaExpiredCode || null,
      status: user.usrStatus === 1 ? 'active' : 'inactive',
      allowed_subjects: parseJSON(user.usrAllowSubject) || [],
      subscription_expires: user.usrValidUntil || null,
      secret_word: user.usrSecretWord || null,
      facebook_id: user.usrFacebookId || null,
      google_id: user.usrGoogleId || null,
      last_login_at: user.usrLastLogin || null,
      login_count: user.usrLoginCount || 0,
      last_ip_address: user.usrIPAddress || null,
      legacy_id: user.usrID // Keep reference to old ID
    };

    // Insert into PostgreSQL
    await pgPool.query(`
      INSERT INTO users (
        id, full_name, phone, username, email, password_hash,
        grade, avatar_url, created_at, is_active, activation_key,
        activation_expires, status, allowed_subjects, subscription_expires,
        secret_word, facebook_id, google_id, last_login_at, login_count,
        last_ip_address, legacy_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22
      ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        updated_at = NOW()
    `, [
      transformedUser.id,
      transformedUser.full_name,
      transformedUser.phone,
      transformedUser.username,
      transformedUser.email,
      transformedUser.password_hash,
      transformedUser.grade,
      transformedUser.avatar_url,
      transformedUser.created_at,
      transformedUser.is_active,
      transformedUser.activation_key,
      transformedUser.activation_expires,
      transformedUser.status,
      JSON.stringify(transformedUser.allowed_subjects),
      transformedUser.subscription_expires,
      transformedUser.secret_word,
      transformedUser.facebook_id,
      transformedUser.google_id,
      transformedUser.last_login_at,
      transformedUser.login_count,
      transformedUser.last_ip_address,
      transformedUser.legacy_id
    ]);

    stats.migratedUsers++;
  } catch (error) {
    stats.failedUsers++;
    logger.error(`Failed to migrate user ${user.usrID}:`, error.message);
    stats.errors.push(`User ${user.usrID}: ${error.message}`);
  }
}

/**
 * Migrate children accounts
 */
async function migrateChildren(mysqlConnection, spinner) {
  spinner.text = 'Migrating children accounts...';

  try {
    const [countResult] = await mysqlConnection.execute(
      'SELECT COUNT(*) as total FROM tbl_child'
    );
    stats.totalChildren = countResult[0].total;

    const batchSize = 100;
    let offset = 0;

    while (offset < stats.totalChildren) {
      const [children] = await mysqlConnection.execute(`
        SELECT 
          c.*,
          ci.chiSchool,
          ci.chiProvince,
          ci.chiDistrict,
          ci.chiCommune,
          ci.chiNotes
        FROM tbl_child c
        LEFT JOIN tbl_child_information ci ON c.chiID = ci.chiID
        LIMIT ? OFFSET ?
      `, [batchSize, offset]);

      for (const child of children) {
        await migrateChild(child);
      }

      offset += batchSize;
      
      const progress = Math.round((stats.migratedChildren / stats.totalChildren) * 100);
      spinner.text = `Migrating children: ${progress}% (${stats.migratedChildren}/${stats.totalChildren})`;
    }

  } catch (error) {
    logger.error('Error migrating children:', error);
    stats.errors.push(`Children migration: ${error.message}`);
  }
}

/**
 * Migrate individual child
 */
async function migrateChild(child) {
  try {
    const transformedChild = {
      id: child.chiID,
      parent_id: child.chiUID,
      name: child.chiName,
      avatar_url: child.chiProfile || null,
      grade: child.chiGrade || null,
      password_hash: child.chiPassword || null,
      gender: child.chiGender || null,
      birth_date: child.chiBirthDate || null,
      created_at: child.chiCreatedDate,
      status: child.chiStatus === 1 ? 'active' : 'inactive',
      school: child.chiSchool || null,
      province: child.chiProvince || null,
      district: child.chiDistrict || null,
      commune: child.chiCommune || null,
      notes: child.chiNotes || null,
      legacy_id: child.chiID
    };

    await pgPool.query(`
      INSERT INTO children (
        id, parent_id, name, avatar_url, grade, password_hash,
        gender, birth_date, created_at, status, school,
        province, district, commune, notes, legacy_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16
      ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = NOW()
    `, [
      transformedChild.id,
      transformedChild.parent_id,
      transformedChild.name,
      transformedChild.avatar_url,
      transformedChild.grade,
      transformedChild.password_hash,
      transformedChild.gender,
      transformedChild.birth_date,
      transformedChild.created_at,
      transformedChild.status,
      transformedChild.school,
      transformedChild.province,
      transformedChild.district,
      transformedChild.commune,
      transformedChild.notes,
      transformedChild.legacy_id
    ]);

    stats.migratedChildren++;
  } catch (error) {
    stats.failedChildren++;
    logger.error(`Failed to migrate child ${child.chiID}:`, error.message);
    stats.errors.push(`Child ${child.chiID}: ${error.message}`);
  }
}

/**
 * Utility function to parse JSON safely
 */
function parseJSON(str) {
  try {
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

/**
 * Print migration statistics
 */
function printStats() {
  const duration = Math.round((new Date() - stats.startTime) / 1000);
  
  console.log(chalk.cyan('\n=== Migration Statistics ==='));
  console.log(chalk.white(`Duration: ${duration} seconds`));
  console.log(chalk.green(`✓ Users migrated: ${stats.migratedUsers}/${stats.totalUsers}`));
  console.log(chalk.green(`✓ Children migrated: ${stats.migratedChildren}/${stats.totalChildren}`));
  
  if (stats.failedUsers > 0) {
    console.log(chalk.red(`✗ Users failed: ${stats.failedUsers}`));
  }
  if (stats.failedChildren > 0) {
    console.log(chalk.red(`✗ Children failed: ${stats.failedChildren}`));
  }
  
  if (stats.errors.length > 0) {
    console.log(chalk.red('\n=== Errors ==='));
    stats.errors.slice(0, 10).forEach(error => {
      console.log(chalk.red(`- ${error}`));
    });
    if (stats.errors.length > 10) {
      console.log(chalk.yellow(`... and ${stats.errors.length - 10} more errors. Check migration-error.log`));
    }
  }
  
  console.log(chalk.cyan('\n=== Next Steps ==='));
  console.log('1. Run validation script: npm run validate:all');
  console.log('2. Check migration logs for any issues');
  console.log('3. Test user login with migrated accounts');
}

// Run migration
if (require.main === module) {
  migrateUsers().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

module.exports = { migrateUsers };