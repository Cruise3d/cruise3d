import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { getMyOrderById } from '../api';
import {
  type Order,
  type OrderStatus,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_TIMELINE,
} from '../types';

export const OrderDetailPage: React.FC = () => {
  const location = useLocation();
  const { orderId } = useParams<{ orderId: string }>();
  const passedOrder = (location.state as { order?: Order } | null)?.order;

  const [order, setOrder] = useState<Order | null>(passedOrder ?? null);
  const [isLoading, setIsLoading] = useState(!passedOrder);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (passedOrder) {
      setOrder(passedOrder);
      setIsLoading(false);
      return;
    }
    if (!orderId) {
      setError('Order not found.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getMyOrderById(orderId)
      .then((fetched) => {
        if (!cancelled) setOrder(fetched);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load order.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, passedOrder]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-surface px-6 py-24 flex items-center justify-center">
        <p className="text-base font-medium text-on-surface-variant">
          Loading order…
        </p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-surface px-6 py-12">
        <div className="mx-auto max-w-container-max text-center">
          <h1 className="text-3xl font-bold text-on-surface">Order not found</h1>
          <p className="mt-2 text-on-surface-variant">
            {error ?? 'We could not find this order.'}
          </p>
          <Link
            to="/orders"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-container"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to orders
          </Link>
        </div>
      </main>
    );
  }

  const statusKey = (order.status?.toLowerCase() ?? 'placed') as OrderStatus;
  const statusLabel = ORDER_STATUS_LABELS[statusKey] ?? order.status ?? 'Order Placed';
  const statusColor = ORDER_STATUS_COLORS[statusKey] ?? 'bg-surface-container text-on-surface border-surface-container-highest';
  const currentStatusIndex = ORDER_STATUS_TIMELINE.indexOf(statusKey) !== -1
    ? ORDER_STATUS_TIMELINE.indexOf(statusKey)
    : 0;

  const items = Array.isArray(order.items)
    ? order.items
    : Array.isArray((order as unknown as Record<string, unknown>).orderItems)
    ? ((order as unknown as Record<string, unknown>).orderItems as Order['items'])
    : [];

  const subtotal = order.subtotal ?? (order as unknown as Record<string, number>).subtotal ?? 0;
  const shipping = order.shipping ?? (order as unknown as Record<string, number>).shippingCharge ?? 0;
  const tax = order.tax ?? 0;
  const total = order.total ?? (order as unknown as Record<string, number>).totalAmount ?? 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAddress = (address?: Order['billingAddress'] | Order['shippingAddress']) => {
    if (!address) {
      return <p className="text-sm text-on-surface-variant">No address provided</p>;
    }
    const raw = address as unknown as Record<string, string>;
    const fullName = address.fullName || raw.name || '';
    const line1 = address.addressLine1 || raw.addressLine || '';
    const line2 = address.addressLine2 || raw.addressLine2 || '';
    const city = address.city || raw.city || '';
    const state = address.state || raw.state || '';
    const zip = address.zipCode || raw.zipCode || raw.pincode || '';
    const country = address.country || raw.country || '';

    return (
      <address className="not-italic">
        {fullName && <p className="font-medium text-on-surface">{fullName}</p>}
        {line1 && <p className="text-on-surface-variant text-sm">{line1}</p>}
        {line2 && <p className="text-on-surface-variant text-sm">{line2}</p>}
        {(city || state || zip) && (
          <p className="text-on-surface-variant text-sm">
            {city}{city && state ? ', ' : ''}{state} {zip}
          </p>
        )}
        {country && <p className="text-on-surface-variant text-sm">{country}</p>}
      </address>
    );
  };

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case 'credit-card':
        return 'Credit / Debit Card';
      case 'upi':
        return 'UPI';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method || 'Online Payment';
    }
  };

  return (
    <main className="min-h-screen bg-surface px-6 py-12">
      <div className="mx-auto max-w-container-max">
        {/* Back Link */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium mb-6"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Orders
        </Link>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Order Details</h1>
            <p className="text-on-surface-variant mt-1">
              Order #{order.orderNumber || order.id}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Status Timeline */}
        <div className="bg-surface-container-low rounded-2xl p-6 border border-surface-container-highest mb-8">
          <h2 className="text-lg font-semibold text-on-surface mb-6">Order Status</h2>

          {/* Desktop Timeline */}
          <nav className="hidden md:block" aria-label="Order progress">
            <ol className="flex items-center justify-between">
              {ORDER_STATUS_TIMELINE.map((status, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isLast = index === ORDER_STATUS_TIMELINE.length - 1;

                return (
                  <li
                    key={status}
                    className={`relative flex-1 ${!isLast && 'pr-8 sm:pr-20'}`}
                  >
                    {/* Connector Line */}
                    {!isLast && (
                      <div
                        className={`absolute top-5 left-0 right-0 h-0.5 mx-auto ${
                          index < currentStatusIndex
                            ? 'bg-tertiary'
                            : 'bg-surface-container-highest'
                        }`}
                        style={{ left: 'auto', right: '-50%', width: '100%' }}
                        aria-hidden="true"
                      />
                    )}

                    <div className="relative flex flex-col items-center">
                      {/* Status Circle */}
                      <div
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                          isCompleted
                            ? 'border-tertiary bg-tertiary text-white'
                            : isCurrent
                            ? 'border-tertiary bg-surface text-tertiary ring-4 ring-tertiary/10'
                            : 'border-surface-container-highest bg-surface-container-low text-on-surface-variant'
                        }`}
                      >
                        {isCompleted ? (
                          <span className="material-symbols-outlined text-lg">check</span>
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>

                      {/* Status Label */}
                      <span
                        className={`mt-3 text-xs font-medium text-center max-w-[80px] transition-colors ${
                          isCurrent
                            ? 'text-tertiary'
                            : isCompleted
                            ? 'text-on-surface'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        {ORDER_STATUS_LABELS[status]}
                      </span>

                      {/* Date (if applicable) */}
                      {(isCompleted || isCurrent) && status !== 'delivered' && (
                        <span className="mt-1 text-[10px] text-on-surface-variant">
                          {status === 'placed' && formatDate(order.createdAt)}
                          {status === 'processing' && formatDate(order.updatedAt)}
                          {status === 'printing' && 'In Progress'}
                          {status === 'shipped' && order.trackingNumber && 'Shipped'}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Mobile Timeline */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-on-surface">
                {statusLabel}
              </span>
              <span className="text-sm text-on-surface-variant">
                Step {currentStatusIndex + 1} of {ORDER_STATUS_TIMELINE.length}
              </span>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-tertiary transition-all duration-300 ease-out rounded-full"
                style={{ width: `${((currentStatusIndex + 1) / ORDER_STATUS_TIMELINE.length) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {ORDER_STATUS_TIMELINE.map((status, index) => (
                <span
                  key={status}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                    index <= currentStatusIndex
                      ? 'border-tertiary bg-tertiary/10 text-tertiary'
                      : 'border-surface-container-highest bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  {index < currentStatusIndex && (
                    <span className="material-symbols-outlined text-xs mr-1">check</span>
                  )}
                  {ORDER_STATUS_LABELS[status]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-container-highest">
                <h2 className="text-lg font-semibold text-on-surface">Order Items</h2>
              </div>
              <div className="divide-y divide-surface-container-highest">
                {items.length === 0 ? (
                  <div className="p-6 text-on-surface-variant text-sm">
                    No items found for this order.
                  </div>
                ) : (
                  items.map((item, idx) => {
                    const raw = item as unknown as Record<string, unknown>;
                    const image = item.productImage || (raw.productImageUrl as string) || '';
                    const title = item.productTitle || (raw.title as string) || 'Product';
                    const finish = item.selectedFinish || (raw.colorName as string);
                    const price = item.priceAtAddition ?? (raw.priceAtPurchase as number) ?? (raw.price as number) ?? 0;
                    const quantity = item.quantity ?? 1;

                    return (
                      <div key={item.id || item.productId || idx} className="p-6 flex gap-4">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-surface-container">
                          {image ? (
                            <img
                              src={image}
                              alt={title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-on-surface-variant">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-on-surface">{title}</h3>
                          {finish && (
                            <p className="text-sm text-on-surface-variant mt-1">
                              {finish}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm text-on-surface-variant">
                              Qty: {quantity}
                            </span>
                            <span className="font-bold text-on-surface">
                              ${(price * quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-surface-container-low rounded-2xl p-6 border border-surface-container-highest">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-xl text-on-surface-variant">
                  local_shipping
                </span>
                <h2 className="text-lg font-semibold text-on-surface">Shipping Address</h2>
              </div>
              {formatAddress(order.shippingAddress)}
              {order.trackingNumber && (
                <div className="mt-4 pt-4 border-t border-surface-container-highest">
                  <p className="text-sm text-on-surface-variant">
                    Tracking: <span className="font-mono text-on-surface">{order.trackingNumber}</span>
                  </p>
                  {order.shippingCarrier && (
                    <p className="text-sm text-on-surface-variant">
                      Carrier: {order.shippingCarrier}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-surface-container-low rounded-2xl p-6 border border-surface-container-highest">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-xl text-on-surface-variant">
                  payment
                </span>
                <h2 className="text-lg font-semibold text-on-surface">Payment Method</h2>
              </div>
              <p className="text-on-surface">{getPaymentMethodLabel(order.paymentMethod)}</p>
              <p className="text-sm text-on-surface-variant mt-1">
                Payment status: <span className="font-semibold text-tertiary">Paid</span>
              </p>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-surface-container-low rounded-2xl p-6 border border-surface-container-highest">
              <h3 className="text-lg font-bold text-on-surface mb-4">Order Summary</h3>

              {/* Dates */}
              <div className="space-y-2 text-sm mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Order Date</span>
                  <span className="text-on-surface">{formatDate(order.createdAt)}</span>
                </div>
                {order.estimatedDelivery && (
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Est. Delivery</span>
                    <span className="text-on-surface">{formatDate(order.estimatedDelivery)}</span>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-surface-container-highest">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-medium text-on-surface">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Shipping</span>
                  <span className="font-medium text-on-surface">
                    {shipping === 0 ? (
                      <span className="text-tertiary font-bold">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Tax</span>
                  <span className="font-medium text-on-surface">${tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-surface-container-highest text-base font-bold">
                  <span className="text-on-surface">Total</span>
                  <span className="text-primary text-xl">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-surface-container-highest space-y-2">
                <Link to="/products" className="block">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderDetailPage;
