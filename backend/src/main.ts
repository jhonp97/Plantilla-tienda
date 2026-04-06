import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from '@config/env';
import { prisma } from '@shared/infra/prisma/client';
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
