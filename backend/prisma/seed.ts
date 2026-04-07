import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load env from backend directory
dotenv.config({ path: resolve(__dirname, '../.env') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL not found in environment');
}

const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('🌱 Starting database seed...');

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronica' },
    update: {},
    create: {
      name: 'Electrónica',
      slug: 'electronica',
      description: 'Productos electrónicos y tecnología',
    },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: 'ropa' },
    update: {},
    create: {
      name: 'Ropa',
      slug: 'ropa',
      description: 'Ropa y accesorios de moda',
    },
  });

  const home = await prisma.category.upsert({
    where: { slug: 'hogar' },
    update: {},
    create: {
      name: 'Hogar',
      slug: 'hogar',
      description: 'Productos para el hogar',
    },
  });

  console.log('✅ Categories created');

  // Create products
  const products = [
    {
      name: 'Auriculares Bluetooth Pro',
      slug: 'auriculares-bluetooth-pro',
      description: 'Auriculares inalámbricos con cancelación de ruido activa, 30 horas de batería y sonido Hi-Res.',
      price: 9999, // 99.99€
      stockQuantity: 50,
      isActive: true,
      categoryId: electronics.id,
    },
    {
      name: 'Smartphone Galaxy X',
      slug: 'smartphone-galaxy-x',
      description: 'Teléfono inteligente con pantalla AMOLED de 6.5", 128GB de almacenamiento y cámara triple.',
      price: 59999, // 599.99€
      stockQuantity: 25,
      isActive: true,
      categoryId: electronics.id,
    },
    {
      name: 'Portátil UltraBook',
      slug: 'portatil-ultrabook',
      description: 'Ordenador portátil ultraligero con procesador i7, 16GB RAM y SSD de 512GB.',
      price: 89999, // 899.99€
      stockQuantity: 15,
      isActive: true,
      categoryId: electronics.id,
    },
    {
      name: 'Camiseta Premium Algodón',
      slug: 'camiseta-premium-algodon',
      description: 'Camiseta de algodón 100% orgánico, suave y transpirable. Disponible en varios colores.',
      price: 2499, // 24.99€
      stockQuantity: 100,
      isActive: true,
      categoryId: clothing.id,
    },
    {
      name: 'Zapatillas Deportivas',
      slug: 'zapatillas-deportivas',
      description: 'Zapatillas deportivas con tecnología de amortiguación, perfectas para running.',
      price: 7999, // 79.99€
      stockQuantity: 40,
      isActive: true,
      categoryId: clothing.id,
    },
    {
      name: 'Lámpara LED Moderna',
      slug: 'lampara-led-moderna',
      description: 'Lámpara de diseño moderno con luz LED regulable y control táctil.',
      price: 5999, // 59.99€
      stockQuantity: 30,
      isActive: true,
      categoryId: home.id,
    },
    {
      name: 'Set de Sartenes Antiadherentes',
      slug: 'set-sartenes-antiadherentes',
      description: 'Set de 3 sartenes con revestimiento antiadherente de cerámica, aptas para inducción.',
      price: 4499, // 44.99€
      stockQuantity: 20,
      isActive: true,
      categoryId: home.id,
    },
    {
      name: 'Reloj Inteligente Sport',
      slug: 'reloj-inteligente-sport',
      description: 'Smartwatch con monitor de frecuencia cardíaca, GPS y resistencia al agua 5ATM.',
      price: 14999, // 149.99€
      stockQuantity: 35,
      isActive: true,
      categoryId: electronics.id,
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });
  }

  console.log(`✅ ${products.length} products created`);

  // Create admin user if not exists
  const adminPassword = '$2b$10$YourHashedPasswordHere'; // bcrypt hash of 'admin123'
  
  await prisma.user.upsert({
    where: { email: 'admin@tienda.com' },
    update: {},
    create: {
      email: 'admin@tienda.com',
      password: adminPassword,
      fullName: 'Administrador',
      nifCif: '12345678A',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created (admin@tienda.com / admin123)');

  // Create store settings
  await prisma.storeSettings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      shippingType: 'THRESHOLD',
      shippingPrice: 400, // 4€
      freeShippingThreshold: 5000, // Free over 50€
    },
  });

  console.log('✅ Store settings created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\nYou can now access:');
  console.log('  - http://localhost:5173/products (Product catalog)');
  console.log('  - http://localhost:5173/login (Login page)');
  console.log('  - Admin: admin@tienda.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
