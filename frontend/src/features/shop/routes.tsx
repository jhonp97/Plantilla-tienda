import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { Layout } from '@components/Layout';
import { PageTransition } from '@components/PageTransition';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

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

function ShopLayout() {
  const location = useLocation();
  const isCheckout = location.pathname.startsWith('/checkout');

  return (
    <Layout hideHeader={isCheckout} hideFooter={isCheckout}>
      <Outlet />
    </Layout>
  );
}

/** Wraps children in Suspense + PageTransition */
function AnimatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  );
}

export function ShopRoutes() {
  return (
    <Routes>
      <Route element={<ShopLayout />}>
        <Route index element={
          <AnimatedRoute><HomePage /></AnimatedRoute>
        } />
        <Route path="products" element={
          <AnimatedRoute><ProductList /></AnimatedRoute>
        } />
        <Route path="products/:slug" element={
          <AnimatedRoute><ProductDetail /></AnimatedRoute>
        } />
        <Route path="cart" element={
          <AnimatedRoute><CartPage /></AnimatedRoute>
        } />
        <Route path="checkout" element={
          <AnimatedRoute><CheckoutPage /></AnimatedRoute>
        } />
        <Route path="checkout/success" element={
          <AnimatedRoute><CheckoutSuccessPage /></AnimatedRoute>
        } />
        <Route path="orders" element={
          <AnimatedRoute><OrderHistoryPage /></AnimatedRoute>
        } />
        <Route path="orders/:id" element={
          <AnimatedRoute><OrderDetailPage /></AnimatedRoute>
        } />
        <Route path="about" element={
          <AnimatedRoute><AboutPage /></AnimatedRoute>
        } />
        <Route path="contact" element={
          <AnimatedRoute><ContactPage /></AnimatedRoute>
        } />
        <Route path="faq" element={
          <AnimatedRoute><FaqPage /></AnimatedRoute>
        } />
        <Route path="forgot-password" element={
          <AnimatedRoute><ForgotPasswordPage /></AnimatedRoute>
        } />
        <Route path="reset-password" element={
          <AnimatedRoute><ResetPasswordPage /></AnimatedRoute>
        } />
        <Route path="*" element={
          <AnimatedRoute><NotFoundPage /></AnimatedRoute>
        } />
      </Route>
    </Routes>
  );
}
