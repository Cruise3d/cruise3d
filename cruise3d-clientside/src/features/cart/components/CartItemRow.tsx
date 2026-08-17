import React from 'react';
import type { CartItem } from '../types';
import { useCartStore } from '../useCartStore';

export interface CartItemRowProps {
  item: CartItem;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();
  const lineTotal = item.priceAtAddition * item.quantity;
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
  const imageSrc = item.product.images?.[0] ?? FALLBACK_IMAGE;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      {/* Product Column */}
      <td className="py-4 pr-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-slate-50 border border-gray-100 flex-shrink-0 overflow-hidden">
            <img
              src={imageSrc}
              alt={item.product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">
              {item.product.title}
            </h4>
            <p className="text-xs text-gray-500 truncate">
              Color/Finish: <span className="font-medium text-gray-700">{item.selectedFinish || item.product.material}</span>
            </p>
          </div>
        </div>
      </td>

      {/* Price Column */}
      <td className="py-4 px-4 text-sm font-semibold text-gray-800 whitespace-nowrap">
        ₹{item.priceAtAddition.toFixed(2)}
      </td>

      {/* Quantity Stepper Column (- 1 +) */}
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="inline-flex items-center border border-gray-200 rounded-lg bg-gray-50 p-0.5">
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition-all cursor-pointer font-bold text-xs"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-8 text-center font-bold text-xs text-gray-900">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition-all cursor-pointer font-bold text-xs"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </td>

      {/* Line Total Column */}
      <td className="py-4 px-4 text-sm font-bold text-gray-900 whitespace-nowrap">
        ₹{lineTotal.toFixed(2)}
      </td>

      {/* Remove (X) Column */}
      <td className="py-4 pl-4 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 inline-flex items-center justify-center transition-all cursor-pointer"
          aria-label="Remove item"
        >
          <span className="material-symbols-outlined text-[1.1rem]">close</span>
        </button>
      </td>
    </tr>
  );
};
