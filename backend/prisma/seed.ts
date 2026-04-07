// Seed usando la configuración existente del proyecto
import { prisma } from '../src/shared/infra/prisma/client';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@tienda.com' },
      update: {},
      create: {
        email: 'admin@tienda.com',
        passwordHash: adminPassword,
        fullName: 'Administrador',
        nifCif: '12345678Z',
        role: 'ADMIN',
        address: {
          street: 'Calle Admin 123',
          postalCode: '28001',
          city: 'Madrid',
          province: 'Madrid',
          country: 'España',
        },
      },
    });
    console.log('✅ Admin user created: admin@tienda.com / admin123');

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
        description: 'Auriculares inalámbricos con cancelación de ruido activa, 30 horas de batería.',
        price: 9999,
        stockQuantity: 50,
        isActive: true,
        categoryId: electronics.id,
      },
      {
        name: 'Smartphone Galaxy X',
        slug: 'smartphone-galaxy-x',
        description: 'Teléfono inteligente con pantalla AMOLED de 6.5", 128GB de almacenamiento.',
        price: 59999,
        stockQuantity: 25,
        isActive: true,
        categoryId: electronics.id,
      },
      {
        name: 'Portátil UltraBook',
        slug: 'portatil-ultrabook',
        description: 'Ordenador portátil ultraligero con procesador i7, 16GB RAM.',
        price: 89999,
        stockQuantity: 15,
        isActive: true,
        categoryId: electronics.id,
      },
      {
        name: 'Camiseta Premium',
        slug: 'camiseta-premium',
        description: 'Camiseta de algodón 100% orgánico, suave y transpirable.',
        price: 2499,
        stockQuantity: 100,
        isActive: true,
        categoryId: clothing.id,
      },
      {
        name: 'Zapatillas Deportivas',
        slug: 'zapatillas-deportivas',
        description: 'Zapatillas deportivas con tecnología de amortiguación.',
        price: 7999,
        stockQuantity: 40,
        isActive: true,
        categoryId: clothing.id,
      },
      {
        name: 'Lámpara LED Moderna',
        slug: 'lampara-led-moderna',
        description: 'Lámpara de diseño moderno con luz LED regulable.',
        price: 5999,
        stockQuantity: 30,
        isActive: true,
        categoryId: home.id,
      },
      {
        name: 'Set de Sartenes',
        slug: 'set-sartenes',
        description: 'Set de 3 sartenes con revestimiento antiadherente.',
        price: 4499,
        stockQuantity: 20,
        isActive: true,
        categoryId: home.id,
      },
      {
        name: 'Reloj Inteligente',
        slug: 'reloj-inteligente',
        description: 'Smartwatch con monitor de frecuencia cardíaca y GPS.',
        price: 14999,
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

    // Create store settings
    await prisma.storeSettings.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        shippingType: 'THRESHOLD',
        shippingPrice: 400,
        freeShippingThreshold: 5000,
      },
    });

    console.log('✅ Store settings created');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\nYou can now access:');
    console.log('  - http://localhost:5173/products (Product catalog)');
    console.log('  - http://localhost:5173/login (Login page)');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
