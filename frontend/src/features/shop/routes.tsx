import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';

const Login = lazy(() => import('./Login'));
const Register = lazy(() => import('./Register'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));

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

export function ShopRoutes() {
  return (
    <>
      <Route path="/" element={<div style={{ padding: '2rem', textAlign: 'center' }}><h1>Home</h1><p>Próximamente: Catálogo de productos</p></div>} />
      <Route path="login" element={
        <Suspense fallback={<LoadingFallback />}>
          <Login />
        </Suspense>
      } />
      <Route path="register" element={
        <Suspense fallback={<LoadingFallback />}>
          <Register />
        </Suspense>
      } />
      <Route path="products" element={
        <Suspense fallback={<LoadingFallback />}>
          <ProductList />
        </Suspense>
      } />
      <Route path="products/:slug" element={
        <Suspense fallback={<LoadingFallback />}>
          <ProductDetail />
        </Suspense>
      } />
      <Route path="cart" element={
        <Suspense fallback={<LoadingFallback />}>
          <CartPage />
        </Suspense>
      } />
      <Route path="checkout" element={
        <Suspense fallback={<LoadingFallback />}>
          <CheckoutPage />
        </Suspense>
      } />
      <Route path="checkout/success" element={
        <Suspense fallback={<LoadingFallback />}>
          <CheckoutSuccessPage />
        </Suspense>
      } />
      <Route path="orders" element={
        <Suspense fallback={<LoadingFallback />}>
          <OrderHistoryPage />
        </Suspense>
      } />
      <Route path="orders/:id" element={
        <Suspense fallback={<LoadingFallback />}>
          <OrderDetailPage />
        </Suspense>
      } />
    </>
  );
}