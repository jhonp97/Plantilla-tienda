import { create } from 'zustand';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface AppliedCoupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
}

interface CartState {
  cartId: string | null;
  items: CartItem[];
  isLoading: boolean;
  coupon: AppliedCoupon | null;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  mergeCart: () => Promise<void>;
  getCartId: () => string | null;
  setLoading: (loading: boolean) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCoupon: (coupon: AppliedCoupon | null) => void;
  getCouponCode: () => string | null;
  // Cart Drawer state
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const CART_ID_KEY = 'cart_id';

/**
 * Generate a simple UUID v4 without external dependency
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getOrCreateCartId(): string {
  let cartId = localStorage.getItem(CART_ID_KEY);
  if (!cartId) {
    cartId = generateUUID();
    localStorage.setItem(CART_ID_KEY, cartId);
  }
  return cartId;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartId: getOrCreateCartId(),
  items: [],
  isLoading: false,
  coupon: null,

  // Cart Drawer state
  isDrawerOpen: false,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  getCartId: () => get().cartId,

  getCouponCode: () => get().coupon?.code ?? null,

  setCoupon: (coupon) => set({ coupon }),

  setLoading: (loading) => set({ isLoading: loading }),

  updateQuantity: (productId, quantity) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    }));
  },

  addItem: (item) => {
    const newItem: CartItem = {
      ...item,
      id: generateUUID(),
      quantity: item.quantity || 1,
    };
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + newItem.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, newItem] };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    }));
  },

  clearCart: () => {
    set({ items: [], cartId: null, coupon: null });
    localStorage.removeItem(CART_ID_KEY);
  },

  mergeCart: async () => {
    const { items } = get();
    if (items.length === 0) return;

    try {
      await fetch('/api/cart/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items, cartId: get().cartId }),
      });
      set({ cartId: null });
      localStorage.removeItem(CART_ID_KEY);
    } catch {
      // Merge failed silently — items remain in local cart
    }
  },
}));
