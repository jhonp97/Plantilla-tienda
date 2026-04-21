import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from '@config/env';
import { prisma } from '@shared/infra/prisma/client';
import { ITransactionManager } from '@shared/ITransactionManager';
import { PrismaTransactionManager } from '@shared/PrismaTransactionManager';
import { AuthController } from '@modules/auth/infrastructure/authController';
import { createAuthRouter } from '@modules/auth/infrastructure/authRouter';
import { PrismaUserRepository } from '@modules/auth/infrastructure/PrismaUserRepository';
import { RegisterUseCase } from '@modules/auth/application/RegisterUseCase';
import { LoginUseCase } from '@modules/auth/application/LoginUseCase';
import { GetCurrentUserUseCase } from '@modules/auth/application/GetCurrentUserUseCase';
import { LogoutUseCase } from '@modules/auth/application/LogoutUseCase';
import { errorHandler } from '@shared/infra/middleware/errorHandler';
import { loginRateLimiter, globalRateLimiter } from '@shared/infra/middleware/rateLimiter';

// Product module imports
import { ProductController } from '@modules/product/infrastructure/http/product.controller';
import { CategoryController } from '@modules/product/infrastructure/http/category.controller';
import { ImageController } from '@modules/product/infrastructure/http/image.controller';
import { createProductRouter } from '@modules/product/infrastructure/routes/product.routes';
import { createCategoryRouter } from '@modules/product/infrastructure/routes/category.routes';
import { createImageRouter } from '@modules/product/infrastructure/routes/image.routes';
import { PrismaProductRepository } from '@modules/product/infrastructure/persistence/PrismaProductRepository';
import { PrismaCategoryRepository } from '@modules/product/infrastructure/persistence/PrismaCategoryRepository';
import { PrismaProductImageRepository } from '@modules/product/infrastructure/persistence/PrismaProductImageRepository';
import { CloudinaryService } from '@modules/product/infrastructure/services/CloudinaryService';
import { CreateProductUseCase } from '@modules/product/application/use-cases/product/CreateProductUseCase';
import { UpdateProductUseCase } from '@modules/product/application/use-cases/product/UpdateProductUseCase';
import { DeleteProductUseCase } from '@modules/product/application/use-cases/product/DeleteProductUseCase';
import { GetProductBySlugUseCase } from '@modules/product/application/use-cases/product/GetProductBySlugUseCase';
import { ListProductsUseCase } from '@modules/product/application/use-cases/product/ListProductsUseCase';
import { UpdateStockUseCase } from '@modules/product/application/use-cases/product/UpdateStockUseCase';
import { CreateCategoryUseCase } from '@modules/product/application/use-cases/category/CreateCategoryUseCase';
import { UpdateCategoryUseCase } from '@modules/product/application/use-cases/category/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '@modules/product/application/use-cases/category/DeleteCategoryUseCase';
import { ListCategoriesUseCase } from '@modules/product/application/use-cases/category/ListCategoriesUseCase';
import { UploadImagesUseCase } from '@modules/product/application/use-cases/image/UploadImagesUseCase';
import { DeleteImagesUseCase } from '@modules/product/application/use-cases/image/DeleteImagesUseCase';
import { ReorderImagesUseCase } from '@modules/product/application/use-cases/image/ReorderImagesUseCase';

// Order module imports
import { PrismaOrderRepository } from '@modules/order/infrastructure/persistence/PrismaOrderRepository';
import { PrismaAddressRepository } from '@modules/order/infrastructure/persistence/PrismaAddressRepository';
import { PrismaStoreSettingsRepository } from '@modules/order/infrastructure/persistence/PrismaStoreSettingsRepository';
import { PrismaInvoiceRepository } from '@modules/order/infrastructure/persistence/PrismaInvoiceRepository';
import { StripeService } from '@modules/order/infrastructure/services/StripeService';
import { EmailService } from '@modules/order/infrastructure/services/EmailService';

