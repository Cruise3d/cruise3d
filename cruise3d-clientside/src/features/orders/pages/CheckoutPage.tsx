import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../cart/useCartStore';
import { CheckoutStepper, type CheckoutStep } from '../components/CheckoutStepper';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { createRazorpayOrder, verifyPayment, getMyOrders } from '../api';
import { createAddress } from '../../profile/api';
import type { AddressId, CreateAddressRequest } from '../../profile/types';
import type {
  ShippingAddress,
  PaymentMethod,
} from '../types';

const initialShippingAddress: ShippingAddress = {
  fullName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  country: 'India',
  state: '',
  city: '',
  zipCode: '',
};

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'United Arab Emirates', 'Singapore'];

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getSubtotal } = useCartStore();
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([]);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(initialShippingAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutAddressId, setCheckoutAddressId] = useState<AddressId>('');
  const [paymentStage, setPaymentStage] = useState<'idle' | 'creating-order' | 'opening-checkout' | 'verifying' | 'failed'>('idle');

  const subtotal = getSubtotal();
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 20.0;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  const [errors, setErrors] = useState<Record<string, string>>({});

  const buildCreateAddressPayload = (
    address: ShippingAddress
  ): CreateAddressRequest => ({
    fullName: address.fullName.trim(),
    addressLine: [address.addressLine1.trim(), address.addressLine2?.trim()]
      .filter(Boolean)
      .join(', '),
    city: address.city.trim(),
    state: address.state.trim(),
    pincode: address.zipCode.trim(),
  });

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null) {
      const typedError = error as {
        message?: string;
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
      };

      return (
        typedError.response?.data?.message ||
        typedError.response?.data?.error ||
        typedError.message ||
        fallback
      );
    }

    return fallback;
  };

  const validateShippingAddress = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!shippingAddress.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!shippingAddress.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email))
      newErrors.email = 'Invalid email address';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone is required';
    if (!shippingAddress.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!shippingAddress.country) newErrors.country = 'Country is required';
    if (!shippingAddress.state) newErrors.state = 'State is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.zipCode.trim()) {
      newErrors.zipCode = 'PIN code is required';
    } else if (shippingAddress.country === 'India' && !/^\d{6}$/.test(shippingAddress.zipCode.trim())) {
      newErrors.zipCode = 'Enter a valid 6-digit PIN code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 'shipping') {
      if (!validateShippingAddress()) return;
      addCompletedStep('shipping');
      setCurrentStep('summary');
    } else if (currentStep === 'summary') {
      addCompletedStep('summary');
      placeOrder();
    }
  };

  const addCompletedStep = (step: CheckoutStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const placeOrder = async () => {
    // Prevent duplicate submissions
    if (isProcessing) return;

    if (!items || items.length === 0) {
      setErrors((prev) => ({ ...prev, submit: 'Your cart is empty.' }));
      return;
    }

    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, submit: '' }));
    setCheckoutAddressId('');

    try {
      const createAddressPayload = buildCreateAddressPayload(shippingAddress);

      setPaymentStage('creating-order');
      const createdAddress = await createAddress(createAddressPayload);

      if (!createdAddress?.id) {
        throw new Error('Address creation failed. Missing address id from backend.');
      }

      setCheckoutAddressId(createdAddress.id);
      const currentAddressId = createdAddress.id;
      const persistedAddressId = checkoutAddressId;

      if (persistedAddressId && persistedAddressId !== currentAddressId) {
        throw new Error('Checkout address id mismatch. Please retry checkout.');
      }

      // 1) Create Razorpay order on backend for every payment method
      const razorResp = await createRazorpayOrder({ addressId: currentAddressId });
      setPaymentStage('opening-checkout');

      const { key, orderId, amount, currency } = razorResp;

      if (!key || !orderId) {
        throw new Error('Payment initialization failed. Missing payment gateway configuration.');
      }

      // Load Razorpay SDK once
      await new Promise<void>((resolve, reject) => {
        if (typeof (window as any).Razorpay !== 'undefined') return resolve();
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load payment gateway. Please check your network.'));
        document.body.appendChild(script);
      });

      // Prepare options
      const options: any = {
        key,
        amount,
        currency,
        order_id: orderId,
        name: 'Cruise3D',
        description: 'Order Checkout',
        handler: async (response: any) => {
          // Called when payment succeeds in the Razorpay popup
          setIsProcessing(true);
          setPaymentStage('verifying');
          try {
            if (
              !response?.razorpay_order_id ||
              !response?.razorpay_payment_id ||
              !response?.razorpay_signature
            ) {
              throw new Error('Incomplete payment response received from gateway.');
            }

            if (!currentAddressId.trim()) {
              throw new Error('Address id is missing. Payment verification was stopped.');
            }

            const verifyPayload = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              addressId: currentAddressId,
            };

            // 3) Verify payment with backend
            const verifiedOrder = await verifyPayment(verifyPayload);

            // Backend verification succeeded. Refresh cart and orders, navigate to success.
            // Clear local cart state immediately
            useCartStore.getState().reset();
            // Refresh cart from backend to reflect server-side state
            await useCartStore.getState().fetchCart();

            // Trigger a refresh of orders (best-effort)
            try {
              await getMyOrders();
            } catch {}

            // Navigate to order detail / success page
            navigate(`/orders/${verifiedOrder.id}`, { state: { order: verifiedOrder } });

          } catch (err) {
            const message = err instanceof Error ? err.message : 'Payment verification failed.';
            setErrors((prev) => ({ ...prev, submit: message }));
            setPaymentStage('failed');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the checkout popup
            setIsProcessing(false);
            setPaymentStage('idle');
            setErrors((prev) => ({ ...prev, submit: 'Payment window was closed. You can retry.' }));
          },
        },
      };

      // Create instance and attach failure handler
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        const msg = resp?.error?.description || 'Payment failed. Please try another method.';
        setErrors((prev) => ({ ...prev, submit: msg }));
        setPaymentStage('failed');
        setIsProcessing(false);
      });

      // Open checkout
      rzp.open();

    } catch (error) {
      const message = getErrorMessage(error, 'Failed to start payment. Please try again.');
      setErrors((prev) => ({ ...prev, submit: message }));
      setPaymentStage('failed');
      setIsProcessing(false);
    }
  };

  const handleStepClick = (step: CheckoutStep) => {
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
    }
  };

  const renderAddressForm = (
    address: ShippingAddress,
    title: string
  ) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Full Name"
            value={address.fullName}
            onChange={(e) => {
              setErrors((prev) => ({ ...prev, fullName: '' }));
              setShippingAddress({ ...shippingAddress, fullName: e.target.value });
            }}
            error={errors.fullName}
            icon="person"
          />
        </div>
        <div className="md:col-span-2">
          <Input
            label="Email"
            type="email"
            value={address.email}
            onChange={(e) => {
              setErrors((prev) => ({ ...prev, email: '' }));
              setShippingAddress({ ...shippingAddress, email: e.target.value });
            }}
            error={errors.email}
            icon="mail"
          />
        </div>
        <div className="md:col-span-2">
          <Input
            label="Phone"
            type="tel"
            value={address.phone}
            onChange={(e) => {
              setErrors((prev) => ({ ...prev, phone: '' }));
              setShippingAddress({ ...shippingAddress, phone: e.target.value });
            }}
            error={errors.phone}
            icon="phone"
          />
        </div>
        <div className="md:col-span-2">
          <Input
            label="Address Line 1"
            value={address.addressLine1}
            onChange={(e) => {
              setErrors((prev) => ({ ...prev, addressLine1: '' }));
              setShippingAddress({ ...shippingAddress, addressLine1: e.target.value });
            }}
            error={errors.addressLine1}
            icon="home"
          />
        </div>
        <div className="md:col-span-2">
          <Input
            label="Address Line 2 (Optional)"
            value={address.addressLine2 || ''}
            onChange={(e) => {
              setShippingAddress({ ...shippingAddress, addressLine2: e.target.value });
            }}
            icon="apartment"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Country</label>
          <select
            value={address.country}
            onChange={(e) => {
              setErrors((prev) => ({ ...prev, country: '' }));
              setShippingAddress({ ...shippingAddress, country: e.target.value });
            }}
            className="w-full px-3.5 py-2 text-sm bg-white border rounded-lg border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          >
            <option value="">Select Country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-xs text-red-600 mt-1">{errors.country}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">State</label>
          <select
            value={address.state}
            onChange={(e) => {
              setErrors((prev) => ({ ...prev, state: '' }));
              setShippingAddress({ ...shippingAddress, state: e.target.value });
            }}
            className="w-full px-3.5 py-2 text-sm bg-white border rounded-lg border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-xs text-red-600 mt-1">{errors.state}</p>
          )}
        </div>
        <div>
          <Input
            label="City"
            value={address.city}
            onChange={(e) => {
              setErrors((prev) => ({ ...prev, city: '' }));
              setShippingAddress({ ...shippingAddress, city: e.target.value });
            }}
            error={errors.city}
            icon="location_city"
          />
        </div>
        <div>
          <Input
            label="PIN Code"
            placeholder="6-digit PIN code"
            value={address.zipCode}
            onChange={(e) => {
              setErrors((prev) => ({ ...prev, zipCode: '' }));
              setShippingAddress({ ...shippingAddress, zipCode: e.target.value });
            }}
            error={errors.zipCode}
            icon="pin_drop"
          />
        </div>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-on-surface">Order Summary</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-container-highest"
          >
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container">
              <img
                src={item.product.images?.[0] ?? FALLBACK_IMAGE}
                alt={item.product.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-on-surface text-sm truncate">
                {item.product.title}
              </h4>
              <p className="text-xs text-on-surface-variant truncate">
                {item.selectedFinish || item.product.material}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-on-surface-variant">Qty: {item.quantity}</span>
                <span className="font-semibold text-on-surface text-sm">
                  ₹{(item.priceAtAddition * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-4 border-t border-surface-container-highest">
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">Subtotal</span>
          <span className="font-medium text-on-surface">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">Shipping</span>
          <span className="font-medium text-on-surface">
            {shipping === 0 ? (
              <span className="text-tertiary font-bold">FREE</span>
            ) : (
              `₹${shipping.toFixed(2)}`
            )}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">Tax (5%)</span>
          <span className="font-medium text-on-surface">₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-surface-container-highest text-base font-bold">
          <span className="text-on-surface">Total</span>
          <span className="text-primary text-xl">₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  const renderPaymentMethod = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-on-surface">Payment Method</h3>
      <div className="space-y-3">
        <label
          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            paymentMethod === 'credit-card'
              ? 'border-primary bg-primary/5'
              : 'border-surface-container-highest hover:border-surface-container-high'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="credit-card"
            checked={paymentMethod === 'credit-card'}
            onChange={() => setPaymentMethod('credit-card')}
            className="w-4 h-4 text-primary"
          />
          <span className="material-symbols-outlined text-2xl text-on-surface-variant">
            credit_card
          </span>
          <div className="flex-1">
            <span className="font-medium text-on-surface">Credit / Debit Card</span>
            <p className="text-xs text-on-surface-variant">Visa, Mastercard, Amex</p>
          </div>
        </label>

        <label
          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            paymentMethod === 'upi'
              ? 'border-primary bg-primary/5'
              : 'border-surface-container-highest hover:border-surface-container-high'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="upi"
            checked={paymentMethod === 'upi'}
            onChange={() => setPaymentMethod('upi')}
            className="w-4 h-4 text-primary"
          />
          <span className="material-symbols-outlined text-2xl text-on-surface-variant">
            qr_code
          </span>
          <div className="flex-1">
            <span className="font-medium text-on-surface">UPI</span>
            <p className="text-xs text-on-surface-variant">Pay with UPI ID</p>
          </div>
        </label>

        <label
          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            paymentMethod === 'cod'
              ? 'border-primary bg-primary/5'
              : 'border-surface-container-highest hover:border-surface-container-high'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={paymentMethod === 'cod'}
            onChange={() => setPaymentMethod('cod')}
            className="w-4 h-4 text-primary"
          />
          <span className="material-symbols-outlined text-2xl text-on-surface-variant">
            payments
          </span>
          <div className="flex-1">
            <span className="font-medium text-on-surface">Cash on Delivery</span>
            <p className="text-xs text-on-surface-variant">Pay when you receive</p>
          </div>
        </label>
      </div>

      {paymentMethod === 'credit-card' && (
        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-4">
          <Input label="Card Number" placeholder="1234 5678 9012 3456" icon="credit_card" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Expiry Date" placeholder="MM/YY" />
            <Input label="CVV" placeholder="123" type="password" />
          </div>
          <Input label="Cardholder Name" placeholder="John Doe" icon="person" />
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
          <Input label="UPI ID" placeholder="yourname@upi" icon="qr_code" />
        </div>
      )}
    </div>
  );

  const paymentFlowSteps = [
    {
      key: 'creating-order',
      label: 'Create Razorpay order',
      description:
        'Your checkout details are sent to the backend and a payment order is created.',
    },
    {
      key: 'opening-checkout',
      label: 'Open Razorpay checkout',
      description:
        'The Razorpay popup opens with the amount and order ID from the backend.',
    },
    {
      key: 'verifying',
      label: 'Verify payment on the server',
      description:
        'After a successful payment, the signature is verified before the order is confirmed.',
    },
    {
      key: 'idle',
      label: 'Finished or retry',
      description: 'If payment is closed or fails, you can retry from this step.',
    },
  ] as const;

  const paymentStageLabel = {
    idle: 'Ready',
    'creating-order': 'Creating order',
    'opening-checkout': 'Opening checkout',
    verifying: 'Verifying payment',
    failed: 'Payment needs retry',
  }[paymentStage];

  const paymentStageDescription = {
    idle: 'Start payment to create a Razorpay order and open the checkout popup.',
    'creating-order': 'Sending checkout data to the backend right now.',
    'opening-checkout': 'Waiting for the Razorpay popup to appear.',
    verifying: 'Payment succeeded in the popup and the backend is confirming it.',
    failed: 'The last payment attempt did not complete. Check the message above and try again.',
  }[paymentStage];

  return (
    <main className="min-h-screen bg-surface px-6 py-12">
      <div className="mx-auto max-w-container-max">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-on-surface">Checkout</h1>
          <p className="text-on-surface-variant mt-1">
            Complete your order in a few simple steps
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 bg-surface-container-low rounded-2xl p-6 border border-surface-container-highest">
          <CheckoutStepper
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            {currentStep === 'shipping' && (
              <div className="bg-surface-container-low rounded-2xl p-6 border border-surface-container-highest space-y-6">
                {renderAddressForm(shippingAddress, 'Shipping Address')}
              </div>
            )}

            {/* Summary + Payment */}
            {currentStep === 'summary' && (
              <div className="bg-surface-container-low rounded-2xl p-6 border border-surface-container-highest space-y-6">
                <div className="rounded-2xl border border-surface-container-highest bg-surface p-4">
                  {renderOrderSummary()}
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-primary">Payment flow</p>
                      <h4 className="text-base font-bold text-on-surface">
                        Order summary then Razorpay opens immediately
                      </h4>
                    </div>
                    <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-on-surface-variant border border-surface-container-highest">
                      {paymentStageLabel}
                    </span>
                  </div>

                  <p className="text-sm text-on-surface-variant">{paymentStageDescription}</p>

                  <div className="grid gap-3 md:grid-cols-2">
                    {paymentFlowSteps.map((step) => {
                      const isActive = step.key === paymentStage;
                      const isComplete =
                        (paymentStage === 'verifying' && step.key !== 'idle') ||
                        (paymentStage === 'failed' && step.key === 'idle');

                      return (
                        <div
                          key={step.key}
                          className={`rounded-xl border p-3 transition-colors ${
                            isActive
                              ? 'border-primary bg-surface'
                              : isComplete
                              ? 'border-emerald-200 bg-emerald-50'
                              : 'border-surface-container-highest bg-surface'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                isActive
                                  ? 'bg-primary text-on-primary'
                                  : isComplete
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-surface-container-highest text-on-surface-variant'
                              }`}
                            >
                              {isComplete
                                ? '✓'
                                : step.key === 'idle'
                                ? paymentFlowSteps.length
                                : paymentFlowSteps.findIndex((item) => item.key === step.key) + 1}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-on-surface">{step.label}</p>
                              <p className="text-xs text-on-surface-variant mt-1">{step.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {renderPaymentMethod()}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4">
              {errors.submit && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex-1">
                  {errors.submit}
                </div>
              )}
              {currentStep !== 'shipping' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentIndex = ['shipping', 'summary'].indexOf(currentStep);
                    if (currentIndex > 0) {
                      setCurrentStep(
                        ['shipping', 'summary'][currentIndex - 1] as CheckoutStep
                      );
                    }
                  }}
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Back
                </Button>
              )}
              <div className="flex-1" />
              <Button
                variant="primary"
                size="lg"
                onClick={handleNextStep}
                isLoading={isProcessing}
                className="min-w-[180px]"
              >
                {currentStep === 'summary' ? (
                  <>
                    Pay with Razorpay
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                ) : (
                  <>
                    Save & Continue
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-surface-container-low rounded-2xl p-6 border border-surface-container-highest">
              <h3 className="text-lg font-bold text-on-surface mb-4">Order Summary</h3>

              {/* Mini Item Cards */}
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container">
                      <img
                        src={item.product.images?.[0] ?? FALLBACK_IMAGE}
                        alt={item.product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-on-surface text-sm truncate">
                        {item.product.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-on-surface text-sm">
                      ₹{(item.priceAtAddition * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-surface-container-highest">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-medium text-on-surface">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Shipping</span>
                  <span className="font-medium text-on-surface">
                    {shipping === 0 ? (
                      <span className="text-tertiary font-bold">FREE</span>
                    ) : (
                      `₹${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Tax (5%)</span>
                  <span className="font-medium text-on-surface">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-surface-container-highest text-base font-bold">
                  <span className="text-on-surface">Total</span>
                  <span className="text-primary text-xl">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
