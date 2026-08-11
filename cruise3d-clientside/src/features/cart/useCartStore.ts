import { create } from 'zustand';
import type { CartItem } from './types';
import type { Product } from '../products/types';
import { getProducts } from '../products/api';
import { normalizeProducts } from '../products/normalizeProduct';
import {
  addToCart as addToCartRequest,
  clearCart as clearCartRequest,
  getCart,
  removeCartItem as removeCartItemRequest,
  updateCartItem as updateCartItemRequest,
} from './api';

interface ServerCartItem {
  id: string;
  productId: string;
  productTitle?: string;
  productImageUrl?: string;
  price?: number;
  quantity: number;
  colorId?: string;
  priceAtAddition?: number;
  selectedFinish?: string;
}

async function hydrateCartItems(serverItems: ServerCartItem[]): Promise<CartItem[]> {
  if (serverItems.length === 0) return [];

  // Try to enrich each line with full product data (category, material, etc.)
  // for the cart UI. The /products endpoint is paginated, so a missing match
  // here is expected when the cart's product isn't on the first page — we
  // fall back to the data the cart endpoint itself returns.
  let byId = new Map<string, Product>();
  try {
    const productsResponse = await getProducts();
    const rawList: unknown[] = Array.isArray(productsResponse)
      ? (productsResponse as unknown[])
      : ((productsResponse as { items?: unknown[] } | undefined)?.items ?? []);
    const products: Product[] = normalizeProducts(
      rawList as Parameters<typeof normalizeProducts>[0]
    );
    byId = new Map(products.map((p) => [p.id, p]));
  } catch {
    // Ignore — we'll build minimal Product stubs from the cart payload.
  }

  const result: CartItem[] = [];
  for (const item of serverItems) {
    const matched = byId.get(item.productId);
    const fallback: Product = {
      id: item.productId,
      title: item.productTitle ?? 'Product',
      subtitle: '',
      description: '',
      price: item.price ?? item.priceAtAddition ?? 0,
      category: '',
      material: '',
      technology: '',
      rating: 0,
      reviewCount: 0,
      inStock: true,
      images: item.productImageUrl ? [item.productImageUrl] : [],
    };
    const product: Product = matched ?? fallback;

    const cartItem: CartItem = {
      id: item.id,
      cartItemId: item.id,
      product,
      quantity: item.quantity,
      selectedFinish: item.selectedFinish,
      priceAtAddition: item.priceAtAddition ?? item.price ?? product.price,
    };
    result.push(cartItem);
  }
  return result;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  fetchCart: () => Promise<void>;
  reset: () => void;
  addItem: (
    product: Product,
    quantity?: number,
    selectedFinish?: string
  ) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,
  error: null,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const serverItems = (await getCart()) as unknown as ServerCartItem[]; // server fields (price, productTitle) differ from CartItem
      const items = await hydrateCartItems(serverItems);
      set({ items });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load cart.';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ items: [], error: null }),

  addItem: async (product, quantity = 1, selectedFinish) => {
    set({ isLoading: true, error: null });
    try {
      await addToCartRequest({
        productId: product.id,
        quantity,
        colorId: undefined,
        selectedFinish,
      });
      await get().fetchCart();
      set({ isOpen: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add item to cart.';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await removeCartItemRequest(id);
      await get().fetchCart();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove item.';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (id, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(id);
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await updateCartItemRequest(id, { quantity });
      await get().fetchCart();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update quantity.';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await clearCartRequest();
      set({ items: [] });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to clear cart.';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.priceAtAddition * item.quantity,
      0
    );
  },

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));