// Order use cases
import { CreateOrderUseCase } from '@modules/order/application/use-cases/order/CreateOrderUseCase';
import { GetOrderByIdUseCase } from '@modules/order/application/use-cases/order/GetOrderByIdUseCase';
import { GetOrderByNumberUseCase } from '@modules/order/application/use-cases/order/GetOrderByNumberUseCase';
import { ListUserOrdersUseCase } from '@modules/order/application/use-cases/order/ListUserOrdersUseCase';
import { ListAdminOrdersUseCase } from '@modules/order/application/use-cases/order/ListAdminOrdersUseCase';
import { UpdateOrderStatusUseCase } from '@modules/order/application/use-cases/order/UpdateOrderStatusUseCase';
import { CancelOrderUseCase } from '@modules/order/application/use-cases/order/CancelOrderUseCase';
import { GetInvoiceByIdUseCase } from '@modules/order/application/use-cases/order/GetInvoiceByIdUseCase';
import { GetInvoiceByOrderIdUseCase } from '@modules/order/application/use-cases/order/GetInvoiceByOrderIdUseCase';
import { ListInvoicesUseCase } from '@modules/order/application/use-cases/order/ListInvoicesUseCase';

// Cart use cases
import { AddToCartUseCase } from '@modules/order/application/use-cases/cart/AddToCartUseCase';
import { UpdateCartItemUseCase } from '@modules/order/application/use-cases/cart/UpdateCartItemUseCase';
import { RemoveFromCartUseCase } from '@modules/order/application/use-cases/cart/RemoveFromCartUseCase';
import { GetCartUseCase } from '@modules/order/application/use-cases/cart/GetCartUseCase';
import { MergeGuestCartUseCase } from '@modules/order/application/use-cases/cart/MergeGuestCartUseCase';

// Address use cases
import { CreateAddressUseCase } from '@modules/order/application/use-cases/address/CreateAddressUseCase';
import { UpdateAddressUseCase } from '@modules/order/application/use-cases/address/UpdateAddressUseCase';
import { DeleteAddressUseCase } from '@modules/order/application/use-cases/address/DeleteAddressUseCase';
import { ListUserAddressesUseCase } from '@modules/order/application/use-cases/address/ListUserAddressesUseCase';

// Shipping use cases
import { CalculateShippingUseCase } from '@modules/order/application/use-cases/shipping/CalculateShippingUseCase';
import { UpdateShippingConfigUseCase } from '@modules/order/application/use-cases/shipping/UpdateShippingConfigUseCase';

// Payment use cases
import { CreatePaymentIntentUseCase } from '@modules/order/application/use-cases/payment/CreatePaymentIntentUseCase';
import { HandleWebhookUseCase } from '@modules/order/application/use-cases/payment/HandleWebhookUseCase';
import { ConfirmPaymentUseCase } from '@modules/order/application/use-cases/payment/ConfirmPaymentUseCase';
import { HandleFailedPaymentUseCase } from '@modules/order/application/use-cases/payment/HandleFailedPaymentUseCase';

// Analytics use cases
import { GetDashboardStatsUseCase } from '@modules/order/application/use-cases/analytics/GetDashboardStatsUseCase';
import { GetSalesAnalyticsUseCase } from '@modules/order/application/use-cases/analytics/GetSalesAnalyticsUseCase';
import { GetProductPerformanceUseCase } from '@modules/order/application/use-cases/analytics/GetProductPerformanceUseCase';
import { GetTopCustomersUseCase } from '@modules/order/application/use-cases/analytics/GetTopCustomersUseCase';
import { GetLowStockProductsUseCase } from '@modules/order/application/use-cases/analytics/GetLowStockProductsUseCase';

// Reports use cases
import { GenerateInvoicesReportUseCase } from '@modules/order/application/use-cases/reports/GenerateInvoicesReportUseCase';
import { ExportSalesReportUseCase } from '@modules/order/application/use-cases/reports/ExportSalesReportUseCase';
import { ExportProductsReportUseCase } from '@modules/order/application/use-cases/reports/ExportProductsReportUseCase';
import { GenerateCSVReportUseCase } from '@modules/order/application/use-cases/reports/GenerateCSVReportUseCase';
import { GeneratePDFReportUseCase } from '@modules/order/application/use-cases/reports/GeneratePDFReportUseCase';

