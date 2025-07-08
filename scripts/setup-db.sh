#!/bin/bash

# Database setup script for local development

echo "🚀 Setting up PostgreSQL database for PLP..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql"
    exit 1
fi

# Database configuration
DB_NAME="plp_dev"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Create database if it doesn't exist
echo "📦 Creating database..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo "Database $DB_NAME already exists"

# Push Prisma schema
echo "🔧 Pushing Prisma schema..."
cd packages/database
pnpm db:push

# Seed the database
echo "🌱 Seeding database..."
pnpm db:seed

echo "✅ Database setup complete!"
echo ""
echo "📋 Database connection info:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo ""
echo "🔗 Connection string: postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"