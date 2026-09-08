import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../app/store/authStore';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { getMyOrders } from '../../orders/api';
import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from '../api';
import type { Address, CreateAddressRequest } from '../types';
import type { Order } from '../../orders/types';

type ProfileTab = 'account' | 'orders' | 'addresses';

export const UserProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>('account');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [addressForm, setAddressForm] = useState<CreateAddressRequest>({
    fullName: '', addressLine: '', city: '', state: '', pincode: '', phone: '', isDefault: false,
  });
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);

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

  const loadAddresses = async () => {
    setAddressesLoading(true);
    setAddressError('');
    try {
      setAddresses(await getAddresses());
    } catch {
      setAddressError('Unable to load your saved addresses.');
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'addresses') void loadAddresses();
  }, [activeTab]);

  const openAddressForm = (address?: Address) => {
    setEditingAddressId(address?.id ?? null);
    setAddressForm(address
      ? { fullName: address.fullName, addressLine: address.addressLine, city: address.city, state: address.state, pincode: address.pincode, phone: address.phone || '', isDefault: address.isDefault }
      : { fullName: '', addressLine: '', city: '', state: '', pincode: '', phone: user?.phone || '', isDefault: addresses.length === 0 });
    setShowAddressForm(true);
  };

  const saveAddress = async () => {
    setAddressSaving(true);
    setAddressError('');
    try {
      if (editingAddressId) await updateAddress(editingAddressId, addressForm);
      else await createAddress(addressForm);
      setShowAddressForm(false);
      await loadAddresses();
    } catch {
      setAddressError('Unable to save this address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const makeDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      await loadAddresses();
    } catch {
      setAddressError('Unable to update the default address.');
    }
  };

  const removeAddress = async (id: string) => {
    try {
      await deleteAddress(id);
      await loadAddresses();
    } catch {
      setAddressError('This address may already be attached to an order.');
    }
  };

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
            Manage your account and view your orders
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

                <div className="mt-8 border-t border-surface-container-highest pt-6">
                  <h2 className="text-xl font-bold text-error mb-4">Danger Zone</h2>
                  <p className="text-on-surface-variant mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="danger">Delete Account</Button>
                </div>
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
                  <Button variant="outline" onClick={() => openAddressForm()}>
                    <span className="material-symbols-outlined">add</span>
                    Add Address
                  </Button>
                </div>
                {addressError && <p className="mb-4 text-sm text-error">{addressError}</p>}
                {showAddressForm && (
                  <div className="mb-6 rounded-xl border border-surface-container-highest bg-surface-container p-5 space-y-4">
                    <h3 className="font-semibold text-on-surface">{editingAddressId ? 'Edit Address' : 'New Address'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(['fullName', 'addressLine', 'city', 'state', 'pincode', 'phone'] as const).map((field) => (
                        <Input
                          key={field}
                          label={{ fullName: 'Full Name', addressLine: 'Address', city: 'City', state: 'State', pincode: 'PIN Code', phone: 'Phone' }[field]}
                          type={field === 'phone' ? 'tel' : 'text'}
                          value={addressForm[field]}
                          onChange={(event) => setAddressForm((current) => ({ ...current, [field]: event.target.value }))}
                          className={field === 'addressLine' ? 'md:col-span-2' : undefined}
                        />
                      ))}
                    </div>
                    <label className="flex items-center gap-2 text-sm text-on-surface">
                      <input type="checkbox" checked={addressForm.isDefault} onChange={(event) => setAddressForm((current) => ({ ...current, isDefault: event.target.checked }))} />
                      Make this my default address
                    </label>
                    <div className="flex gap-3">
                      <Button variant="primary" onClick={() => void saveAddress()} isLoading={addressSaving}>Save</Button>
                      <Button variant="outline" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
                {addressesLoading ? (
                  <p className="py-8 text-center text-on-surface-variant">Loading addresses...</p>
                ) : addresses.length === 0 ? (
                  <p className="py-8 text-center text-on-surface-variant">No saved addresses yet.</p>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="bg-surface-container rounded-xl p-6 border border-surface-container-highest">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-on-surface">{address.fullName}</p>
                            <p className="text-on-surface-variant mt-1">{address.addressLine}</p>
                            <p className="text-on-surface-variant">{address.city}, {address.state} {address.pincode}</p>
                            {address.phone && <p className="text-on-surface-variant">Phone: {address.phone}</p>}
                          </div>
                          {address.isDefault && <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">Default</span>}
                        </div>
                        <div className="mt-4 pt-4 border-t border-surface-container-highest flex flex-wrap gap-3">
                          <Button variant="ghost" size="sm" onClick={() => openAddressForm(address)}>Edit</Button>
                          {!address.isDefault && <Button variant="ghost" size="sm" onClick={() => void makeDefault(address.id)}>Set as default</Button>}
                          <Button variant="ghost" size="sm" className="text-error hover:bg-error-container" onClick={() => void removeAddress(address.id)}>Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
};

export default UserProfilePage;
