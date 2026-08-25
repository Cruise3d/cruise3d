import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../app/store/authStore';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { getMyOrders } from '../../orders/api';
import type { Order } from '../../orders/types';

type ProfileTab = 'account' | 'orders' | 'addresses' | 'settings';

export const UserProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>('account');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (activeTab !== 'orders') return;
    let cancelled = false;
    setOrdersLoading(true);
    getMyOrders()
      .then((list) => {
        if (!cancelled) setOrders(list);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateUser(formData);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const tabs: { key: ProfileTab; label: string; icon: string }[] = [
    { key: 'account', label: 'Account', icon: 'person' },
    { key: 'orders', label: 'Orders', icon: 'receipt_long' },
    { key: 'addresses', label: 'Addresses', icon: 'location_on' },
    { key: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      placed: 'bg-blue-100 text-blue-700 border-blue-200',
      processing: 'bg-amber-100 text-amber-700 border-amber-200',
      printing: 'bg-purple-100 text-purple-700 border-purple-200',
      shipped: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <main className="min-h-screen bg-surface px-6 py-12">
      <div className="mx-auto max-w-container-max">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-on-surface">My Account</h1>
          <p className="text-on-surface-variant mt-1">
            Manage your account settings and view your orders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest p-4">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-surface-container-highest">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-lg">
                  {user?.firstName?.[0] || 'U'}
                  {user?.lastName?.[0] || ''}
                </div>
                <div>
                  <p className="font-semibold text-on-surface">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-on-surface-variant">{user?.email}</p>
                </div>
              </div>

              {/* Tabs */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      activeTab === tab.key
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-error hover:bg-error-container transition-colors"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-on-surface">Profile Information</h2>
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <span className="material-symbols-outlined">edit</span>
                      Edit
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    icon="person"
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    icon="person"
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    icon="mail"
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    icon="phone"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-3 mt-6 pt-6 border-t border-surface-container-highest">
                    <Button variant="primary" onClick={handleSaveProfile} isLoading={isSaving}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-on-surface">My Orders</h2>
                  <Link to="/orders" className="text-sm font-medium text-primary hover:text-primary-container">
                    View All
                  </Link>
                </div>

                {ordersLoading ? (
                  <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest p-12 text-center text-on-surface-variant">
                    Loading your orders…
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-outline mb-4">
                      receipt_long
                    </span>
                    <h3 className="text-lg font-semibold text-on-surface mb-2">No orders yet</h3>
                    <p className="text-on-surface-variant mb-6">Start shopping to see your orders here</p>
                    <Link to="/products">
                      <Button variant="primary">Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-surface-container-low rounded-2xl border border-surface-container-highest p-6"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div>
                            <p className="font-semibold text-on-surface">Order #{order.orderNumber}</p>
                            <p className="text-sm text-on-surface-variant">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>

                        {(() => {
                          const items = Array.isArray(order.items)
                            ? order.items
                            : Array.isArray((order as unknown as Record<string, unknown>).orderItems)
                            ? ((order as unknown as Record<string, unknown>).orderItems as typeof order.items)
                            : [];
                          const firstItem = items[0];
                          const rawFirst = firstItem as unknown as Record<string, unknown> | undefined;
                          const image = firstItem?.productImage || (rawFirst?.productImageUrl as string) || '';
                          const title = firstItem?.productTitle || (rawFirst?.title as string) || 'Order Item';
                          const totalAmt = order.total ?? (order as unknown as Record<string, number>).totalAmount ?? 0;

                          return (
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                                {image ? (
                                  <img
                                    src={image}
                                    alt={title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-[10px] text-on-surface-variant">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-on-surface truncate">{title}</p>
                                <p className="text-sm text-on-surface-variant">
                                  {items.length > 1
                                    ? `${items.length} items`
                                    : firstItem
                                    ? `Qty: ${firstItem.quantity ?? 1}`
                                    : 'No items'}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-on-surface">₹{totalAmt.toFixed(2)}</p>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="mt-4 pt-4 border-t border-surface-container-highest flex gap-3">
                          <Link to={`/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          {(() => {
                            const trackingId = (order.dtdcTrackingId || order.trackingNumber || '').trim();
                            if (trackingId) {
                              return (
                                <a
                                  href={`https://track.dtdc.com/tracking?trNo=${encodeURIComponent(trackingId)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-container px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-base">local_shipping</span>
                                  Track Package
                                </a>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-on-surface">Saved Addresses</h2>
                  <Button variant="outline">
                    <span className="material-symbols-outlined">add</span>
                    Add Address
                  </Button>
                </div>

                <div className="bg-surface-container rounded-xl p-6 border border-surface-container-highest">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-on-surface">John Doe</p>
                      <p className="text-on-surface-variant mt-1">123 Main Street</p>
                      <p className="text-on-surface-variant">San Francisco, CA 94102</p>
                      <p className="text-on-surface-variant">United States</p>
                      <p className="text-on-surface-variant mt-1">+1 (555) 123-4567</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                      Default
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-surface-container-highest flex gap-3">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-error hover:bg-error-container">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest p-6">
                  <h2 className="text-xl font-bold text-on-surface mb-6">Notification Settings</h2>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-medium text-on-surface">Email Notifications</p>
                        <p className="text-sm text-on-surface-variant">Receive order updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-medium text-on-surface">SMS Notifications</p>
                        <p className="text-sm text-on-surface-variant">Receive SMS updates for orders</p>
                      </div>
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-medium text-on-surface">Marketing Emails</p>
                        <p className="text-sm text-on-surface-variant">Receive promotional offers and news</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-2xl border border-surface-container-highest p-6">
                  <h2 className="text-xl font-bold text-on-surface mb-6">Security</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-on-surface">Password</p>
                        <p className="text-sm text-on-surface-variant">Last changed 30 days ago</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Change Password
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-on-surface">Two-Factor Authentication</p>
                        <p className="text-sm text-on-surface-variant">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-2xl border border-error/20 p-6">
                  <h2 className="text-xl font-bold text-error mb-4">Danger Zone</h2>
                  <p className="text-on-surface-variant mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="danger">Delete Account</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserProfilePage;