// Order controllers
import { OrderController } from '@modules/order/infrastructure/http/OrderController';
import { CartController } from '@modules/order/infrastructure/http/CartController';
import { AddressController } from '@modules/order/infrastructure/http/AddressController';
import { ShippingController } from '@modules/order/infrastructure/http/ShippingController';
import { PaymentController } from '@modules/order/infrastructure/http/PaymentController';
import { WebhookController } from '@modules/order/infrastructure/http/WebhookController';
import { AnalyticsController } from '@modules/order/infrastructure/http/AnalyticsController';
import { ReportsController } from '@modules/order/infrastructure/http/ReportsController';
import { InvoiceController } from '@modules/order/infrastructure/http/InvoiceController';

// Order routes
import { createOrderRouter } from '@modules/order/infrastructure/routes/order.routes';
import { createCartRouter } from '@modules/order/infrastructure/routes/cart.routes';
import { createAddressRouter } from '@modules/order/infrastructure/routes/address.routes';
import { createShippingRouter } from '@modules/order/infrastructure/routes/shipping.routes';
import { createPaymentRouter } from '@modules/order/infrastructure/routes/payment.routes';
import { createWebhookRouter } from '@modules/order/infrastructure/routes/webhook.routes';
import { createAnalyticsRouter } from '@modules/order/infrastructure/routes/analytics.routes';
import { createReportsRouter } from '@modules/order/infrastructure/routes/reports.routes';
import { createInvoiceRouter } from '@modules/order/infrastructure/routes/invoice.routes';

// Verifactu module imports
import { VerifactuApiService } from '@modules/verifactu/infrastructure/services/VerifactuApiService';
import { VerifactuRepository } from '@modules/verifactu/infrastructure/persistence/VerifactuRepository';
import { VerifactuController } from '@modules/verifactu/infrastructure/http/VerifactuController';
import { createVerifactuRouter } from '@modules/verifactu/infrastructure/routes/verifactu.routes';
import { GenerateInvoiceFromOrder } from '@modules/verifactu/application/use-cases/GenerateInvoiceFromOrder';
import { RegisterInvoiceUseCase } from '@modules/verifactu/application/use-cases/RegisterInvoiceUseCase';
import { CheckInvoiceStatusUseCase } from '@modules/verifactu/application/use-cases/CheckInvoiceStatusUseCase';

const app: Express = express();

// Security headers
app.use(helmet());

// CORS - allow frontend with credentials
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Global rate limiter
app.use(globalRateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth module - dependency injection
const userRepository = new PrismaUserRepository(prisma);
const registerUseCase = new RegisterUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
const logoutUseCase = new LogoutUseCase();

const authController = new AuthController(
  registerUseCase,
  loginUseCase,
  getCurrentUserUseCase,
  logoutUseCase,
);

const authRouter = createAuthRouter(authController);

// Mount auth routes
app.use('/api/auth', authRouter);

// Login route with dedicated rate limiter (not in router to avoid double mounting)
app.post('/api/auth/login', loginRateLimiter, authController.login);

// ==========================================
// Product module - dependency injection
// ==========================================
const productRepository = new PrismaProductRepository(prisma);
const categoryRepository = new PrismaCategoryRepository(prisma);
const imageRepository = new PrismaProductImageRepository(prisma);
const cloudinaryService = new CloudinaryService();

// Product use cases
const createProductUseCase = new CreateProductUseCase(
  productRepository,
  categoryRepository,
  cloudinaryService,
);
const updateProductUseCase = new UpdateProductUseCase(productRepository, categoryRepository);
const deleteProductUseCase = new DeleteProductUseCase(productRepository);
const getProductBySlugUseCase = new GetProductBySlugUseCase(productRepository);
const listProductsUseCase = new ListProductsUseCase(productRepository);
const updateStockUseCase = new UpdateStockUseCase(productRepository);

// Category use cases
const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);
const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository);
const listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository);

// Image use cases
const uploadImagesUseCase = new UploadImagesUseCase(productRepository, imageRepository, cloudinaryService);
const deleteImagesUseCase = new DeleteImagesUseCase(imageRepository, cloudinaryService);
const reorderImagesUseCase = new ReorderImagesUseCase(imageRepository);

// Controllers
const productController = new ProductController(
  createProductUseCase,
  updateProductUseCase,
  deleteProductUseCase,
  getProductBySlugUseCase,
  listProductsUseCase,
  updateStockUseCase,
  categoryRepository,
);

