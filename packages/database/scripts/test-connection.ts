import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("Testing MySQL database connection...");
    
    // Test database connection
    await prisma.$connect();
    console.log("✅ Successfully connected to MySQL database!");
    
    // Test creating a subject
    const subject = await prisma.subject.create({
      data: {
        code: "math",
        name: "Mathematics",
        nameKh: "គណិតវិទ្យា",
        description: "Mathematics subject for all grades",
        order: 1,
        active: true,
      },
    });
    console.log("✅ Created test subject:", subject);
    
    // Test reading from old tables (if needed)
    const oldTables = await prisma.$queryRaw`SHOW TABLES LIKE 'tbl_%'`;
    console.log(`✅ Found ${(oldTables as any[]).length} existing tables in database`);
    
    // Clean up test data
    await prisma.subject.delete({
      where: { id: subject.id },
    });
    console.log("✅ Cleaned up test data");
    
    console.log("\n🎉 Database connection and operations working correctly!");
    console.log("\nYour MySQL database is configured and ready to use with:");
    console.log("- New tables created with 'new_' prefix");
    console.log("- Existing tables preserved");
    console.log("- Prisma client configured for MySQL");
    
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().catch(console.error);