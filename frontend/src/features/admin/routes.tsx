import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@components/ProtectedRoute/ProtectedRoute';

const ProductManagement = lazy(() => import('./pages/ProductManagement'));
const ProductCreate = lazy(() => import('./pages/ProductCreate'));
const ProductEdit = lazy(() => import('./pages/ProductEdit'));
const CategoryManagement = lazy(() => import('./pages/CategoryManagement'));

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
    <ProtectedRoute requiredRole="ADMIN">
      <Route path="dashboard" element={<div>Dashboard</div>} />
      
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
      
      <Route path="orders" element={<div>Order Management</div>} />
    </ProtectedRoute>
  );
}