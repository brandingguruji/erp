import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({})

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@brandingguruji.com' },
    update: {},
    create: {
      email: 'admin@brandingguruji.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })

  console.log({ superAdmin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
