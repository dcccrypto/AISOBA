const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('Successfully connected to database!')
    console.log('Database version:', result)

    // Test User table
    const userCount = await prisma.user.count()
    console.log('Current user count:', userCount)

    // Test creating a user
    const testUser = await prisma.user.create({
      data: {
        wallet: `test-wallet-${Date.now()}`,
      },
    })
    console.log('Successfully created test user:', testUser)

    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id },
    })
    console.log('Successfully cleaned up test user')

  } catch (error) {
    console.error('Database test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 
main() 