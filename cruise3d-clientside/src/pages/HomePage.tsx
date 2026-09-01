import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getFeaturedProducts } from '../features/products/api';
import { ProductGrid } from '../features/products/components/ProductGrid';
import { Button } from '../components/ui/Button';
import { theme } from '../styles/theme';
import type { Product } from '../features/products/types';

const trustBadges = [
  { icon: 'local_shipping', label: 'Free Express Shipping' },
  { icon: 'verified', label: 'Micron Precision' },
  { icon: 'lock', label: 'Encrypted Checkout' },
  { icon: 'payments', label: 'Flexible Payment' },
];

const featureSteps = [
  {
    icon: 'edit_note',
    title: '01. Generative Design',
    description:
      'Our design engineers utilize computational algorithms to create structures that were once impossible to manufacture. Every curve is optimized for strength and weight.',
  },
  {
    icon: 'precision_manufacturing',
    title: '02. Additive Printing',
    description:
      'Using state-of-the-art SLA and DMLS technologies, we bring designs to life with micron-level precision. Our material library includes medical-grade polymers and titanium alloys.',
  },
  {
    icon: 'inventory_2',
    title: '03. Quality Deliver',
    description:
      'Each piece undergoes a rigorous quality control check before being hand-packed in sustainable housing. Your precision-engineered object arrives ready for display.',
  },
];

type ContactCard =
  | {
      icon: string;
      title: string;
      value: string;
      href: string;
    }
  | {
      icon: string;
      title: string;
      value: string | string[];
      href?: undefined;
    };

const contactCards: ContactCard[] = [
  {
    icon: 'call',
    title: 'Phone / WhatsApp',
    value: '+91 8719897391',
    href: 'tel:+918719897391',
  },
  {
    icon: 'mail',
    title: 'Email',
    value: 'support@cruise3d.in',
    href: 'mailto:support@cruise3d.in',
  },
  {
    icon: 'schedule',
    title: 'Business Hours',
    value: ['Monday - Saturday', '9:00 AM - 7:00 PM IST'],
  },
  {
    icon: 'support_agent',
    title: 'Customer Support',
    value:
      "For order inquiries, shipping queries, or product-related information, please email us and we'll respond within 24-48 hours.",
  },
  {
    icon: 'location_on',
    title: 'Business Address',
    value: [
      'Cruise Technologies',
      '2nd Floor',
      'Vengalethu Towers',
      'ONK Junction',
      'Kayamkulam',
      'Alappuzha District, Kerala',
      'India',
    ],
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getFeaturedProducts()
      .then((items) => {
        if (!cancelled) setFeatured(items.slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setFeatured([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { colors, shadows } = theme;

  return (
    <div className="overflow-hidden" style={{ backgroundColor: colors.background.page }}>
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden bg-white pb-20 pt-28 md:pt-36 border-b"
        style={{ borderColor: colors.border.DEFAULT }}
      >
        <div 
          className="hero-gradient absolute inset-0 opacity-95"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colors.surface.tint} 0%, ${colors.background.DEFAULT} 70%)`,
          }}
        />
        <div className="relative mx-auto grid max-w-[1280px] gap-16 px-6 md:grid-cols-12 md:items-center">
          <div className="md:col-span-6 space-y-8">
            <div 
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]"
              style={{
                backgroundColor: colors.surface.low,
                color: colors.text.primary,
              }}
            >
              <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
              Next-Gen Additive Manufacturing
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-tight">
              <span style={{ color: colors.text.primary }}>Precision in </span>
              <span className="block" style={{ color: colors.primary.DEFAULT }}>Every Layer</span>
            </h1>
            <p className="max-w-xl text-base sm:text-lg leading-8 font-normal" style={{ color: colors.text.secondary }}>
              Expertly crafted 3D-printed products delivered to your door. Experience the fusion of surgical precision and artistic vision.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/products">
                <Button variant="primary" size="lg" icon="shopping_bag" iconPosition="right">
                  Shop the Collection
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" size="lg">
                  Explore Materials
                </Button>
              </Link>
            </div>
          </div>

          <div className="md:col-span-6 flex items-center justify-center">
            <div 
              className="relative h-[420px] w-full max-w-2xl rounded-2xl p-4 border"
              style={{
                backgroundColor: colors.surface.container,
                borderColor: colors.border.DEFAULT,
                boxShadow: shadows.lg,
              }}
            >
              <div 
                className="absolute inset-0 rounded-full blur-3xl"
                style={{
                  backgroundColor: colors.primary[50],
                  opacity: 0.1,
                }}
              />
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                alt="A sleek 3D-printed titanium kinetic object rendered with high precision"
                className="relative h-full w-full object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section 
        className="bg-white py-12 border-b"
        style={{ borderColor: colors.border.DEFAULT }}
      >
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-4 rounded-2xl p-5 border"
                style={{
                  backgroundColor: colors.surface.container,
                  borderColor: colors.border.light,
                  boxShadow: shadows.DEFAULT,
                }}
              >
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: colors.surface.low,
                    color: colors.primary.DEFAULT,
                  }}
                >
                  <span className="material-symbols-outlined text-2xl">{badge.icon}</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20">
        <div className="mx-auto max-w-[1280px] px-6 space-y-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p 
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: colors.primary.DEFAULT }}
              >
                Curated Objects
              </p>
              <h2 
                className="mt-2 text-3xl font-extrabold sm:text-4xl tracking-tight"
                style={{ color: colors.text.primary }}
              >
                Featured Additive Creations
              </h2>
            </div>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-1 text-sm font-semibold transition"
              style={{
                color: colors.text.secondary,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.secondary}
            >
              View Collection
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {isLoading ? (
            <p
              className="text-center text-sm"
              style={{ color: colors.text.secondary }}
            >
              Loading featured products…
            </p>
          ) : featured.length === 0 ? (
            <p
              className="text-center text-sm"
              style={{ color: colors.text.secondary }}
            >
              Featured products will appear here once added from the admin page.
            </p>
          ) : (
            <ProductGrid products={featured} />
          )}
        </div>
      </section>

      {/* Process Section */}
      <section 
        className="bg-white py-20 border-t border-b"
        style={{
          borderColor: colors.border.DEFAULT,
        }}
        id="process"
      >
        <div className="mx-auto max-w-[1280px] px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span 
              className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: colors.primary.DEFAULT }}
            >
              How We Build
            </span>
            <h2 
              className="text-3xl font-extrabold sm:text-4xl tracking-tight"
              style={{ color: colors.text.primary }}
            >
              Micron-Level Process
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {featureSteps.map((step) => (
              <div 
                key={step.title} 
                className="space-y-6 rounded-2xl p-8 border"
                style={{
                  backgroundColor: colors.surface.container,
                  borderColor: colors.border.DEFAULT,
                  boxShadow: shadows.DEFAULT,
                }}
              >
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                  style={{
                    backgroundColor: colors.primary.DEFAULT,
                    boxShadow: shadows.sm,
                  }}
                >
                  <span className="material-symbols-outlined text-2xl">{step.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: colors.text.primary }}>
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: colors.text.secondary }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section 
        className="relative overflow-hidden py-20 text-white"
        style={{ backgroundColor: colors.primary[900] }}
      >
        <div 
          className="absolute -right-28 top-0 h-64 w-64 rounded-full blur-3xl"
          style={{
            backgroundColor: colors.primary[500],
            opacity: 0.15,
          }}
        />
        <div className="relative mx-auto flex max-w-[1280px] flex-col gap-10 px-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Join the Additive Vanguard
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: colors.secondary[300] }}>
              Get early access to limited titanium drops, custom STL requests, and new material releases.
            </p>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row sm:items-center w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="min-w-[280px] rounded-lg border px-4 py-3 text-sm placeholder-gray-400 focus:outline-none"
              style={{
                backgroundColor: colors.primary[800],
                borderColor: colors.primary[700],
                color: colors.text.inverted,
              }}
            />
            <Button variant="primary" size="md" type="submit" className="w-full sm:w-auto">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="mx-auto max-w-[1280px] px-6 space-y-10">
          <div className="max-w-2xl space-y-3">
            <p
              className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: colors.primary.DEFAULT }}
            >
              Contact
            </p>
            <h2
              className="text-3xl font-extrabold sm:text-4xl tracking-tight"
              style={{ color: colors.text.primary }}
            >
              Get in Touch
            </h2>
            <p
              className="max-w-xl text-sm sm:text-base leading-7"
              style={{ color: colors.text.secondary }}
            >
              Reach out for order updates, shipping questions, partnership
              discussions, or product support. We keep the conversation simple
              and direct.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {contactCards.map((card) => {
              return (
                <article
                  key={card.title}
                  className="rounded-2xl border p-6 sm:p-7"
                  style={{
                    backgroundColor: colors.surface.container,
                    borderColor: colors.border.DEFAULT,
                    boxShadow: shadows.DEFAULT,
                  }}
                >
                  <div
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: colors.surface.low,
                      color: colors.primary.DEFAULT,
                    }}
                  >
                    <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                  </div>

                  <h3 className="text-lg font-bold" style={{ color: colors.text.primary }}>
                    {card.title}
                  </h3>

                  {'href' in card ? (
                    <a
                      href={card.href}
                      className="mt-3 inline-flex break-words text-sm font-semibold transition"
                      style={{
                        color: colors.text.primary,
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.primary.DEFAULT;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.text.primary;
                      }}
                    >
                      {card.value}
                    </a>
                  ) : Array.isArray(card.value) ? (
                    <div
                      className="mt-3 space-y-1 text-sm leading-7"
                      style={{ color: colors.text.secondary }}
                    >
                      {card.value.map((line) => (
                        <p key={line} className="whitespace-pre-line">
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p
                      className="mt-3 text-sm leading-7"
                      style={{ color: colors.text.secondary }}
                    >
                      {card.value}
                    </p>
                  )}
                </article>
              );
            })}
          </div>

          <div
            className="rounded-2xl border px-6 py-6 sm:px-8"
            style={{
              backgroundColor: colors.surface.low,
              borderColor: colors.border.light,
            }}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                  Partnership &amp; Wholesale
                </p>
                <p className="text-sm leading-7" style={{ color: colors.text.secondary }}>
                  For partnership and wholesale enquiries, email us at{' '}
                  <a
                    href="mailto:support@cruise3d.in"
                    className="font-semibold transition"
                    style={{ color: colors.primary.DEFAULT, transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.primary.dark;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.primary.DEFAULT;
                    }}
                  >
                    support@cruise3d.in
                  </a>
                  .
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/shipping-policy"
                  className="text-sm font-medium transition"
                  style={{ color: colors.text.secondary }}
                >
                  Shipping Policy
                </Link>
                <Link
                  to="/cancellation-refund"
                  className="text-sm font-medium transition"
                  style={{ color: colors.text.secondary }}
                >
                  Cancellation &amp; Refunds
                </Link>
                <Link
                  to="/terms-and-conditions"
                  className="text-sm font-medium transition"
                  style={{ color: colors.text.secondary }}
                >
                  Terms and Conditions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
