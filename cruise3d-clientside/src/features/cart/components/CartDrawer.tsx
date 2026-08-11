import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../useCartStore';
import { Button } from '../../../components/ui/Button';
import { theme } from '../../../styles/theme';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const { colors, shadows } = theme;

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 20.0;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l shadow-2xl"
        style={{
          backgroundColor: colors.surface.DEFAULT,
          borderColor: colors.border.DEFAULT,
          boxShadow: shadows.xl,
        }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div 
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: `1px solid ${colors.border.DEFAULT}` }}
          >
            <h2 
              className="text-lg font-bold"
              style={{ color: colors.text.primary }}
            >
              Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>
            <button
              type="button"
              onClick={closeCart}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full transition"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.surface.low;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Close cart"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span 
                  className="material-symbols-outlined text-6xl mb-4"
                  style={{ color: colors.text.tertiary }}
                >
                  shopping_cart
                </span>
                <p 
                  className="text-lg font-medium"
                  style={{ color: colors.text.primary }}
                >
                  Your cart is empty
                </p>
                <p 
                  className="text-sm mt-1 mb-6"
                  style={{ color: colors.text.secondary }}
                >
                  Add some items to get started
                </p>
                <Button variant="primary" onClick={closeCart}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => {
                  const lineTotal = item.priceAtAddition * item.quantity;
                  return (
                    <li
                      key={item.id}
                      className="flex gap-4 rounded-xl border p-3"
                      style={{
                        borderColor: colors.border.DEFAULT,
                        backgroundColor: colors.surface.low,
                      }}
                    >
                      {/* Product Image */}
                      <div 
                        className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg"
                        style={{ backgroundColor: colors.surface.container }}
                      >
                        <img
                          src={item.product.images?.[0] ?? FALLBACK_IMAGE}
                          alt={item.product.title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div>
                          <h4 
                            className="font-semibold text-sm truncate"
                            style={{ color: colors.text.primary }}
                          >
                            {item.product.title}
                          </h4>
                          <p 
                            className="text-xs truncate"
                            style={{ color: colors.text.secondary }}
                          >
                            {item.selectedFinish || item.product.material}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Stepper */}
                          <div 
                            className="inline-flex items-center rounded-lg"
                            style={{
                              border: `1px solid ${colors.border.DEFAULT}`,
                              backgroundColor: colors.surface.DEFAULT,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-7 w-7 flex items-center justify-center rounded-md transition"
                              style={{ color: colors.text.secondary }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = colors.surface.low;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              aria-label="Decrease quantity"
                            >
                              <span className="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span 
                              className="w-6 text-center text-xs font-bold"
                              style={{ color: colors.text.primary }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-7 w-7 flex items-center justify-center rounded-md transition"
                              style={{ color: colors.text.secondary }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = colors.surface.low;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              aria-label="Increase quantity"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                          </div>

                          {/* Line Total */}
                          <span 
                            className="font-bold text-sm"
                            style={{ color: colors.text.primary }}
                          >
                            ${lineTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="self-start h-8 w-8 flex items-center justify-center rounded-lg transition"
                        style={{ color: colors.text.tertiary }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = colors.status.error.DEFAULT;
                          e.currentTarget.style.backgroundColor = colors.status.error.light;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = colors.text.tertiary;
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        aria-label="Remove item"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div 
              className="border-t px-6 py-4"
              style={{
                borderColor: colors.border.DEFAULT,
                backgroundColor: colors.surface.low,
              }}
            >
              {/* Summary */}
              <div className="space-y-2 text-sm mb-4">
                <div 
                  className="flex items-center justify-between"
                  style={{ color: colors.text.secondary }}
                >
                  <span>Subtotal</span>
                  <span 
                    className="font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div 
                  className="flex items-center justify-between"
                  style={{ color: colors.text.secondary }}
                >
                  <span>Shipping</span>
                  <span 
                    className="font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    {shipping === 0 ? (
                      <span style={{ color: colors.status.success.DEFAULT }} className="font-bold">
                        FREE
                      </span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div 
                  className="flex items-center justify-between"
                  style={{ color: colors.text.secondary }}
                >
                  <span>Tax (5%)</span>
                  <span 
                    className="font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div 
                  className="flex items-center justify-between pt-2 border-t text-base font-bold"
                  style={{
                    borderColor: colors.border.DEFAULT,
                    color: colors.text.primary,
                  }}
                >
                  <span>Total</span>
                  <span 
                    className="text-lg"
                    style={{ color: colors.primary.DEFAULT }}
                  >
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Link to="/cart" onClick={closeCart} className="w-full">
                  <Button variant="outline" size="lg" className="w-full">
                    View Cart
                  </Button>
                </Link>
                <Link to="/checkout" onClick={closeCart} className="w-full">
                  <Button variant="primary" size="lg" className="w-full">
                    Checkout
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};