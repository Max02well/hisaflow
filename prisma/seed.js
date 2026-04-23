import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hisaflow.com' },
    update: {},
    create: {
      email: 'admin@hisaflow.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      whatsappNumber: '254712345678'
    }
  })

  console.log('✅ Created admin user')

  // Create sample products
  const products = [
    {
      name: 'Premium T-Shirt',
      description: '100% cotton comfortable t-shirt',
      price: 1500,
      stock: 50,
      category: 'Clothing',
      sku: 'TS-001',
      userId: admin.id
    },
    {
      name: 'Wireless Headphones',
      description: 'Bluetooth 5.0 with noise cancellation',
      price: 3500,
      stock: 25,
      category: 'Electronics',
      sku: 'WH-001',
      userId: admin.id
    },
    {
      name: 'Leather Wallet',
      description: 'Genuine leather wallet with 6 card slots',
      price: 1200,
      stock: 30,
      category: 'Accessories',
      sku: 'LW-001',
      userId: admin.id
    }
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product
    })
  }

  console.log('✅ Created sample products')
  console.log('🎉 Seeding complete!')
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })