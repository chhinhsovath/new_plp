#!/bin/bash

echo "🚀 Starting PLP Development Environment..."
echo ""

# Check if database is running
echo "📊 Checking database connection..."
DATABASE_URL="postgresql://postgres:12345@localhost:5432/new_plp" psql -c "SELECT 1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database is connected"
else
    echo "❌ Database connection failed. Please ensure PostgreSQL is running."
    echo "   Connection string: postgresql://postgres:12345@localhost:5432/new_plp"
    exit 1
fi

echo ""
echo "🔧 Starting development servers..."
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:4000"
echo "   Database Studio: Run 'pnpm db:studio' in another terminal"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start both servers
pnpm dev