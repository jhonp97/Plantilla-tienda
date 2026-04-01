import { Route } from 'react-router-dom';

export function ShopRoutes() {
  return (
    <>
      <Route path="/" element={<div>Home</div>} />
      <Route path="products" element={<div>Products</div>} />
      <Route path="products/:id" element={<div>Product Detail</div>} />
      <Route path="cart" element={<div>Cart</div>} />
      <Route path="checkout" element={<div>Checkout</div>} />
    </>
  );
}
