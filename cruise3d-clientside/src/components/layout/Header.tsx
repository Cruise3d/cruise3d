import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCartStore } from '../../features/cart/useCartStore';
import { useAuthStore } from '../../app/store/authStore';
import { theme } from '../../styles/theme';

const navItems = [
  { label: 'Collections', to: '/products' },
  { label: 'Materials', to: '/products' },
  { label: 'Custom', to: '/products' },
  { label: 'Process', to: '#process' },
];

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { getTotalItems, toggleCart, fetchCart } = useCartStore();
  const totalItems = getTotalItems();

  const handleCartClick = () => {
    // Always refresh the cart from the server before opening the drawer so
    // the user sees up-to-date items (and triggers a GET /cart network call).
    void fetchCart().finally(() => toggleCart());
  };
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { colors, shadows } = theme;

  const userInitial =
    (user?.firstName?.[0] || user?.email?.[0] || '?').toUpperCase();
  const userDestination = isAuthenticated ? '/profile' : '/login';
  const userAriaLabel = isAuthenticated ? 'Open user profile' : 'Sign in';

  return (
    <header 
      className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl shadow-sm transition-all duration-300"
      style={{
        backgroundColor: colors.surface.overlay,
        borderColor: colors.border.DEFAULT,
        color: colors.text.primary,
        boxShadow: shadows.sm,
      }}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 py-3 lg:py-4">
        {/* Brand */}
        <Link 
          to="/" 
          className="text-xl font-bold tracking-tight transition-all duration-200 hover:opacity-80"
          style={{ color: colors.text.primary }}
        >
          Cruise<span style={{ color: colors.primary.DEFAULT }}>3D</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.to}
              className="relative text-sm font-medium transition-all duration-200 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:transition-all after:duration-300 hover:after:w-full"
              style={{ 
                color: colors.text.secondary,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.text.primary;
                e.currentTarget.querySelector('span')?.style.setProperty('--tw-after-width', '100%');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.text.secondary;
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Cart Button */}
          <button
            type="button"
            onClick={handleCartClick}
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105"
            style={{
              borderColor: colors.border.light,
              color: colors.text.secondary,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.text.primary;
              e.currentTarget.style.color = colors.text.primary;
              e.currentTarget.style.backgroundColor = colors.surface.low;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border.light;
              e.currentTarget.style.color = colors.text.secondary;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Shopping cart"
          >
            <span className="material-symbols-outlined text-[1.3rem]">shopping_cart</span>
            {totalItems > 0 && (
              <span 
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm transition-all duration-200 group-hover:scale-110"
                style={{
                  backgroundColor: colors.primary.DEFAULT,
                  color: colors.text.inverted,
                  boxShadow: shadows.sm,
                }}
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* User Button */}
          <Link
            to={userDestination}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105"
            style={{
              borderColor: colors.border.light,
              color: colors.text.secondary,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.text.primary;
              e.currentTarget.style.color = colors.text.primary;
              e.currentTarget.style.backgroundColor = colors.surface.low;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border.light;
              e.currentTarget.style.color = colors.text.secondary;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label={userAriaLabel}
          >
            {isAuthenticated ? (
              <span
                className="text-sm font-bold"
                style={{ color: colors.primary.DEFAULT }}
              >
                {userInitial}
              </span>
            ) : (
              <span className="material-symbols-outlined text-[1.3rem]">person</span>
            )}
          </Link>

          {/* Shop Button */}
          <Link
            to="/products"
            className="ml-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{
              backgroundColor: colors.primary.DEFAULT,
              color: colors.text.inverted,
              boxShadow: shadows.primary,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary.dark;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary.DEFAULT;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Shop
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 md:hidden"
          style={{
            borderColor: colors.border.light,
            color: colors.text.secondary,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.text.primary;
            e.currentTarget.style.color = colors.text.primary;
            e.currentTarget.style.backgroundColor = colors.surface.low;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border.light;
            e.currentTarget.style.color = colors.text.secondary;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span className="material-symbols-outlined text-[1.3rem]">
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          className="border-t px-6 py-6 md:hidden animate-fade-in"
          style={{
            borderColor: colors.border.light,
            backgroundColor: colors.surface.DEFAULT,
          }}
        >
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.to}
                className="text-base font-medium transition-colors duration-200 hover:pl-2"
                style={{
                  color: colors.text.secondary,
                  transition: 'all 0.2s',
                }}
                onClick={() => setMenuOpen(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.text.primary;
                  e.currentTarget.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.text.secondary;
                  e.currentTarget.style.paddingLeft = '0';
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-6"
            style={{ borderColor: colors.border.light }}
          >
            <Link
              to="/products"
              className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: colors.primary.DEFAULT,
                color: colors.text.inverted,
                transition: 'all 0.2s',
              }}
              onClick={() => setMenuOpen(false)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary.dark}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary.DEFAULT}
            >
              Shop
            </Link>
            <button
              type="button"
              onClick={() => {
                handleCartClick();
                setMenuOpen(false);
              }}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105"
              style={{
                borderColor: colors.border.light,
                color: colors.text.secondary,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.text.primary;
                e.currentTarget.style.color = colors.text.primary;
                e.currentTarget.style.backgroundColor = colors.surface.low;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border.light;
                e.currentTarget.style.color = colors.text.secondary;
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Shopping cart"
            >
              <span className="material-symbols-outlined text-[1.3rem]">shopping_cart</span>
              {totalItems > 0 && (
                <span 
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm"
                  style={{
                    backgroundColor: colors.primary.DEFAULT,
                    color: colors.text.inverted,
                    boxShadow: shadows.sm,
                  }}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
            <Link
              to={userDestination}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105"
              style={{
                borderColor: colors.border.light,
                color: colors.text.secondary,
                transition: 'all 0.2s',
              }}
              onClick={() => setMenuOpen(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.text.primary;
                e.currentTarget.style.color = colors.text.primary;
                e.currentTarget.style.backgroundColor = colors.surface.low;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border.light;
                e.currentTarget.style.color = colors.text.secondary;
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label={userAriaLabel}
            >
              {isAuthenticated ? (
                <span
                  className="text-sm font-bold"
                  style={{ color: colors.primary.DEFAULT }}
                >
                  {userInitial}
                </span>
              ) : (
                <span className="material-symbols-outlined text-[1.3rem]">person</span>
              )}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}