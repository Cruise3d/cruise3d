import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../useCartStore';
import { CartItemRow } from '../components/CartItemRow';
import { CartSummaryCard } from '../components/CartSummaryCard';

export const CartPage: React.FC = () => {
  const { items, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();

  return (
    <main className="min-h-screen bg-surface px-6 py-12">
      <div className="mx-auto max-w-container-max">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-on-surface">Shopping Cart</h1>
          <p className="text-on-surface-variant mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container-low rounded-3xl border border-surface-container-highest">
            <span className="material-symbols-outlined text-8xl text-outline mb-6">
              shopping_cart
            </span>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Your cart is empty</h2>
            <p className="text-on-surface-variant mb-8 text-center max-w-md">
              Looks like you haven't added any items to your cart yet. Start exploring our
              3D printed products to find something you love.
            </p>
            <Link to="/products">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary font-semibold rounded-lg transition-all hover:bg-primary-container shadow-sm hover:shadow-md"
              >
                <span className="material-symbols-outlined">storefront</span>
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Cart Items Table */}
            <div className="lg:col-span-2 space-y-6">
              {/* Continue Shopping Link */}
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Continue Shopping
              </Link>

              {/* Cart Items Table */}
              <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid md:grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-4 border-b border-surface-container-highest bg-surface-container text-sm font-semibold text-on-surface-variant">
                  <span>Product</span>
                  <span className="w-20 text-center">Price</span>
                  <span className="w-28 text-center">Quantity</span>
                  <span className="w-24 text-right">Total</span>
                  <span className="w-12"></span>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-surface-container-highest">
                  {items.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {/* Mobile Summary (visible only on small screens) */}
              <div className="md:hidden bg-surface-container-low rounded-2xl border border-surface-container-highest p-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-semibold text-on-surface">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Shipping</span>
                  <span className="font-semibold text-on-surface">
                    {subtotal > 150 ? (
                      <span className="text-tertiary font-bold">FREE</span>
                    ) : (
                      '$20.00'
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Tax (5%)</span>
                  <span className="font-semibold text-on-surface">
                    ${(subtotal * 0.05).toFixed(2)}
                  </span>
                </div>
                <div className="pt-4 border-t border-surface-container-highest flex items-center justify-between">
                  <span className="font-bold text-on-surface">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ${(subtotal + (subtotal > 150 ? 0 : 20) + subtotal * 0.05).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Cart Summary Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <CartSummaryCard />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;
