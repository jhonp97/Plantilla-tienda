import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ProtectedRoute } from '@components/ProtectedRoute';
import { ShopRoutes } from '@features/shop';
import { AdminRoutes } from '@features/admin';

const Login = lazy(() => import('./features/shop/Login'));
const Register = lazy(() => import('./features/shop/Register'));

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

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Shop routes with Layout (Header/Footer) */}
          <Route path="/*" element={<ShopRoutes />} />
          
          {/* Auth routes OUTSIDE Layout - full screen gradient */}
          <Route path="/login" element={
            <Suspense fallback={<LoadingFallback />}>
              <Login />
            </Suspense>
          } />
          <Route path="/register" element={
            <Suspense fallback={<LoadingFallback />}>
              <Register />
            </Suspense>
          } />
          
          {/* Admin routes - keep their structure */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminRoutes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
