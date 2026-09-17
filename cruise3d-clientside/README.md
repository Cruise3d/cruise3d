# Cruise3D frontend

The frontend is a React 19, TypeScript, and Vite application for the Cruise3D
storefront and admin UI. React Router handles navigation, Zustand stores the
client authentication session, Axios communicates with the ASP.NET Core API,
and Tailwind CSS provides most styling.

The backend endpoint and payload reference is
[`../cruise3d-api/API_DOCUMENTATION.md`](../cruise3d-api/API_DOCUMENTATION.md).
This README explains how this frontend is organized and how to debug it.

## Application structure

```text
src/
  api/          Shared Axios client and HTTP interceptors
  app/          Router, providers, and Zustand stores
  components/   Shared layout and reusable UI
  features/     Domain-specific pages, components, API modules, types
  lib/          Shared validation, images, notifications, and helpers
  pages/        Top-level pages such as home and contact
  styles/       Theme and global styling
  types/        Shared API/type definitions
```

Feature code is intentionally grouped by domain. Start in the relevant
`src/features/<feature>/api.ts`, then follow the page/component that calls it.

Current feature folders are:

| Feature | Main responsibility |
| --- | --- |
| `auth` | Login, registration, password recovery, email verification |
| `products` | Catalog queries, normalization, product cards, gallery, details |
| `categories` | Category catalog and admin category management |
| `cart` | Cart API and customer cart/drawer pages |
| `orders` | Checkout, Razorpay flow, customer orders, admin orders |
| `profile` | Profile and customer addresses |
| `reviews` | Product review reads and submissions |
| `offers` | Public active offer and admin offer management |
| `admin` | Dashboard, products, orders, categories, offers, contacts, testimonials |
| `newsletter` | Newsletter API wrapper used by the current integration surface |
| `testimonials` | Testimonial API types/wrapper |
| `notifications` | FCM registration and backend notification-token calls in `src/lib/notifications` |

## Routing and access guards

`src/app/router/AppRouter.tsx` defines the routes. Customer pages include
products, categories, cart, checkout, profile, orders, contact, and auth pages.
Admin pages are under `/admin`.

`ProtectedRoute` protects signed-in customer pages. `AdminRoute` protects
admin routes. Some visible routes are currently `PlaceholderPage` instances,
including wishlist, about, policy pages, customer management, and newsletter.

`src/app/providers/AuthProvider.tsx` restores the session and reacts to the
`auth:logout` event. `src/app/store/authStore.ts` persists the session under
the `cruise3d-auth` Zustand key and mirrors access/refresh tokens into browser
local storage.

## Frontend to backend flow

Most requests follow this path:

```text
Page/component
  -> feature API module
  -> src/api/axiosClient.ts
  -> /api or VITE_API_BASE_URL
  -> ASP.NET Core controller
  -> response envelope
  -> Axios unwrapping
  -> component state/query cache
  -> rendered UI
```

`axiosClient.ts`:

- uses `VITE_API_BASE_URL` or `/api`;
- adds the stored access token as a bearer header;
- unwraps successful backend `ApiResponse<T>` objects to their `data`;
- removes the access token and emits `auth:logout` after a 401 response.

Feature API modules should use this client rather than creating separate Axios
instances. Examples are `features/products/api.ts`,
`features/orders/api.ts`, `features/admin/api.ts`, and
`features/profile/api.ts`.

## Authentication flow

`features/auth/api.ts` calls `/auth/login`, `/auth/register`,
`/auth/verify-email`, `/auth/resend-verification`, `/auth/forgot-password`,
`/auth/reset-password`, and `/auth/me`.

After login or registration, the page passes the returned user/token to
`useAuthStore.login` or `setSession`. The access token is stored in local
storage and attached by Axios. The backend determines the user and role from
the JWT. The frontend uses `ProtectedRoute` and `AdminRoute` for navigation
guards, but the backend remains the authority for authorization.

When the API returns 401, the Axios response interceptor clears the access
token and dispatches `auth:logout`. Inspect token presence, request headers,
expiry, and the backend JWT configuration when authentication stops working.

Validation schemas live in `src/lib/validators/authSchemas.ts`. Reuse these
schemas instead of duplicating password or email rules in pages.