const categoryController = new CategoryController(
  createCategoryUseCase,
  updateCategoryUseCase,
  deleteCategoryUseCase,
  listCategoriesUseCase,
);

const imageController = new ImageController(
  uploadImagesUseCase,
  deleteImagesUseCase,
  reorderImagesUseCase,
);

// Routes
const productRouter = createProductRouter(productController);
const categoryRouter = createCategoryRouter(categoryController);
const imageRouter = createImageRouter(imageController);

// Mount product module routes
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api', imageRouter);

// ==========================================
// Order module - dependency injection
// ==========================================

// Import event bus
import { eventBus } from '@shared/events/EventBus';

// Transaction manager for ACID compliance
const transactionManager: ITransactionManager = new PrismaTransactionManager();

// Repositories
const orderRepository = new PrismaOrderRepository(prisma);
const addressRepository = new PrismaAddressRepository(prisma);
const settingsRepository = new PrismaStoreSettingsRepository(prisma);
const invoiceRepository = new PrismaInvoiceRepository(prisma);

// Services
const stripeService = new StripeService();
const emailService = new EmailService();

// Order use cases
const createOrderUseCase = new CreateOrderUseCase(orderRepository, productRepository, settingsRepository, transactionManager);
const getOrderByIdUseCase = new GetOrderByIdUseCase(orderRepository);
const getOrderByNumberUseCase = new GetOrderByNumberUseCase(orderRepository);
const listUserOrdersUseCase = new ListUserOrdersUseCase(orderRepository);
const listAdminOrdersUseCase = new ListAdminOrdersUseCase(orderRepository);
const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);
const cancelOrderUseCase = new CancelOrderUseCase(orderRepository);

// Invoice use cases
const getInvoiceByIdUseCase = new GetInvoiceByIdUseCase(invoiceRepository);
const getInvoiceByOrderIdUseCase = new GetInvoiceByOrderIdUseCase(invoiceRepository);
const listInvoicesUseCase = new ListInvoicesUseCase(invoiceRepository);

// Cart use cases
const addToCartUseCase = new AddToCartUseCase(orderRepository, productRepository);
const updateCartItemUseCase = new UpdateCartItemUseCase(orderRepository, productRepository);
const removeFromCartUseCase = new RemoveFromCartUseCase(orderRepository);
const getCartUseCase = new GetCartUseCase(orderRepository);
const mergeGuestCartUseCase = new MergeGuestCartUseCase(orderRepository, transactionManager);

// Address use cases
const createAddressUseCase = new CreateAddressUseCase(addressRepository);
const updateAddressUseCase = new UpdateAddressUseCase(addressRepository);
const deleteAddressUseCase = new DeleteAddressUseCase(addressRepository);
const listUserAddressesUseCase = new ListUserAddressesUseCase(addressRepository);

// Shipping use cases
const calculateShippingUseCase = new CalculateShippingUseCase(settingsRepository);
const updateShippingConfigUseCase = new UpdateShippingConfigUseCase(settingsRepository);

// Payment use cases - Note: Using simplified payment intent for compatibility
// The CreatePaymentIntentUseCase expects a StripeService with a different interface
// We'll create a wrapper that adapts our StripeService to what the use case expects
interface SimpleStripeService {
  createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>): Promise<{
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
  }>;
}

const simpleStripeService: SimpleStripeService = {
  createPaymentIntent: async (amount: number, currency: string, metadata?: Record<string, string>) => {
    const result = await stripeService.createPaymentIntent({
      amount,
      currency,
      customerEmail: metadata?.customerEmail || 'customer@example.com',
      metadata,
    });
    return {
      id: result.id,
      client_secret: result.clientSecret,
      amount,
      currency,
      status: result.status,
    };
  },
};

// Create a composite handler for webhooks
interface WebhookHandler {
  handlePaymentSuccess(paymentIntentId: string): Promise<void>;
  handlePaymentFailed(paymentIntentId: string, errorMessage?: string): Promise<void>;
  handleRefund(chargeId: string, amount: number): Promise<void>;
}

