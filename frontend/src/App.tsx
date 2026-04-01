import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ProtectedRoute } from '@components/ProtectedRoute';
import { ShopRoutes } from '@features/shop';
import { AdminRoutes } from '@features/admin';

const Login = lazy(() => import('./features/shop/Login'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {ShopRoutes()}
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <Routes>{AdminRoutes()}</Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