## Product flow

The product list page calls `features/products/api.ts`, which requests the
catalog, featured products, bestsellers, or a product by ID. Product responses
are normalized in `features/products/normalizeProduct.ts` before being passed
to `ProductCard`, `ProductGallery`, and `ProductDetailPage`.

The detail page loads images, colors, specifications, stock, and reviews. A
selected color and quantity are passed into the cart API. Admin product forms
use `features/admin/api.ts` and the signed Cloudinary upload response from
`/upload/signature`.

`src/lib/productImage.ts` is the shared fallback-image helper. Use it when a
product needs a fallback rather than repeating the image URL.

## Cart and checkout

`features/cart/api.ts` calls `/cart` to load, add, update, remove, or clear
customer cart items. Cart components include `CartPage`, `CartDrawer`, and
`CartItemRow`. The backend validates product/color availability and quantity.

`features/orders/pages/CheckoutPage.tsx` loads addresses and cart data, lets the
customer choose an address, and starts the Razorpay flow through
`features/orders/api.ts`:

```text
CheckoutPage
  -> createRazorpayOrder()
  -> POST /payments/create-order
  -> Razorpay browser checkout
  -> verifyPayment()
  -> POST /payments/verify
  -> created Order
```

The backend stores a payment intent and cart snapshot before the gateway
checkout. The frontend must pass the returned Razorpay identifiers and address
to verification; it must not create the order directly after a client-side
success callback.

Customer order history uses `/orders/my` and `/orders/my/{orderId}`. Admin
order screens use `/orders`, `/orders/{id}/status`, and the tracking endpoint
through `features/admin/api.ts`.

## Admin flow

Admin login uses the same authentication API, but the returned role controls
`AdminRoute`. The admin area currently includes:

- dashboard KPIs and inventory alerts;
- product creation/editing/soft deletion and Cloudinary uploads;
- categories;
- order status and DTDC tracking;
- offers;
- contact messages;
- testimonial UI.

The corresponding API calls are in `features/admin/api.ts`. The backend still
enforces admin authorization even if a user navigates directly to an admin
URL. The admin newsletter route is currently a placeholder page.

## Firebase notifications

`src/lib/notifications/fcm.ts` initializes Firebase Messaging from the
`VITE_FIREBASE_*` values, checks browser support and permission, registers
`/firebase-messaging-sw.js`, obtains an FCM token, and sends it to
`POST /notification-tokens`. The current token is kept in local storage under
`cruise3d:fcm-token`; replacement and logout call the delete-token endpoint.

Foreground messages are connected with `onForegroundMessage`. Debug
notification failures in this order:

1. Browser notification permission and secure-context requirements.
2. Firebase browser environment values and VAPID key.
3. Service worker registration and browser console.
4. Whether an FCM token was obtained and stored.
5. The `/notification-tokens` request and backend response.
6. API Firebase Admin initialization and notification service logs.

## Shared utilities

| Utility | Purpose |
| --- | --- |
| `src/api/axiosClient.ts` | Single HTTP client, base URL, auth header, response envelope handling, 401 logout behavior |
| `src/lib/productImage.ts` | Canonical product fallback image with optional width |
| `src/lib/validators/authSchemas.ts` | Shared Zod auth/password validation |
| `src/lib/notifications/fcm.ts` | Firebase Messaging, service worker, token registration, foreground messages |
| `src/app/store/authStore.ts` | Persisted user/session state and token storage |
| `src/types/api.ts` | Shared API response typing |
| Feature `types.ts` files | Domain-specific request/response and view models |

Reuse these utilities to keep request handling, validation, fallback images,
and session behavior consistent.

## Environment configuration

Vite exposes only variables prefixed with `VITE_` to browser code. The current
frontend uses:

```text
VITE_API_BASE_URL
VITE_RAZORPAY_KEY_ID
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_VAPID_KEY
```

Local Vite development can use `VITE_API_BASE_URL=http://localhost:5001/api`.
The production build defaults to `/api`, so the browser calls the same host and
Nginx proxies to the API container. Docker Compose supplies build arguments
and development-profile environment values. Browser-visible Vite values are
not a place for server secrets.

## Build, development, and deployment

Run from `cruise3d-clientside`:

```powershell
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

The production Docker image builds the Vite output and serves it with Nginx.
The production request path is:

```text
React build -> Nginx on port 80 -> http://api:8080/api/ -> ASP.NET Core
```

From the repository root, the complete stack is started with:

```powershell
docker compose up --build
docker compose --profile dev up
```

The `frontend-dev` profile exposes Vite on port 5173 and uses the API host
port 5001. The production `frontend` service exposes port 80 and uses the
internal Docker service name through `nginx.conf`.

## Debugging guide

| Symptom | Debug path |
| --- | --- |
| API request fails | Browser DevTools Network tab: URL, method, status, body, request headers; then `src/api/axiosClient.ts`, the feature API module, backend controller/service/repository, and API logs. |
| UI does not update | Check component state/query result, API response shape, `normalizeProduct.ts` or other mapper, loading/error conditions, and the final render branch. |
| Authentication issue | Check `localStorage`, Zustand session, Axios Authorization header, 401 interceptor, route guard, and backend JWT/role response. |
| Payment issue | Browser console, checkout Network requests, Razorpay callback values, `/payments/create-order`, `/payments/verify`, and backend `PaymentService` logs. |
| Product image issue | API image URL, `normalizeProduct.ts`, `productImage.ts`, `ProductGallery`, and Cloudinary upload/signature response. |
| Notification issue | Browser permission, Firebase config, service worker, FCM token storage, `/notification-tokens`, and backend Firebase initialization. |
| Admin page denied | Confirm the logged-in user role, stored token, `AdminRoute`, request Authorization header, and backend `[Authorize(Roles = "admin")]`. |
| Empty list | Inspect response data after Axios unwrapping, feature API normalization, filters/pagination, and the component empty state. |

Use the browser Network tab before changing UI code. It distinguishes a
backend/contract problem from a rendering or state problem.

## Where do I fix this?

| Problem | First file/folder to inspect |
| --- | --- |
| Login/register form | `features/auth/pages/`, `features/auth/api.ts`, `lib/validators/authSchemas.ts` |
| Session disappears | `app/store/authStore.ts`, `app/providers/AuthProvider.tsx`, `api/axiosClient.ts` |
| Route redirects unexpectedly | `app/router/AppRouter.tsx`, `ProtectedRoute.tsx`, `AdminRoute.tsx` |
| Product list/detail | `features/products/pages/`, `features/products/api.ts`, `normalizeProduct.ts` |
| Product image | `features/products/components/ProductGallery.tsx`, `lib/productImage.ts` |
| Cart behavior | `features/cart/`, especially `api.ts`, `CartPage.tsx`, `CartDrawer.tsx` |
| Checkout/payment | `features/orders/pages/CheckoutPage.tsx`, `features/orders/api.ts` |
| Customer orders | `features/orders/pages/`, `features/orders/api.ts` |
| Admin products/orders | `features/admin/api.ts`, matching `features/admin/pages/` |
| Addresses/profile | `features/profile/api.ts`, `features/profile/pages/` |
| Reviews | `features/reviews/api.ts`, product detail review components |
| Offers | `features/offers/api.ts`, `features/admin/pages/AdminOffersPage.tsx` |
| Notifications | `lib/notifications/fcm.ts`, `public/firebase-messaging-sw.js` |
| Styling/layout | `components/`, feature component, `styles/`, and the browser inspector |
| API base URL/CORS | `api/axiosClient.ts`, Vite environment, root `docker-compose.yml`, `nginx.conf` |

## Known limitations and unclear areas

- Several routes are intentionally placeholders in `AppRouter.tsx`, including
  wishlist, about, policy pages, customer management, and newsletter.
- The frontend has API wrappers for newsletter and testimonials, while the
  backend controllers are still placeholder implementations.
- There is no frontend error-tracking service configured; use browser console,
  Network tools, and backend logs for current diagnosis.
- `VITE_*` values are embedded at build time. Changing them requires rebuilding
  the frontend image/bundle.
- The API currently publishes host port 5001 for local development even though
  production Nginx reaches the API internally as `api:8080`.
