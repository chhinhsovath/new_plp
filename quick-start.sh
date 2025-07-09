#!/bin/bash

# Primary Learning Platform - Quick Start Script
# This script sets up and runs the PLP project

echo "🚀 Starting PLP Project Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt "18" ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_status "Node.js version: $(node --version) ✓"
print_status "pnpm version: $(pnpm --version) ✓"

# Install dependencies
print_status "Installing dependencies..."
pnpm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_status "Dependencies installed successfully ✓"

# Check if database is configured
if [ ! -f "packages/database/.env" ]; then
    print_warning "Database environment file not found. Creating default..."
    echo 'DATABASE_URL="mysql://root:123456@localhost:3306/new_plp"' > packages/database/.env
fi

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    print_warning "MySQL server is not running. Please start MySQL:"
    echo "  macOS: brew services start mysql"
    echo "  Linux: sudo systemctl start mysql"
    echo ""
    echo "After starting MySQL, run this script again."
    exit 1
fi

print_status "MySQL server is running ✓"

# Setup database
print_status "Setting up database..."
pnpm db:push

if [ $? -ne 0 ]; then
    print_error "Failed to setup database. Please check your MySQL connection."
    exit 1
fi

print_status "Database schema created ✓"

# Seed database
print_status "Seeding database with test data..."
pnpm db:seed

if [ $? -ne 0 ]; then
    print_error "Failed to seed database"
    exit 1
fi

print_status "Database seeded successfully ✓"

# Check environment files
print_status "Checking environment configuration..."

if [ ! -f "apps/web/.env.local" ]; then
    print_warning "Frontend environment file not found"
    print_status "Please configure apps/web/.env.local with your Clerk keys"
fi

if [ ! -f "apps/api/.env" ]; then
    print_warning "Backend environment file not found"
    print_status "Please configure apps/api/.env with your Clerk keys"
fi

print_status "Environment files created ✓"

# Final instructions
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure Clerk authentication keys in:"
echo "   - apps/web/.env.local"
echo "   - apps/api/.env"
echo ""
echo "2. Start the development servers:"
echo "   ${BLUE}pnpm dev${NC}    # Run both frontend and backend"
echo "   ${BLUE}pnpm dev:web${NC} # Run frontend only"
echo "   ${BLUE}pnpm dev:api${NC} # Run backend only"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - Database Studio: pnpm db:studio"
echo ""
echo "📚 Test accounts (after configuring Clerk):"
echo "   - Admin: admin@plp.edu.kh"
echo "   - Teacher: sokha.teacher@plp.edu.kh"
echo "   - Student: virak.student@plp.edu.kh"
echo ""
echo "For detailed instructions, see BUILD_AND_RUN_GUIDE.md"
echo ""

# Ask if user wants to start development servers
read -p "Do you want to start the development servers now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting development servers..."
    pnpm dev
else
    print_status "Setup complete. Run 'pnpm dev' when you're ready to start!"
fi