const webhookHandler: WebhookHandler = {
  handlePaymentSuccess: async (paymentIntentId: string) => {
    // Find order and update status
    const order = await orderRepository.findByPaymentIntentId(paymentIntentId);
    if (order) {
      await orderRepository.update(order.id, { status: 'PAID', paidAt: new Date() });
      // Send confirmation email
      try {
        await emailService.sendOrderPaid(order.id, {
          orderNumber: order.orderNumber,
          customerName: 'Cliente',
          customerEmail: 'customer@example.com',
          totalAmount: order.totalAmount,
          currencySymbol: '€',
          items: [],
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
        });
      } catch (e) {
        console.error('Failed to send order paid email:', e);
      }
      // Emit event for Verifactu
      await eventBus.emit('OrderPaid', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        taxAmount: order.taxAmount,
        subtotal: order.subtotal,
        customerEmail: 'customer@example.com',
        items: [],
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        paymentMethod: order.paymentMethod,
        paidAt: new Date(),
      });
    }
  },
  handlePaymentFailed: async (paymentIntentId: string, errorMessage?: string) => {
    const order = await orderRepository.findByPaymentIntentId(paymentIntentId);
    if (order) {
      await orderRepository.cancel(order.id, `Payment failed: ${errorMessage || 'Unknown error'}`);
    }
  },
  handleRefund: async (_chargeId: string, _amount: number) => {
    // Handle refund logic
  },
};

const createPaymentIntentUseCase = new CreatePaymentIntentUseCase(orderRepository, simpleStripeService);
const handleWebhookUseCase = new HandleWebhookUseCase(webhookHandler);
const confirmPaymentUseCase = new ConfirmPaymentUseCase(orderRepository, productRepository, settingsRepository, emailService, eventBus, transactionManager);
const handleFailedPaymentUseCase = new HandleFailedPaymentUseCase(orderRepository);

// Analytics use cases
const getDashboardStatsUseCase = new GetDashboardStatsUseCase(orderRepository, productRepository, settingsRepository);
const getSalesAnalyticsUseCase = new GetSalesAnalyticsUseCase(orderRepository);
const getProductPerformanceUseCase = new GetProductPerformanceUseCase(orderRepository);
const getTopCustomersUseCase = new GetTopCustomersUseCase(orderRepository);
const getLowStockProductsUseCase = new GetLowStockProductsUseCase(productRepository, settingsRepository);

// Reports use cases
const generateInvoicesReportUseCase = new GenerateInvoicesReportUseCase(orderRepository);
const exportSalesReportUseCase = new ExportSalesReportUseCase(orderRepository);
const exportProductsReportUseCase = new ExportProductsReportUseCase(orderRepository);
const generateCSVReportUseCase = new GenerateCSVReportUseCase(
  generateInvoicesReportUseCase,
  exportSalesReportUseCase,
  exportProductsReportUseCase,
);
const generatePDFReportUseCase = new GeneratePDFReportUseCase();

// Controllers
const orderController = new OrderController(
  createOrderUseCase,
  getOrderByIdUseCase,
  getOrderByNumberUseCase,
  listUserOrdersUseCase,
  listAdminOrdersUseCase,
  updateOrderStatusUseCase,
  cancelOrderUseCase,
);

const cartController = new CartController(
  addToCartUseCase,
  updateCartItemUseCase,
  removeFromCartUseCase,
  getCartUseCase,
  mergeGuestCartUseCase,
);

const addressController = new AddressController(
  createAddressUseCase,
  updateAddressUseCase,
  deleteAddressUseCase,
  listUserAddressesUseCase,
);

const shippingController = new ShippingController(
  calculateShippingUseCase,
  updateShippingConfigUseCase,
);

const paymentController = new PaymentController(
  createPaymentIntentUseCase,
  confirmPaymentUseCase,
);

const webhookController = new WebhookController(
  handleWebhookUseCase,
  handleFailedPaymentUseCase,
);

const analyticsController = new AnalyticsController(
  getDashboardStatsUseCase,
  getSalesAnalyticsUseCase,
  getProductPerformanceUseCase,
  getTopCustomersUseCase,
  getLowStockProductsUseCase,
);

const reportsController = new ReportsController(
  generateInvoicesReportUseCase,
  exportSalesReportUseCase,
  exportProductsReportUseCase,
  generateCSVReportUseCase,
  generatePDFReportUseCase,
);

const invoiceController = new InvoiceController(
  getInvoiceByIdUseCase,
  getInvoiceByOrderIdUseCase,
  listInvoicesUseCase,
);

