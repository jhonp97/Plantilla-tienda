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

    // Create customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    await prisma.user.upsert({
      where: { email: 'customer@test.com' },
      update: {},
      create: {
        email: 'customer@test.com',
        passwordHash: customerPassword,
        fullName: 'Cliente de Prueba',
        nifCif: '87654321A',
        role: 'CUSTOMER',
        address: {
          street: 'Calle Cliente 456',
          postalCode: '08001',
          city: 'Barcelona',
          province: 'Barcelona',
          country: 'España',
        },
      },
    });
    console.log('✅ Customer user created: customer@test.com / customer123');

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
        taxRate: 21,
        categoryId: electronics.id,
      },
      {
        name: 'Smartphone Galaxy X',
        slug: 'smartphone-galaxy-x',
        description: 'Teléfono inteligente con pantalla AMOLED de 6.5", 128GB de almacenamiento.',
        price: 59999,
        stockQuantity: 25,
        isActive: true,
        taxRate: 21,
        categoryId: electronics.id,
      },
      {
        name: 'Portátil UltraBook',
        slug: 'portatil-ultrabook',
        description: 'Ordenador portátil ultraligero con procesador i7, 16GB RAM.',
        price: 89999,
        stockQuantity: 15,
        isActive: true,
        taxRate: 21,
        categoryId: electronics.id,
      },
      {
        name: 'Camiseta Premium',
        slug: 'camiseta-premium',
        description: 'Camiseta de algodón 100% orgánico, suave y transpirable.',
        price: 2499,
        stockQuantity: 100,
        isActive: true,
        taxRate: 21,
        categoryId: clothing.id,
      },
      {
        name: 'Zapatillas Deportivas',
        slug: 'zapatillas-deportivas',
        description: 'Zapatillas deportivas con tecnología de amortiguación.',
        price: 7999,
        stockQuantity: 40,
        isActive: true,
        taxRate: 21,
        categoryId: clothing.id,
      },
      {
        name: 'Lámpara LED Moderna',
        slug: 'lampara-led-moderna',
        description: 'Lámpara de diseño moderno con luz LED regulable.',
        price: 5999,
        stockQuantity: 30,
        isActive: true,
        taxRate: 21,
        categoryId: home.id,
      },
      {
        name: 'Set de Sartenes',
        slug: 'set-sartenes',
        description: 'Set de 3 sartenes con revestimiento antiadherente.',
        price: 4499,
        stockQuantity: 20,
        isActive: true,
        taxRate: 21,
        categoryId: home.id,
      },
      {
        name: 'Reloj Inteligente',
        slug: 'reloj-inteligente',
        description: 'Smartwatch con monitor de frecuencia cardíaca y GPS.',
        price: 14999,
        stockQuantity: 35,
        isActive: true,
        taxRate: 21,
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

    // Create test coupons
    const coupons = [
      {
        code: 'BIENVENIDO10',
        discountType: 'PERCENTAGE' as const,
        discountValue: 10,
        minOrderAmount: 3000,
        usageLimit: 100,
        usageCount: 0,
        isActive: true,
      },
      {
        code: 'GASTOSENVIO',
        discountType: 'FIXED' as const,
        discountValue: 500,
        minOrderAmount: 2000,
        usageLimit: 50,
        usageCount: 0,
        isActive: true,
      },
      {
        code: 'VIP20',
        discountType: 'PERCENTAGE' as const,
        discountValue: 20,
        minOrderAmount: 10000,
        usageLimit: 10,
        usageCount: 0,
        isActive: true,
      },
      {
        code: 'EXPERIADO',
        discountType: 'PERCENTAGE' as const,
        discountValue: 5,
        expiresAt: new Date('2024-01-01'),
        usageLimit: null,
        usageCount: 0,
        isActive: false,
      },
    ];

    for (const couponData of coupons) {
      await prisma.coupon.upsert({
        where: { code: couponData.code },
        update: {},
        create: couponData,
      });
    }
    console.log(`✅ ${coupons.length} coupons created`);

    // Create test reviews
    const allProducts = await prisma.product.findMany({ take: 3 });
    const customerUser = await prisma.user.findUnique({ where: { email: 'customer@test.com' } });

    if (customerUser && allProducts.length > 0) {
      const reviews = [
        {
          productId: allProducts[0]!.id,
          userId: customerUser.id,
          rating: 5,
          comment: 'Excelente producto, muy recomendado. La calidad superó mis expectativas.',
          isVerifiedPurchase: true,
        },
      ];

      if (allProducts.length > 1) {
        reviews.push({
          productId: allProducts[1]!.id,
          userId: customerUser.id,
          rating: 4,
          comment: 'Muy buen producto, aunque el envío tardó un poco más de lo esperado.',
          isVerifiedPurchase: true,
        });
      }

      for (const reviewData of reviews) {
        // Check if review already exists to avoid duplicates
        const existing = await prisma.review.findFirst({
          where: {
            productId: reviewData.productId,
            userId: reviewData.userId,
          },
        });
        if (!existing) {
          await prisma.review.create({ data: reviewData });
        }
      }
      console.log(`✅ ${reviews.length} reviews created for customer user`);
    }

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
