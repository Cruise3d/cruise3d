import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getFeaturedProducts } from '../features/products/api';
import { ProductGrid } from '../features/products/components/ProductGrid';
import { getCategories } from '../features/categories/api';
import type { Category } from '../features/categories/types';
import { Button } from '../components/ui/Button';
import { theme } from '../styles/theme';
import type { Product } from '../features/products/types';
import printerWorkbench from '../assets/carousel/Gemini_Generated_Image_g1jgi5g1jgi5g1jg.png';
import kineticForm from '../assets/carousel/Gemini_Generated_Image_g1jgi5g1jgi5g1jg (2).png';
import referenceHero from '../assets/carousel/ChatGPT Image Sep 4, 2026, 04_02_15 PM.png';

const heroSlides = [
  {
    image: printerWorkbench,
    alt: 'Precision 3D printer producing a layered object',
  },
  {
    image: kineticForm,
    alt: 'Sculptural computationally designed printed form',
  },
  {
    image: referenceHero,
    alt: 'Wide 3D printing studio hero scene',
  },
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  useEffect(() => {
    if (isHeroPaused) return;

    const timer = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [isHeroPaused]);

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

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((items) => {
        if (!cancelled) setCategories(items);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCategories(false);
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
        className="relative overflow-hidden border-b bg-white px-4 py-6 sm:py-8 md:px-6 md:py-10 lg:py-12"
        style={{ borderColor: colors.border.DEFAULT }}
      >
        <div
          className="relative mx-auto aspect-[4/3] max-w-[1440px] min-w-0 overflow-hidden rounded-2xl border shadow-lg sm:aspect-[16/9] lg:aspect-[16/7]"
          onMouseEnter={() => setIsHeroPaused(true)}
          onMouseLeave={() => setIsHeroPaused(false)}
          onFocus={() => setIsHeroPaused(true)}
          onBlur={() => setIsHeroPaused(false)}
          style={{ borderColor: colors.border.DEFAULT }}
        >
          {heroSlides.map((slide, index) => (
            <img
              key={slide.image}
              src={slide.image}
              alt={slide.alt}
              aria-hidden={activeHeroSlide !== index}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                activeHeroSlide === index ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          <button
            type="button"
            aria-label="Previous hero slide"
            onClick={() => setActiveHeroSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-slate-950/35 text-white backdrop-blur-sm transition hover:bg-slate-950/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            type="button"
            aria-label="Next hero slide"
            onClick={() => setActiveHeroSlide((current) => (current + 1) % heroSlides.length)}
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-slate-950/35 text-white backdrop-blur-sm transition hover:bg-slate-950/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2" role="tablist" aria-label="Hero slides">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.image}
                type="button"
                role="tab"
                aria-label={`Show hero slide ${index + 1}`}
                aria-selected={activeHeroSlide === index}
                onClick={() => setActiveHeroSlide(index)}
                className={`h-2.5 rounded-full border border-white/70 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  activeHeroSlide === index ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Category Showcase Section */}
      <section
        className="border-b pb-20 pt-8 sm:pt-10 md:pt-12 lg:pt-14"
        style={{
          backgroundColor: colors.background.page,
          borderColor: colors.border.DEFAULT,
        }}
      >
        <div className="mx-auto max-w-[1280px] space-y-10 px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: colors.primary.DEFAULT }}
              >
                Find your next favorite
              </p>
              <h2
                className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl"
                style={{ color: colors.text.primary }}
              >
                Explore categories
              </h2>
            </div>
            <Link
              to="/categories"
              className="inline-flex items-center gap-1 text-sm font-semibold transition"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = colors.text.primary;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = colors.text.secondary;
              }}
            >
              View all categories
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {isLoadingCategories ? (
            <p className="text-center text-sm" style={{ color: colors.text.secondary }}>
              Loading categories…
            </p>
          ) : categories.length === 0 ? (
            <p className="text-center text-sm" style={{ color: colors.text.secondary }}>
              Categories will appear here once added from the admin page.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?categoryId=${category.id}`}
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl border transition-transform duration-300 hover:-translate-y-1"
                  style={{
                    backgroundColor: colors.surface.container,
                    borderColor: colors.border.DEFAULT,
                    boxShadow: shadows.DEFAULT,
                  }}
                >
                  {category.iconUrl ? (
                    <img
                      src={category.iconUrl}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center"
                      style={{ color: colors.text.tertiary }}
                    >
                      <span className="material-symbols-outlined text-5xl">category</span>
                    </div>
                  )}
                  <div
                    className="absolute inset-x-0 bottom-0 p-4 pt-12"
                    style={{
                      background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.82))',
                    }}
                  >
                    <h3 className="text-lg font-bold text-white sm:text-xl">
                      {category.name}
                    </h3>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                      Shop now
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-10">
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
        className="bg-white py-10 border-t border-b"
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
        className="relative overflow-hidden py-10 text-white"
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
      <section className="py-10">
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