// Routes
const orderRouter = createOrderRouter(orderController, invoiceController);
const cartRouter = createCartRouter(cartController);
const addressRouter = createAddressRouter(addressController);
const shippingRouter = createShippingRouter(shippingController);
const paymentRouter = createPaymentRouter(paymentController);
const webhookRouter = createWebhookRouter(webhookController);
const analyticsRouter = createAnalyticsRouter(analyticsController);
const reportsRouter = createReportsRouter(reportsController);
const invoiceRouter = createInvoiceRouter(invoiceController);

// Mount order module routes
app.use('/api/orders', orderRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/cart', cartRouter);
app.use('/api/addresses', addressRouter);
app.use('/api/shipping', shippingRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/api/admin/analytics', analyticsRouter);
app.use('/api/admin/reports', reportsRouter);

// ==========================================
// Verifactu module - dependency injection
// ==========================================

// Services
const verifactuApiService = new VerifactuApiService();
const verifactuRepository = new VerifactuRepository(prisma);

// Use cases
const generateInvoiceFromOrder = new GenerateInvoiceFromOrder();
const registerInvoiceUseCase = new RegisterInvoiceUseCase(
  verifactuApiService,
  verifactuRepository,
  generateInvoiceFromOrder,
);
const checkInvoiceStatusUseCase = new CheckInvoiceStatusUseCase(
  verifactuApiService,
  verifactuRepository,
);

// Controller
const verifactuController = new VerifactuController(
  registerInvoiceUseCase,
  checkInvoiceStatusUseCase,
  verifactuRepository,
);

// Routes
const verifactuRouter = createVerifactuRouter(verifactuController);

// Mount Verifactu routes
app.use('/api/verifactu', verifactuRouter);

// ==========================================
// Verifactu Event Listeners
// ==========================================

// Import the OrderPaidEvent type
import type { OrderPaidEvent } from '@shared/events/EventBus';

// Listen for OrderPaid events to automatically register invoices
eventBus.on<OrderPaidEvent>('OrderPaid', async (event) => {
  console.log('[Verifactu] OrderPaid event received:', event.orderNumber);
  
  try {
    // Fetch the complete order with items and user data using Prisma directly
    const orderRecord = await prisma.order.findUnique({
      where: { id: event.orderId },
      include: {
        items: true,
        user: {
          select: {
            nifCif: true,
            fullName: true,
          },
        },
      },
    });
    
    if (!orderRecord) {
      console.error('[Verifactu] Order not found:', event.orderId);
      return;
    }

    // Transform order to Verifactu format
    const orderData = {
      id: orderRecord.id,
      orderNumber: orderRecord.orderNumber,
      userId: orderRecord.userId,
      status: orderRecord.status,
      subtotal: orderRecord.subtotal,
      taxAmount: orderRecord.taxAmount,
      shippingCost: orderRecord.shippingCost,
      discountAmount: 0, // Discount is calculated at domain level, not stored in DB
      totalAmount: orderRecord.totalAmount,
      guestNifCif: orderRecord.guestNifCif,
      guestFullName: orderRecord.guestFullName,
      user: orderRecord.userId ? { 
        nifCif: orderRecord.user?.nifCif || null, 
        fullName: orderRecord.user?.fullName || null 
      } : null,
      items: orderRecord.items.map(item => ({
        productPrice: item.productPrice,
        quantity: item.quantity,
      })),
      createdAt: orderRecord.createdAt,
    };

    // Register invoice with Verifactu
    await registerInvoiceUseCase.execute(orderData);
    
  } catch (error) {
    console.error('[Verifactu] Error handling OrderPaid event:', error);
  }
});

// ==========================================
// Verifactu Polling Job
// Check invoice status every 5 minutes
// ==========================================

const VERIFACTU_POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

setInterval(async () => {
  console.log('[Verifactu] Running scheduled status check...');
  try {
    await checkInvoiceStatusUseCase.execute();
  } catch (error) {
    console.error('[Verifactu] Error in scheduled status check:', error);
  }
}, VERIFACTU_POLL_INTERVAL);

console.log('[Verifactu] Polling job scheduled every 5 minutes');

// Error handling (must be last)
app.use(errorHandler);

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
});

export { app };
