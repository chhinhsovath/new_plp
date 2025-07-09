import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Read and execute legacy tables migration
    const legacyTablesSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/add_legacy_tables.sql'),
      'utf8'
    );
    
    // Split SQL into individual statements
    const statements = legacyTablesSQL
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .filter(stmt => !stmt.trim().startsWith('/*!') && !stmt.trim().startsWith('SET'));
    
    console.log(`Executing ${statements.length} statements for legacy tables...`);
    
    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement + ';');
      } catch (error: any) {
        // Ignore "table already exists" errors
        if (!error.message.includes('already exists')) {
          console.error('Error executing statement:', error.message);
        }
      }
    }
    
    // Read and execute missing feature tables migration
    const featureTablesSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/add_missing_feature_tables.sql'),
      'utf8'
    );
    
    const featureStatements = featureTablesSQL
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .filter(stmt => !stmt.trim().startsWith('/*!') && !stmt.trim().startsWith('SET'));
    
    console.log(`Executing ${featureStatements.length} statements for feature tables...`);
    
    for (const statement of featureStatements) {
      try {
        await prisma.$executeRawUnsafe(statement + ';');
      } catch (error: any) {
        // Ignore "table already exists" errors
        if (!error.message.includes('already exists')) {
          console.error('Error executing statement:', error.message);
        }
      }
    }
    
    console.log('Migrations completed successfully!');
    
    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      ORDER BY table_name
    ` as any[];
    
    console.log('\nCurrent tables in database:');
    tables.forEach((table: any) => {
      console.log(`- ${table.table_name || table.TABLE_NAME}`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigrations();