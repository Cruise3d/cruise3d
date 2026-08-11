# Cruise3D Frontend — Architecture & Setup Guide

This document describes how to bootstrap, structure, and build the **Cruise3D** frontend from scratch, so it plugs cleanly into the existing **.NET 10 / PostgreSQL** backend described in `project_documentation.md`.

**Stack chosen:** React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router v7 + TanStack Query + Axios + Zustand + React Hook Form + Zod.

> Why this stack: Vite gives near-instant HMR and a simpler config than CRA/Next for a pure SPA consuming a REST API. TanStack Query removes the need for manual loading/error/caching state for every API call (maps 1:1 to the backend's `ApiResponse<T>` wrapper). Zustand handles small global state (auth user, cart count) without Redux boilerplate. If you later need SSR/SEO (e.g. product pages indexed by Google), this can be migrated to Next.js — the `features/` structure below ports over largely unchanged.

---

## 0. Data Flow Overview

The frontend follows a simple feature-driven flow:

1. A page or component calls a feature hook, such as `useLogin()` or `useRegister()`.
2. The hook calls the feature `api.ts` module.
3. `api.ts` uses the shared `axiosClient`.
4. `axiosClient` attaches the bearer token automatically and unwraps the backend `ApiResponse<T>` envelope.
5. The hook updates Zustand or local React state.
6. The page renders the returned data or error state.

Practical mapping:

- `api.ts` talks to the backend.
- `hooks/` holds reusable React logic.
- `pages/` stays thin and mostly composes UI.
- `components/` stays presentational.

This is why the auth feature now uses the real API flow, while most catalog/admin screens can still render mock UI until you choose to convert them.

---

## 1. Kinetic Precision Design System

The Cruise3D interface is engineered around the **Kinetic Precision** design system, designed to evoke high-fidelity additive craftsmanship and surgical technological sophistication.

### 1.1 Color Tokens
- **Background & Base Surface:** `#f7f9fb` (Slate 50 feel)
- **Primary Action:** `#004ac6` (Primary Blue) / `#2563eb` (Container Blue)
- **High-Contrast Secondary:** `#565e74` / `#191c1e` (Deep Slate 900)
- **Accent & Data Highlights:** `#005e6e` (Cyan / Tertiary)
- **Card & Elevated Surfaces:** `#ffffff` (`surface-container-lowest`)
- **Neutral Image Backdrop:** `#f2f4f6` (`surface-container-low` / Slate 50)

### 1.2 Elevation & Depth
- **Ambient Floating Shadow:** `0 4px 20px rgba(0,0,0,0.04)` (avoids muddy traditional drop shadows)
- **Hover Micro-Interaction:** Lift metaphor (`hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(0,74,198,0.08)]`)

### 1.3 Radii & Shape Language
- **Large Container Radii:** 16px (`rounded-2xl` / `rounded-xl`)
- **Interactive Elements & Cards:** 16px radius matching primary containers
- **Inputs, Chips & Badges:** 8px radius (`rounded-md` / `rounded-lg`)

### 1.4 Typography
- **Font Family:** `Inter, ui-sans-serif, system-ui, sans-serif`
- **Headings:** Tight tracking, bold/extrabold weights, clear display hierarchy
- **Blueprint Chips & Labels:** Small uppercase styling (`Label-sm`, `text-[11px] font-semibold uppercase tracking-wider`)

---

## 2. Completed implementations (snapshot: 2026-07-28)

The following files and modules were implemented and verified in the repository during the current work session. This is a living snapshot — add to it as more pieces are finished.

- Layout & Pages
  - `src/components/layout/Header.tsx` — responsive header with brand (Cruise3D), primary navigation, cart and user icons, CTA "Shop" button, and a mobile menu toggle with an expanded menu.
  - `src/components/layout/Footer.tsx` — footer with links and branding text.
  - `src/components/layout/MainLayout.tsx` — application shell that mounts `<Header />`, a `<main>` with `<Outlet />` for route children, and `<Footer />`.
  - `src/pages/HomePage.tsx` — landing/hero page implemented from the provided design: hero section, trust badges, featured product grid, process steps, and newsletter subscription section.
  - `src/app/router/AppRouter.tsx` — router updated to mount `MainLayout` as the layout root and wire the index route to `HomePage`.

- Styling & Tooling
  - `tailwind.config.ts` — project Tailwind configuration with the project's color tokens, radii, spacing, and font family set in `theme.extend` (file added to the repo).
  - `src/index.css` — simplified CSS compatible with Tailwind: includes font settings, `.material-symbols-outlined` tuning, and `.hero-gradient`. Previous invalid `@theme` block was removed to avoid build-time Tailwind errors.
  - `index.html` — fonts and Material Symbols links were added to support Inter and the icon font.

- TypeScript / Project configuration
  - `tsconfig.app.json` — updated to include `"ignoreDeprecations": "6.0"` to silence the TypeScript 7 deprecation warning about `baseUrl` while preserving `paths` aliases (`@/* -> src/*`).

- API integration layer
  - `src/api/axiosClient.ts` — shared Axios client with token attachment, `401` handling, and backend response unwrapping.
  - `src/types/api.ts` — shared API response types.
  - `src/features/*/api.ts` — typed backend endpoint modules for auth, products, categories, cart, orders, admin, profile, newsletter, and testimonials.
  - `src/features/auth/hooks/useLogin.ts` and `src/features/auth/hooks/useRegister.ts` — feature hooks that call the API and update auth state.

- Notes / Known issues
  - A global `C:\.postcssrc.json` was discovered on the machine referencing `@tailwindcss/postcss`. That causes Vite's PostCSS loading to search the root and fail if the plugin isn't installed in the project. Options to resolve locally:
    - Install the missing plugin as a devDependency: `npm install -D @tailwindcss/postcss` (preferred when using the global file), or
    - Remove / rename the global `C:\.postcssrc.json` so the project's normal PostCSS/Tailwind flow is used, or
    - Create a local PostCSS config in the project (`.postcssrc.json` or `postcss.config.cjs`) matching your plugin choices.

- Quick validation commands (run locally)
  - `npm run dev` — start Vite dev server (http://localhost:5173)
  - `npm run build` — runs `tsc -b` then `vite build` (type-check + production build). If you see a PostCSS plugin error, follow the note above to resolve the missing plugin.


## 3. Implemented Base UI Components (`src/components/ui/`)

| Component | File | Key Features |
| :--- | :--- | :--- |
| **`Spinner`** | `src/components/ui/Spinner.tsx` | SVG spinning loader with size scales (`sm`, `md`, `lg`, `xl`) and color variants (`primary`, `secondary`, `white`, `gray`). |
| **`Button`** | `src/components/ui/Button.tsx` | Variants (`primary`, `secondary`, `outline`, `ghost`, `danger`), size scales (`sm`, `md`, `lg`), integrated `Spinner` loading state, Material Symbol icons, ref forwarding. |
| **`Input`** | `src/components/ui/Input.tsx` | Labels, error validation styling, helper text, left/right Material Symbol icons, accessibility attributes (`aria-describedby`), ref forwarding. |
| **`Modal`** | `src/components/ui/Modal.tsx` | React Portals (`createPortal`), backdrop blur, body scroll-lock (`overflow: hidden`), Escape key closing, click-outside backdrop dismiss, entrance animations. |
| **`Pagination`** | `src/components/ui/Pagination.tsx` | Dynamic page range computation, custom `siblingCount`, ellipsis (`...`) rendering, previous/next bounds checking, accessible navigation roles. |
| **`UIDemo`** | `src/pages/UIDemo.tsx` | Interactive showcase page at `/ui-demo` testing all base component states. |

---

## 3. Implemented Product Feature (`src/features/products/`)

| File / Component | Purpose & Implementation Details |
| :--- | :--- |
| **`types.ts`** | Defines `Product`, `ProductFilterState`, and sort types using strict TypeScript `export type` conventions. |
| **`mockData.ts`** | Sample data for 3D printed objects (Titanium Kinetic Sculptures, Voronoi Vases, SLA Architectural Pavilions) with technical specs, materials, and technologies. |
| **`ProductCard.tsx`** | Product card with 16px radius, ambient shadow (`0 4px 20px rgba(0,0,0,0.04)`), hover scaling (`1.02`), neutral image backdrop, tech badges, wishlist toggle, and quick view trigger. |
| **`ProductGrid.tsx`** | Responsive 12-column grid layout (1 col mobile, 2 col tablet, 3-4 col desktop) with empty search results fallback and loading spinner support. |
| **`ProductFilters.tsx`** | Filter controls for Category tabs, Material Grade checkboxes, Manufacturing Tech (DMLS, SLS, SLA), Min/Max price ranges, and In-Stock toggles. |
| **`ProductListPage.tsx`** | Mounted at `/products`. Hero banner, search bar toolbar, sort dropdown, filter drawer/sidebar, Quick View modal (`Modal`), toast notifications, and pagination. |
| **`ColorSwatchPicker.tsx`**| Material finish selector with active highlight rings, tooltips, and finish labels. |
| **`ProductGallery.tsx`** | Product preview gallery with Slate 50 neutral backdrop, hover zoom effect, technology badge overlay, next/previous buttons, and thumbnail row selector. |
| **`ProductDetailPage.tsx`**| Mounted at `/products/:productId`. Breadcrumbs, 2-column hero, quantity counter, Add to Cart action, trust badges, tabbed specs/overview/reviews, and related products grid. |

---

## 4. Implemented Cart Feature (`src/features/cart/`)

| File / Component | Purpose & Implementation Details |
| :--- | :--- |
| **`types.ts`** | Defines `CartItem` and `CartSummaryData` interfaces. |
| **`useCartStore.ts`** | Zustand store with persist middleware managing cart state (items, isOpen), actions (addItem, removeItem, updateQuantity, clearCart), and computed totals. |
| **`CartItemRow.tsx`** | Table row component with product thumbnail, title, material/color finish, unit price, quantity stepper (`- 1 +`), line total, and remove button. |
| **`CartSummaryCard.tsx`** | Sidebar card displaying Subtotal, Shipping (free over $150), Tax (5%), Total, and Checkout CTA button. |
| **`CartDrawer.tsx`** | Slide-over drawer for quick cart inspection from header, with item list, quantity controls, and mini summary. |
| **`CartPage.tsx`** | Mounted at `/cart`. Full shopping cart page with 2-column layout: Cart Items Table + Continue Shopping link + Cart Summary Card. |

---

## 5. Implemented Orders & Checkout Feature (`src/features/orders/`)

| File / Component | Purpose & Implementation Details |
| :--- | :--- |
| **`types.ts`** | Defines `BillingAddress`, `ShippingAddress`, `PaymentMethod`, `OrderStatus`, `Order`, `OrderItem` types, plus status labels/colors/timeline constants. |
| **`CheckoutStepper.tsx`** | 5-step progress indicator (Billing Address → Shipping Address → Order Summary → Payment → Confirmation) with desktop/mobile responsive views. |
| **`CheckoutPage.tsx`** | Mounted at `/checkout`. Multi-step checkout flow with address forms, "Same as billing" checkbox, payment method selector (Credit Card, UPI, COD), order summary sidebar, and validation. |
| **`OrderDetailPage.tsx`** | Mounted at `/orders/:orderId`. Order details page with status timeline (Placed → Processing → Printing → Shipped → Delivered), shipping address, payment method, order items table, and order summary. |

---

## 6. Implemented Auth Feature (`src/features/auth/`)

| File / Component | Purpose & Implementation Details |
| :--- | :--- |
| **`types.ts`** | Defines `User`, `LoginCredentials`, `RegisterData`, `AuthResponse` interfaces. |
| **`authStore.ts`** | Zustand store with persist middleware for authentication state (user, token, isAuthenticated), actions (login, logout, updateUser), and mock login function. |
| **`authSchemas.ts`** | Zod validation schemas for login (`loginSchema`) and registration (`registerSchema`) with field validation and password matching. |
| **`LoginPage.tsx`** | Mounted at `/login`. Login form with email/password, remember me checkbox, social login buttons (Google, GitHub), forgot password link, and validation. |
| **`RegisterPage.tsx`** | Mounted at `/register`. Registration form with first/last name, email, phone, password, confirm password, terms checkbox, and validation. |

---

## 7. Implemented Profile Feature (`src/features/profile/`)

| File / Component | Purpose & Implementation Details |
| :--- | :--- |
| **`types.ts`** | Defines `Profile`, `Address`, `ProfileState` interfaces. |
| **`UserProfilePage.tsx`** | Mounted at `/profile`. Full profile page with sidebar navigation: Account (editable profile), Orders (recent orders list), Addresses (saved addresses), Settings (notifications, security, danger zone). |

---

## 8. Implemented Wishlist Feature (`src/features/wishlist/`)

| File / Component | Purpose & Implementation Details |
| :--- | :--- |
| **`types.ts`** | Defines `WishlistItem` interface with product reference and added date. |
| **`useWishlist.ts`** | Zustand store for wishlist state with add/remove/toggle actions. |
| **`WishlistItemRow.tsx`** | Table row component for wishlist items with product details and remove action. |
| **`WishlistPage.tsx`** | Mounted at `/wishlist`. Wishlist page displaying saved items with move to cart action. |

---

## 9. Implemented Testimonials Feature (`src/features/testimonials/`)

| File / Component | Purpose & Implementation Details |
| :--- | :--- |
| **`types.ts`** | Defines `Testimonial` interface with author, rating, content, date. |
| **`TestimonialCard.tsx`** | Card component for displaying testimonials with star rating. |
| **`TestimonialsPage.tsx`** | Mounted at `/testimonials`. Page showing customer testimonials and reviews. |

---

## 10. Implemented Categories Feature (`src/features/categories/`)

| File / Component | Purpose & Implementation Details |
| :--- | :--- |
| **`types.ts`** | Defines `Category` interface with id, name, slug, description, image. |
| **`CategoryNav.tsx`** | Navigation component for category links. |
| **`useCategories.ts`** | Hook for fetching and managing categories. |

---

## 11. Implemented Reviews Feature (`src/features/reviews/`)

| File / Component | Purpose & Implementation Details |
| :--- | :--- |
| **`types.ts`** | Defines `Review` interface with rating, comment, author, date. |
| **`ReviewList.tsx`** | Component for displaying a list of reviews with ratings. |
| **`ReviewForm.tsx`** | Form component for submitting new reviews with star rating selector. |
| **`useProductReviews.ts`** | Hook for fetching product reviews. |
| **`useSubmitReview.ts`** | Hook for submitting a new review. |

---

## 12. Implemented Admin Feature (`src/features/admin/`)

| File / Component | Purpose & Implementation Details |
| :--- | :--- |
| **`types.ts`** | Defines admin types: `DashboardStats`, `LowStockProduct`. |
| **`StatsCard.tsx`** | Dashboard statistics card with icon, value, label, and trend indicator. |
| **`LowStockTable.tsx`** | Table showing products with low inventory. |
| **`ProductForm.tsx`** | Form for creating/editing products with validation. |
| **`OrderStatusUpdater.tsx`** | Component for updating order status in admin panel. |
| **`CategoryForm.tsx`** | Form for creating/editing categories. |
| **`AdminDashboardPage.tsx`** | Mounted at `/admin`. Dashboard with stats, low stock alerts, recent orders. |
| **`AdminProductsPage.tsx`** | Mounted at `/admin/products`. Product management with CRUD operations. |
| **`AdminOrdersPage.tsx`** | Mounted at `/admin/orders`. Order management with status updates. |
| **`AdminCategoriesPage.tsx`** | Mounted at `/admin/categories`. Category management. |
| **`AdminTestimonialsPage.tsx`** | Mounted at `/admin/testimonials`. Testimonial management. |

---

## 13. Implemented Customers Feature (`src/features/customers/`)

| File / Component | Purpose & Implementation Details |
| :--- | :--- |
| **`types.ts`** | Defines `Customer` interface. |
| **`CustomersTable.tsx`** | Table component for displaying customer list. |
| **`AdminCustomersPage.tsx`** | Mounted at `/admin/customers`. Customer management page. |

---

## 14. Implemented Newsletter Feature (`src/features/newsletter/`)

| File / Component | Purpose & Implementation Details |
| :--- | :--- |
| **`types.ts`** | Defines `Subscriber` interface. |
| **`SubscribersTable.tsx`** | Table for displaying newsletter subscribers. |
| **`AdminNewsletterPage.tsx`** | Mounted at `/admin/newsletter`. Newsletter subscriber management. |

---

## 15. Folder Structure

```text
cruise3d-frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── architecture.md
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx                     # App entry point, mounts <App />
    ├── App.tsx                      # Top-level router wrapper
    ├── index.css                    # Tailwind v4 import + Kinetic Precision keyframe animations
    │
    ├── app/                         # App-wide setup
    │   ├── store/
    │   │   └── authStore.ts        # Zustand auth state with persist middleware
    │   └── router/
    │       ├── AppRouter.tsx       # React Router routes
    │       ├── ProtectedRoute.tsx
    │       └── AdminRoute.tsx
    │
    ├── components/                  # Base UI & Shared components
    │   ├── ui/
    │   │   ├── Button.tsx           # Reusable Button
    │   │   ├── Input.tsx            # Reusable Input
    │   │   ├── Modal.tsx            # Reusable Modal (React Portal)
    │   │   ├── Spinner.tsx          # Reusable SVG Spinner
    │   │   ├── Toast.tsx            # Toast notification
    │   │   └── Pagination.tsx        # Reusable Pagination bar
    │   └── layout/
    │       ├── Header.tsx            # Header with cart badge
    │       ├── Footer.tsx
    │       ├── MainLayout.tsx        # Layout with CartDrawer
    │       └── AdminSidebar.tsx      # Admin dashboard sidebar
    │
    ├── features/                    # Vertical slice feature modules
    │   ├── auth/
    │   │   ├── types.ts             # User, LoginCredentials, RegisterData
    │   │   ├── authStore.ts         # Zustand auth state
    │   │   ├── authSchemas.ts       # Zod validation schemas
    │   │   └── pages/
    │   │       ├── LoginPage.tsx    # /login
    │   │       └── RegisterPage.tsx  # /register
    │   │
    │   ├── cart/
    │   │   ├── types.ts              # CartItem, CartSummaryData
    │   │   ├── useCartStore.ts      # Zustand cart state
    │   │   ├── components/
    │   │   │   ├── CartItemRow.tsx
    │   │   │   ├── CartSummaryCard.tsx
    │   │   │   └── CartDrawer.tsx
    │   │   └── pages/
    │   │       └── CartPage.tsx     # /cart
    │   │
    │   ├── orders/
    │   │   ├── types.ts              # Order, BillingAddress, PaymentMethod, OrderStatus
    │   │   ├── components/
    │   │   │   ├── CheckoutStepper.tsx
    │   │   │   ├── CheckoutSummary.tsx
    │   │   │   ├── OrderStatusBadge.tsx
    │   │   │   └── OrderTimeline.tsx
    │   │   └── pages/
    │   │       ├── CheckoutPage.tsx    # /checkout
    │   │       ├── OrderDetailPage.tsx # /orders/:orderId
    │   │       └── MyOrdersPage.tsx    # /orders
    │   │
    │   ├── products/
    │   │   ├── types.ts              # Product, ProductFilterState
    │   │   ├── mockData.ts           # Sample products dataset
    │   │   ├── components/
    │   │   │   ├── ProductCard.tsx
    │   │   │   ├── ProductGrid.tsx
    │   │   │   ├── ProductFilters.tsx
    │   │   │   ├── ColorSwatchPicker.tsx
    │   │   │   └── ProductGallery.tsx
    │   │   └── pages/
    │   │       ├── ProductListPage.tsx  # /products
    │   │       └── ProductDetailPage.tsx # /products/:productId
    │   │
    │   ├── profile/
    │   │   ├── types.ts              # Profile, Address
    │   │   └── pages/
    │   │       └── UserProfilePage.tsx  # /profile
    │   │
    │   ├── wishlist/
    │   ├── testimonials/
    │   ├── categories/
    │   ├── admin/
    │   ├── customers/
    │   └── newsletter/
    │
    ├── lib/                          # Utilities & helpers
    │   ├── formatCurrency.ts
    │   ├── formatDate.ts
    │   └── validators/
    │       ├── authSchemas.ts
    │       └── productSchemas.ts
    │
    ├── pages/
    │   ├── HomePage.tsx             # Landing page with hero & featured grid
    │   └── UIDemo.tsx               # UI components showcase page (/ui-demo)
    │
    └── types/
        └── api.ts                   # Shared API types
```

---

## 16. Routes Overview

| Route | Page Component | Description |
| :--- | :--- | :--- |
| `/` | `HomePage` | Landing page with hero & featured products |
| `/products` | `ProductListPage` | Product catalog with filters |
| `/products/:productId` | `ProductDetailPage` | Single product details |
| `/cart` | `CartPage` | Shopping cart |
| `/checkout` | `CheckoutPage` | Multi-step checkout |
| `/orders` | `MyOrdersPage` | Order history |
| `/orders/:orderId` | `OrderDetailPage` | Order details & tracking |
| `/login` | `LoginPage` | User login |
| `/register` | `RegisterPage` | User registration |
| `/profile` | `UserProfilePage` | User account settings |
| `/testimonials` | `TestimonialsPage` | Customer testimonials |
| `/wishlist` | `WishlistPage` | Saved items wishlist |
| `/ui-demo` | `UIDemo` | UI components showcase |
| `/admin` | `AdminDashboardPage` | Admin dashboard |
| `/admin/products` | `AdminProductsPage` | Product management |
| `/admin/orders` | `AdminOrdersPage` | Order management |
| `/admin/categories` | `AdminCategoriesPage` | Category management |
| `/admin/customers` | `AdminCustomersPage` | Customer management |
| `/admin/testimonials` | `AdminTestimonialsPage` | Testimonial management |
| `/admin/newsletter` | `AdminNewsletterPage` | Newsletter subscribers |

---

## 17. Startup & Build Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Start Vite dev server (default `http://localhost:5173`) |
| `npm run build` | Type-check + produce optimized production build in `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint across the codebase |

---

## 18. TypeScript & Module Conventions

- **`verbatimModuleSyntax` & `erasableSyntaxOnly` Compatibility**: All type-only imports use `import type { ... }` or `import { type ... }` syntax to guarantee clean compilation under Vite and TypeScript 5.5+.
- **Path Aliases**: `@/*` maps to `src/*`.

---

## 19. Deployment Notes

- `npm run build` outputs static files to `dist/` — deployable to Nginx, S3+CloudFront, Vercel, or Netlify.
- All routes are wrapped inside `BrowserRouter` with fallback handling in `AppRouter.tsx`.
