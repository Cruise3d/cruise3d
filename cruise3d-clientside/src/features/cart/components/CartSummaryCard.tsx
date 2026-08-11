import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../useCartStore';
import { Button } from '../../../components/ui/Button';

export interface CartSummaryCardProps {
  onCheckoutClick?: () => void;
  showCheckoutButton?: boolean;
}

export const CartSummaryCard: React.FC<CartSummaryCardProps> = ({
  onCheckoutClick,
  showCheckoutButton = true,
}) => {
  const { getSubtotal, items } = useCartStore();
  const subtotal = getSubtotal();

  // Free shipping over $150, else $20 flat precision shipping
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 20.0;
  // 5% tax estimate
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-6">
      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
        Cart Summary
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-gray-600">
          <span>Shipping</span>
          <span className="font-semibold text-gray-900">
            {shipping === 0 ? (
              <span className="text-emerald-600 font-bold">FREE</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="flex items-center justify-between text-gray-600">
          <span>Estimated Tax (5%)</span>
          <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-base font-bold text-gray-900">
          <span>Total</span>
          <span className="text-xl text-blue-600">${total.toFixed(2)}</span>
        </div>
      </div>

      {showCheckoutButton && (
        <div className="pt-2">
          {onCheckoutClick ? (
            <Button
              variant="primary"
              size="lg"
              disabled={items.length === 0}
              onClick={onCheckoutClick}
              className="w-full text-base py-3"
            >
              Checkout
            </Button>
          ) : (
            <Link to="/checkout" className="block w-full">
              <Button
                variant="primary"
                size="lg"
                disabled={items.length === 0}
                className="w-full text-base py-3"
              >
                Checkout
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
