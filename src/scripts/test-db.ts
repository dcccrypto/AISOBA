const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // Test connection
    await prisma.$connect()
    console.log('Successfully connected to database')

    // Create a test user
    const user = await prisma.user.create({
      data: {
        wallet: 'test-wallet-address',
      },
    })
    console.log('Created test user:', user)

  } catch (error) {
    console.error('Database connection error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 