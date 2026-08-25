import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api';
import type { Order, OrderStatus } from '../types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../types';
import { Button } from '../../../components/ui/Button';

type FilterTab = 'all' | 'active' | 'delivered' | 'cancelled';

export const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load your order history.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const raw = order as unknown as Record<string, unknown>;
      const status = ((order.status || raw.status || 'placed') as string).toLowerCase();

      // Tab filter
      if (activeTab === 'active') {
        if (status === 'delivered' || status === 'cancelled') return false;
      } else if (activeTab === 'delivered') {
        if (status !== 'delivered') return false;
      } else if (activeTab === 'cancelled') {
        if (status !== 'cancelled') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const orderNum = (order.orderNumber || order.id || '').toLowerCase();
        const dtdc = (
          order.dtdcTrackingId ||
          (raw.dtdc_tracking_id as string) ||
          order.trackingNumber ||
          ''
        ).toLowerCase();

        const items = Array.isArray(order.items)
          ? order.items
          : Array.isArray(raw.orderItems)
          ? (raw.orderItems as Order['items'])
          : [];

        const hasMatchingItem = items.some((item) => {
          const itemRaw = item as unknown as Record<string, unknown>;
          const title = (item.productTitle || (itemRaw.title as string) || '').toLowerCase();
          return title.includes(q);
        });

        return orderNum.includes(q) || dtdc.includes(q) || hasMatchingItem;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  return (
    <main className="min-h-screen bg-surface px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-primary">
                receipt_long
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                My Orders
              </h1>
            </div>
            <p className="text-sm text-on-surface-variant mt-1">
              Track progress, view tracking IDs, and access past purchase details.
            </p>
          </div>

          <Link to="/products">
            <Button variant="outline" className="gap-2">
              <span className="material-symbols-outlined text-base">shopping_bag</span>
              Browse Products
            </Button>
          </Link>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-surface-container-low rounded-2xl p-4 border border-surface-container-highest mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {(
              [
                { key: 'all', label: 'All Orders', count: orders.length },
                {
                  key: 'active',
                  label: 'In Progress',
                  count: orders.filter(
                    (o) =>
                      !['delivered', 'cancelled'].includes(
                        (o.status || '').toLowerCase()
                      )
                  ).length,
                },
                {
                  key: 'delivered',
                  label: 'Delivered',
                  count: orders.filter(
                    (o) => (o.status || '').toLowerCase() === 'delivered'
                  ).length,
                },
                {
                  key: 'cancelled',
                  label: 'Cancelled',
                  count: orders.filter(
                    (o) => (o.status || '').toLowerCase() === 'cancelled'
                  ).length,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface hover:bg-surface-container text-on-surface-variant border border-surface-container-highest'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search by order ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-surface border border-surface-container-highest text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-surface-container-low rounded-2xl p-6 border border-surface-container-highest animate-pulse"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="h-5 w-40 bg-surface-container rounded-md" />
                  <div className="h-6 w-24 bg-surface-container rounded-full" />
                </div>
                <div className="h-16 bg-surface-container rounded-xl mb-4" />
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-surface-container rounded-md" />
                  <div className="h-9 w-28 bg-surface-container rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-2xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-red-600 mb-2">
              error
            </span>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-1">
              Could not load orders
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button variant="primary" onClick={fetchOrders}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State: No Orders at all */}
        {!isLoading && !error && orders.length === 0 && (
          <div className="bg-surface-container-low rounded-3xl border border-surface-container-highest p-12 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-surface-container mb-4">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                shopping_cart_checkout
              </span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">
              No orders placed yet
            </h2>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto mb-6">
              When you place an order for custom 3D prints or accessories, they will
              appear here with real-time tracking updates.
            </p>
            <Link to="/products">
              <Button variant="primary" className="gap-2">
                <span className="material-symbols-outlined text-sm">explore</span>
                Start Exploring
              </Button>
            </Link>
          </div>
        )}

        {/* Empty Filter Search Result */}
        {!isLoading && !error && orders.length > 0 && filteredOrders.length === 0 && (
          <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
              filter_list_off
            </span>
            <h3 className="text-lg font-semibold text-on-surface mb-1">
              No matching orders found
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Try changing your search term or switching the filter tab.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Order Cards List */}
        {!isLoading && !error && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const raw = order as unknown as Record<string, unknown>;
              const orderId = order.id || (raw.orderId as string);
              const orderNumber = order.orderNumber || (orderId ? orderId.slice(0, 8).toUpperCase() : 'ORDER');
              const statusKey = (
                (order.status || raw.status || 'placed') as string
              ).toLowerCase() as OrderStatus;
              const statusLabel =
                ORDER_STATUS_LABELS[statusKey] ?? order.status ?? 'Order Placed';
              const statusColor =
                ORDER_STATUS_COLORS[statusKey] ??
                'bg-surface-container text-on-surface border-surface-container-highest';

              const items = Array.isArray(order.items)
                ? order.items
                : Array.isArray(raw.orderItems)
                ? (raw.orderItems as Order['items'])
                : [];

              const totalAmount =
                order.total ??
                (raw.totalAmount as number) ??
                (raw.total as number) ??
                0;

              const placedDate =
                order.createdAt ||
                (raw.placedAt as string) ||
                (raw.createdAt as string);

              const dtdcTracking = (
                order.dtdcTrackingId ||
                (raw.dtdcTrackingId as string) ||
                (raw.dtdc_tracking_id as string) ||
                order.trackingNumber ||
                ''
              ).trim();

              return (
                <div
                  key={orderId}
                  className="bg-surface-container-low rounded-2xl border border-surface-container-highest overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card Top Info Bar */}
                  <div className="bg-surface-container/60 px-6 py-4 border-b border-surface-container-highest flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                          Order Number
                        </span>
                        <p className="text-sm font-bold text-on-surface">
                          #{orderNumber}
                        </p>
                      </div>
                      <div className="hidden sm:block h-7 w-[1px] bg-surface-container-highest" />
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                          Date Placed
                        </span>
                        <p className="text-sm text-on-surface">
                          {formatDate(placedDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-6">
                    {/* Items List */}
                    <div className="space-y-4 mb-6">
                      {items.map((item, idx) => {
                        const itemRaw = item as unknown as Record<string, unknown>;
                        const image =
                          item.productImage ||
                          (itemRaw.productImageUrl as string) ||
                          '';
                        const title =
                          item.productTitle ||
                          (itemRaw.title as string) ||
                          'Custom 3D Product';
                        const finish =
                          item.selectedFinish ||
                          (itemRaw.colorName as string);
                        const price =
                          item.priceAtAddition ??
                          (itemRaw.priceAtPurchase as number) ??
                          (itemRaw.price as number) ??
                          0;
                        const qty = item.quantity ?? 1;

                        return (
                          <div
                            key={item.id || item.productId || idx}
                            className="flex items-center gap-4"
                          >
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface border border-surface-container-highest">
                              {image ? (
                                <img
                                  src={image}
                                  alt={title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[10px] text-on-surface-variant">
                                  No Image
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-on-surface truncate">
                                {title}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-on-surface-variant">
                                <span>Qty: {qty}</span>
                                {finish && (
                                  <>
                                    <span>•</span>
                                    <span>{finish}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-bold text-on-surface">
                                ₹{(price * qty).toFixed(2)}
                              </p>
                              {qty > 1 && (
                                <p className="text-[11px] text-on-surface-variant">
                                  ₹{price.toFixed(2)} each
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DTDC Tracking Banner (if available) */}
                    {dtdcTracking && (
                      <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-primary text-xl">
                            local_shipping
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-primary">
                              DTDC Express Tracking: <span className="font-mono font-bold text-on-surface">{dtdcTracking}</span>
                            </p>
                            <p className="text-[11px] text-on-surface-variant">
                              Shipment dispatched with real-time courier updates.
                            </p>
                          </div>
                        </div>
                        <a
                          href={`https://track.dtdc.com/tracking?trNo=${encodeURIComponent(dtdcTracking)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline flex-shrink-0"
                        >
                          Track on DTDC
                          <span className="material-symbols-outlined text-xs">
                            open_in_new
                          </span>
                        </a>
                      </div>
                    )}

                    {/* Bottom Action / Total Footer */}
                    <div className="pt-4 border-t border-surface-container-highest flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-on-surface-variant">
                          Total Amount:
                        </span>{' '}
                        <span className="text-base font-bold text-on-surface">
                          ₹{totalAmount.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link to={`/orders/${orderId}`}>
                          <Button variant="primary" size="sm" className="gap-1.5">
                            <span>View Details</span>
                            <span className="material-symbols-outlined text-sm">
                              arrow_forward
                            </span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyOrdersPage;
