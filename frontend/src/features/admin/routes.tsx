import { Route } from 'react-router-dom';

export function AdminRoutes() {
  return (
    <>
      <Route path="dashboard" element={<div>Dashboard</div>} />
      <Route path="products" element={<div>Product Management</div>} />
      <Route path="orders" element={<div>Order Management</div>} />
    </>
  );
}
