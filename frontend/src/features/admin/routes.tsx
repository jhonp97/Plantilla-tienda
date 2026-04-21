import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import styles from './LoadingFallback.module.css';

const ProductManagement = lazy(() => import('./pages/ProductManagement'));
const ProductCreate = lazy(() => import('./pages/ProductCreate'));
const ProductEdit = lazy(() => import('./pages/ProductEdit'));
const CategoryManagement = lazy(() => import('./pages/CategoryManagement'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const OrderManagementPage = lazy(() => import('./pages/OrderManagementPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const ShippingConfigPage = lazy(() => import('./pages/ShippingConfigPage'));

function LoadingFallback() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
    </div>
  );
}

export function AdminRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminDashboardPage />
        </Suspense>
      } />
      
      {/* Products */}
      <Route path="products" element={
        <Suspense fallback={<LoadingFallback />}>
          <ProductManagement />
        </Suspense>
      } />
      <Route path="products/new" element={
        <Suspense fallback={<LoadingFallback />}>
          <ProductCreate />
        </Suspense>
      } />
      <Route path="products/:id/edit" element={
        <Suspense fallback={<LoadingFallback />}>
          <ProductEdit />
        </Suspense>
      } />
      
      {/* Categories */}
      <Route path="categories" element={
        <Suspense fallback={<LoadingFallback />}>
          <CategoryManagement />
        </Suspense>
      } />
      
      {/* Orders */}
      <Route path="orders" element={
        <Suspense fallback={<LoadingFallback />}>
          <OrderManagementPage />
        </Suspense>
      } />
      
      {/* Analytics */}
      <Route path="analytics" element={
        <Suspense fallback={<LoadingFallback />}>
          <AnalyticsPage />
        </Suspense>
      } />
      
      {/* Reports */}
      <Route path="reports" element={
        <Suspense fallback={<LoadingFallback />}>
          <ReportsPage />
        </Suspense>
      } />
      
      {/* Settings */}
      <Route path="settings/shipping" element={
        <Suspense fallback={<LoadingFallback />}>
          <ShippingConfigPage />
        </Suspense>
      } />
    </Routes>
  );
}
