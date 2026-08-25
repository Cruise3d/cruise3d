import React from 'react';
import type { OrderStatus } from '../types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const normalized = (status || 'placed').toLowerCase() as OrderStatus;
  const label = ORDER_STATUS_LABELS[normalized] ?? status;
  const colorClass =
    ORDER_STATUS_COLORS[normalized] ??
    'bg-surface-container text-on-surface border-surface-container-highest';

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
};

export default OrderStatusBadge;
