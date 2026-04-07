import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '50vh' 
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #e2e8f0',
        borderTopColor: '#2563eb',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
