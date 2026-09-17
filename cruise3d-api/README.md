# Cruise3D backend

This directory contains the Cruise3D ASP.NET Core 10 Web API. The API serves
the storefront and admin UI, owns business rules for the catalog, carts,
orders, payments, accounts, addresses, reviews, offers, contact messages, and
notifications, and persists application data in PostgreSQL.

The detailed endpoint reference is in
[API_DOCUMENTATION.md](API_DOCUMENTATION.md). This README is about finding and
changing the implementation.

## Request flow and architecture

For a normal database-backed request, follow this path:

```text
HTTP request
  -> Controller
  -> Service
  -> Repository
  -> AppDbContext / EF Core
  -> PostgreSQL
```

The API also calls external providers from services when a workflow requires
them:

```text
Service -> Brevo
Service -> Firebase Cloud Messaging
Service -> Razorpay
Controller/service -> Cloudinary signing
```

### Controllers

`Controllers/` contains HTTP concerns: routes, model binding, status codes,
authorization attributes, and `ApiResponse<T>` envelopes. Controllers obtain
the current user from `JwtHelper.GetUserId(User)` where needed and call a
service interface.

Do not put database queries, payment rules, stock calculations, or email
delivery logic in a controller. Examples include `ProductsController`,
`OrdersController`, `PaymentsController`, and `AuthController`.

### Services

`Services/` contains business workflows and orchestration. Services validate
business rules, coordinate repositories, create snapshots, call integrations,
and decide when state changes are persisted. Interfaces are in
`Services/Interfaces/`.

Examples:

- `ProductService` maps catalog entities to customer/admin DTOs and handles
  product creation, updates, SKU checks, and soft deletion.
- `OrderService` places orders, checks ownership, updates order status and
  tracking, and creates an order from a verified payment intent.
- `PaymentService` owns the Razorpay order, intent, signature, amount, and
  idempotency flow.
- `AuthService` owns registration, login, profile updates, and token workflows.

Do not bypass a service from a controller when the operation has business
rules. Keep provider calls and cross-repository workflows here.

### Repositories

`Repositories/` and `Repositories/Interfaces/` isolate EF Core queries and
CRUD operations. Examples include `ProductRepository`,
`OrderRepository`, `AddressRepository`, `PaymentRepository`,
`NotificationTokenRepository`, and `UserRepository`.

Repositories should query and persist entities. They should not issue JWTs,
send email, call Razorpay, or decide HTTP status codes.

### EF Core and PostgreSQL

`Data/AppDbContext.cs` exposes the `DbSet` properties and automatically applies
all classes in `Data/Configurations/`. It also converts table, column, key,
foreign-key, and index names to snake_case for PostgreSQL.

`Models/Entities/` contains database entities. `Models/DTOs/` contains HTTP
request and response shapes. `Models/Settings/` contains options-bound
configuration classes. `Migrations/` contains the schema history.

## Project and folder guide

| Location | Purpose | Examples |
| --- | --- | --- |
| `Controllers/` | Routes, binding, authorization, response envelopes | `ProductsController`, `OrdersController`, `PaymentsController` |
| `Services/` | Business rules and workflows | `AuthService`, `OrderService`, `PaymentService` |
| `Services/Interfaces/` | Service contracts used by controllers and DI | `IProductService`, `IPaymentService` |
| `Repositories/` | EF Core data access implementations | `ProductRepository`, `OrderRepository` |
| `Repositories/Interfaces/` | Repository contracts | `IProductRepository`, `IPaymentRepository` |
| `Models/Entities/` | PostgreSQL-backed domain entities | `Product`, `Cart`, `Order`, `Payment`, `User` |
| `Models/DTOs/` | API request/response contracts | `ProductCreateDto`, `OrderResponseDto`, `VerifyPaymentRequestDto` |
| `Models/Settings/` | Options pattern settings | `RazorpayOptions`, `BrevoOptions` |
| `Data/` | `AppDbContext` and EF registration boundary | `AppDbContext.cs` |
| `Data/Configurations/` | Fluent mappings, indexes, relationships, constraints | `ProductConfiguration`, `OrderConfiguration` |
| `Middleware/` | Cross-cutting HTTP middleware | `ExceptionMiddleware.cs` |
| `Helpers/` | Small cross-cutting helpers | `JwtHelper.cs` |
| `Migrations/` | EF Core schema changes | `InitialCreate`, payment, offer, notification migrations |
| `Program.cs` | DI registration, configuration, startup migration, middleware order | Service/repository registrations |
| `appsettings*.json` | Non-secret defaults and policy configuration | rate limiting, forwarded proxy, email paths |

## Tracing existing features

When debugging an endpoint, start at its route attribute, follow the injected
service interface to its implementation, then follow repository calls into
`AppDbContext` and the entity/configuration.

### Products

```text
ProductsController.GetAll/GetById/Create/Update/Delete
  -> IProductService
  -> ProductService.GetCustomerProductsAsync,
     GetCustomerByIdAsync, CreateAsync, UpdateAsync, DeleteAsync
  -> IProductRepository and ProductImage/ProductColor/ProductSpec repositories
  -> AppDbContext
  -> Product, ProductColor, ProductImage, ProductSpec, Category
  -> PostgreSQL
```

Customer reads exclude inactive products. Admin reads include the information
needed to manage products. `DeleteAsync` is a soft delete that sets the
product inactive instead of removing historical references.

### Orders

```text
OrdersController.PlaceOrder/GetMyOrders/GetMyOrder/UpdateStatus/UpdateTracking
  -> IOrderService
  -> OrderService
  -> IOrderRepository, ICartRepository, IAddressRepository, product data
  -> Order and OrderItem entities
  -> PostgreSQL
```

Customer order reads receive the authenticated customer ID. Admin status
changes can trigger notifications. `OrderItem` stores purchase-time product
and color values so later catalog edits do not rewrite order history.

### Payments

```text
PaymentsController.CreateOrder/Verify
  -> IPaymentService
  -> PaymentService
  -> cart/products/address/payment/order repositories
  -> Payment intent and Order entities
  -> PostgreSQL
```

See [Payment flow](#payment-flow) for the complete gateway sequence.

### Authentication

```text
AuthController.Register/Login/VerifyEmail/ResetPassword
  -> IAuthService
  -> AuthService
  -> UserRepository and token repositories
  -> BrevoEmailService where email delivery is required
  -> JwtHelper for JWT creation
```

## Authentication and authorization

Registration is handled by `AuthService.RegisterAsync`. The user is created
with a BCrypt hash, an email-verification token is issued through
`EmailVerificationTokenService`, and `BrevoEmailService` sends the link.
`VerifyEmailAsync` validates and consumes the token and marks the user
verified.

`AuthService.LoginAsync` loads the user, verifies the BCrypt password, checks
the account state, and creates a JWT. `Program.cs` configures JWT bearer
validation. `JwtHelper.GetUserId(User)` reads the authenticated user ID claim
inside controllers and services.

`[Authorize]` requires a valid token. `[Authorize(Roles = "customer")]` and
`[Authorize(Roles = "admin")]` enforce the role claim. The customer-only
controllers include `CartController` and `AddressController`; admin-only
controllers include `AdminController`, `UploadController`, and management
actions in products, categories, orders, offers, contact messages, and
notifications.

The frontend stores the access token in local storage and the shared Axios
client adds the bearer header. A 401 response removes the stored access token
and dispatches `auth:logout`; `AuthProvider` and route guards then update the
UI.

Where to investigate:

- Login failure: `AuthController`, `AuthService.LoginAsync`,
  `UserRepository`, JWT settings, and the request body.
- Invalid JWT: `Program.cs` JWT bearer configuration, issuer/audience/key
  configuration, token expiry, and the frontend `Authorization` header.
- Admin 401: token missing/invalid, then authentication configuration.
- Admin 403: token is valid but the role is not `admin`; check the controller
  attribute and the role assigned by the user/admin seeder.
- Email verification failure: `AuthService`, `EmailVerificationTokenService`,
  `EmailVerificationTokenRepository`, `BrevoEmailService`, and the token
  lifetime settings.

## Database and migrations

The application uses PostgreSQL through Npgsql and EF Core. The `AppDbContext`
contains `DbSet` properties for users, addresses, categories, products,
colors, images, specifications, carts, orders, order items, payments, reviews,
testimonials, newsletter subscribers, contact messages, notification tokens,
email/password reset tokens, and offers.

Relationships and constraints are in `Data/Configurations/`. Migrations are
named by timestamp and purpose. The current migration directory includes
payment intents, Razorpay columns, notification tokens, muted tokens, DTDC
tracking, offers, email verification, default-address enforcement, shipping
phones, password reset tokens, contact messages, and payment checkout keys.

At startup, `Program.cs` opens the database, ensures the migration history table
exists for older databases, calls `Database.Migrate()`, and logs/rethrows
initialization failures.

Safely changing a database field:

```text
Entity + configuration
  -> dotnet ef migrations add <Name>
  -> dotnet ef database update
  -> verify the API, DTO mapping, and existing data
```

Run commands from `cruise3d-api/cruise3d`:

```powershell
dotnet ef migrations add <MigrationName> --project cruise3d.API.csproj --startup-project cruise3d.API.csproj
dotnet ef database update --project cruise3d.API.csproj --startup-project cruise3d.API.csproj
dotnet build cruise3d.API.csproj
dotnet run --project cruise3d.API.csproj
```

The repository also provides `scripts/seed-admin.ps1`. It applies migrations
and runs `tools/AdminSeeder/AdminSeeder.csproj`. Use a supplied local
development password or connection string rather than putting credentials in
source control.

## Important business logic

| Feature | Main implementation | Rules and debugging focus |
| --- | --- | --- |
| Products | `ProductsController`, `ProductService`, `ProductRepository`, product DTOs/entities | Active products are customer-visible; deletes are soft; SKU uniqueness, colors, images, specs, stock, and Cloudinary assets must stay consistent. |
| Customization | `ProductColor`, `ProductImage`, `ProductSpec`, `ProductService`, `CartService` | Color selection can override stock; cart/order snapshots retain selected color name and hex. |
| Cart | `CartController`, `CartService`, `CartRepository`, `AddToCartDto` | Customer ownership comes from JWT; quantities and product/color stock are checked; cart rows are updated or removed by cart ID. |
| Checkout | `PaymentService`, `OrderService`, `AddressController`, `AddressRepository` | Cart contents, product availability, shipping charge, address ownership, and payment snapshot must agree. |
| Addresses | `AddressController`, `AddressRepository`, address DTOs | Customer-only access; default address changes are constrained by the database migration/configuration. |
| Orders | `OrdersController`, `OrderService`, `OrderRepository`, `Order`/`OrderItem` | Status values include `pending`, `confirmed`, `printing`, `shipped`, `delivered`, and `cancelled`; admin tracking stores `DtdcTrackingId`. |
| Shipping/tracking | `OrdersController.UpdateTracking`, `OrderService.UpdateTrackingAsync` | Admins set or clear the DTDC tracking ID; customer detail responses expose tracking data. |
| Reviews | `ReviewsController`, `ReviewService`, `ReviewRepository` | Public product reads; customers must have a qualifying completed/delivered purchase and cannot review the same purchase repeatedly. |
| Offers | `OffersController`, `OfferService`, `OfferRepository` | Public reads only expose the active offer; creation, update, and deletion are admin-only. |
| Contact messages | `ContactController`, `ContactMessageService`, `ContactMessageRepository` | Public submission; admin-only message listing. |
| Email verification | `AuthService`, `EmailVerificationTokenService`, `BrevoEmailService` | Raw tokens are delivered by email, stored/validated through the token service, expire, and are consumed. |
| Notifications | `NotificationTokensController`, `NotificationService`, `NotificationTokenRepository`, `NotificationTokenSweeper` | FCM tokens are registered for authenticated users; order status and new-order workflows send pushes; the health/test controller is admin/dev scoped. |
| Newsletter/testimonials | `NewsletterController`, `TestimonialsController` | These controllers are still routed but are placeholder implementations. Do not treat them as completed persistence workflows. |

## Payment flow

The frontend calls `POST /api/payments/create-order`. The customer cart is
loaded, product/color stock is checked, subtotal and the current flat shipping
charge are calculated, and a checkout key is derived from the cart identity.
`PaymentService` uses a PostgreSQL transaction and advisory lock to avoid
creating competing intents for the same cart snapshot. It then creates the
Razorpay order and stores a pending `Payment` intent with a serialized cart
snapshot.

The frontend opens Razorpay with the returned public key/order/amount and then
calls `POST /api/payments/verify` with the Razorpay order ID, payment ID,
signature, and address ID.

`PaymentService.VerifyPaymentAsync`:

1. Verifies the Razorpay HMAC signature.
2. Loads the payment intent and verifies it belongs to the authenticated user.
3. Returns the existing order when the intent is already paid.
4. Fetches the payment from Razorpay and verifies the paid amount matches the
   stored intent.
5. Resolves the supplied address or the customer's default address and checks
   ownership.
6. Creates the order from the stored cart snapshot.
7. Marks the payment intent paid and links it to the order in one database
   transaction.

The stored intent, checkout key, advisory lock, paid-state check, user check,
signature check, amount check, and database transaction protect against
duplicate order creation and client-side amount tampering.

## External integrations

| Integration | Purpose | Code/configuration | Common failure points |
| --- | --- | --- | --- |
| Razorpay | Creates and verifies online payments | `PaymentService`, `PaymentsController`, `RazorpayOptions`, `Razorpay` configuration | Invalid credentials, wrong amount/currency, invalid signature, missing payment intent, gateway response errors. |
| Brevo | Verification, password reset, and admin order emails | `BrevoEmailService`, `IBrevoEmailService`, `BrevoOptions`, `Brevo` configuration | Missing/revoked key, sender not verified, disabled development email, provider HTTP errors. |
| Firebase FCM | Browser push notifications | `NotificationService`, `NotificationTokenRepository`, `NotificationTokenSweeper`, Firebase initialization in `Program.cs` | Missing service-account file, browser permission, expired token, service worker, Firebase initialization. |
| Cloudinary | Product/category media uploads | `UploadController`, `Cloudinary` settings, frontend admin upload code | Invalid signing configuration, upload URL/signature mismatch, missing asset URL. |

Check application logs first. `ExceptionMiddleware` logs unhandled exceptions
with `ILogger` and returns a safe `ApiResponse<string>` for unexpected 500
errors. Provider-specific response details are usually visible in the service
logs or exception message without exposing credentials.

## Middleware and cross-cutting concerns

The effective request order in `Program.cs` is:

```text
Forwarded headers
  -> CORS
  -> ExceptionMiddleware
  -> Rate limiter
  -> Authentication
  -> Authorization
  -> Controllers
```

`UseForwardedHeaders()` must run before rate limiting so
`RemoteIpAddress` contains the client address forwarded by the trusted Nginx
container. Only the configured `ForwardedHeaders:KnownProxies` address
`172.30.0.2` is trusted, with one forwarded hop.

`UseCors("AllowFrontend")` handles browser cross-origin behavior. The exception
middleware logs and normalizes unhandled failures. ASP.NET Core built-in rate
limiting is configured in `Program.cs` and uses policies from `RateLimiting` in
`appsettings.json`, partitioned by client IP:

- Login: 5 requests per 60 seconds
- Registration: 5 requests per 600 seconds
- Resend verification: 3 requests per 600 seconds
- Email verification: 10 requests per 60 seconds

Rejected requests return HTTP 429, a safe JSON response, and `Retry-After`
when the limiter supplies it.

## Error handling and debugging

| Symptom | First checks |
| --- | --- |
| API returns 500 | `ExceptionMiddleware` log, then the controller/service/repository stack and database connection/schema. |
| API returns 401 | JWT bearer configuration, token expiry/claims, and the frontend Authorization header. |
| API returns 403 | Controller `[Authorize]` role, actual JWT role claim, and ownership/role checks in the service. |
| Payment succeeds but no order exists | `PaymentService.VerifyPaymentAsync`, payment intent state, signature/amount checks, transaction rollback, and `OrderService.CreateOrderFromPaymentIntentAsync`. |
| Email is not received | `BrevoEmailService`, Brevo settings, sender verification, `EmailVerification`/`PasswordReset` options, and logs. |
| Database column is missing | Entity/configuration, migration list, `__EFMigrationsHistory`, and `Database.Migrate()` startup logs. |
| Products or reviews are empty | Browser/API response, controller, service mapping, repository query filters, active flags, and PostgreSQL data. |
| Rate limiting uses the wrong IP | Nginx `X-Forwarded-For`, Docker backend network, `ForwardedHeaders:KnownProxies`, and middleware order. |

To add an endpoint, add the route/action to the appropriate controller, define
or reuse DTOs, add a service interface and implementation for business logic,
add repository methods for new data access, register new types in `Program.cs`,
and update `API_DOCUMENTATION.md`.

## API documentation

Use [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for endpoint payloads and
responses. To find an implementation, search the route prefix and method in
`Controllers/`, then follow the injected interface:

```text
POST /api/payments/create-order
  -> Controllers/PaymentController.cs (`PaymentsController`)
  -> Services/PaymentService.cs
  -> Repositories/CartRepository, ProductRepository, PaymentRepository
  -> Data/AppDbContext.cs
```

## Configuration

`appsettings.json` contains non-secret defaults, logging, forwarded-proxy
configuration, rate-limit windows, public URL defaults, and token lifetimes.
`appsettings.Development.json` is the local development configuration file.
Docker Compose overrides hierarchical settings through environment variables.

The root `.env` file is gitignored and is consumed by `docker-compose.yml`.
Names currently used include `POSTGRES_*`, `JWT_*`, `CLOUDINARY_*`,
`RAZORPAY_*`, `BREVO_*`, `APP_PUBLIC_URL`, `EMAIL_VERIFICATION_TOKEN_LIFETIME_MINUTES`,
`FIREBASE_CREDENTIALS_PATH`, and the `VITE_*` frontend build values. Keep real
values in local environment/secrets files only.

## Docker and deployment

The production topology is:

```text
Internet -> frontend/Nginx -> api:8080 -> postgres:5432
```

`docker-compose.yml` defines:

- `postgres`: PostgreSQL 17 with the named `postgres_data` volume and a
  localhost-only host binding on port 5432.
- `api`: the multi-stage `cruise3d/Dockerfile` image listening on container port
  8080, with host port 5001 still published for local development.
- `frontend`: the Vite production build served by Nginx on host port 80.
  Nginx proxies `/api/` to `http://api:8080/api/`.
- `frontend-dev`: an optional `dev` profile running Vite on port 5173 and
  calling the API through `http://localhost:5001/api`.

The frontend and API use the `backend` bridge network with static addresses
`172.30.0.2` and `172.30.0.3`. The API mounts `./secrets` read-only for the
Firebase Admin SDK file.

From the repository root:

```powershell
docker compose up --build
docker compose --profile dev up
docker compose config
docker compose down
```

The API container waits for PostgreSQL health before starting. The API applies
pending EF migrations during startup, so inspect API logs if the container
exits during initialization.

## Developer workflow

1. Clone the repository.
2. Create the root `.env` from `.env.example` and provide local values without
   committing them.
3. Start the database/API/frontend with `docker compose up --build`, or run
   PostgreSQL separately and start the API from `cruise3d/`.
4. Apply migrations with `dotnet ef database update` when using a local API
   outside the Compose startup migration.
5. Seed a local administrator with `scripts/seed-admin.ps1` if admin flows are
   needed.
6. Open Swagger in Development at `http://localhost:5000/swagger` when running
   the API with its local launch settings, or call the API through the Nginx
   frontend in Compose.
7. Start the frontend with `npm install` and `npm run dev` from
   `cruise3d-clientside`, or use the `frontend-dev` Compose profile.
8. Use browser Network tools, Swagger, API logs, and PostgreSQL logs to trace a
   failing request.

## Where do I fix this?

| Problem | First place to check |
| --- | --- |
| Login or registration | `AuthController`, `AuthService`, `UserRepository` |
| Email verification/reset | `AuthService`, token service/repository, `BrevoEmailService` |
| Database or schema | `AppDbContext`, entity configuration, repository, `Migrations/` |
| Product API | `ProductsController`, `ProductService`, `ProductRepository` |
| Cart behavior | `CartController`, `CartService`, `CartRepository` |
| Payment | `PaymentsController`, `PaymentService`, `PaymentRepository`, Razorpay configuration |
| Order creation/status | `OrdersController`, `OrderService`, `OrderRepository` |
| Address/default address | `AddressController`, `AddressRepository`, address configuration/migrations |
| Review behavior | `ReviewsController`, `ReviewService`, `ReviewRepository` |
| Offers | `OffersController`, `OfferService`, `OfferRepository` |
| Contact messages | `ContactController`, `ContactMessageService`, `ContactMessageRepository` |
| Notifications | `NotificationService`, `NotificationTokensController`, token repository/sweeper |
| Authorization | Controller attributes, `JwtHelper`, JWT configuration, service ownership checks |
| Global 500 | `ExceptionMiddleware` and application logs |
| Rate limiting | `Program.cs`, `appsettings.json`, Nginx forwarded headers |
| Frontend API request | Frontend feature API module, `src/api/axiosClient.ts`, browser Network tab |

## Known limitations and unfinished areas

- `NewsletterController` returns placeholder responses and does not implement
  newsletter persistence or delivery.
- `TestimonialsController` exposes placeholder in-memory-style responses and
  does not persist testimonials.
- Swagger is enabled only when the API environment is Development.
- The application relies on console/ASP.NET logging; there is no centralized
  error tracking service configured in this repository.
- The API host port 5001 remains published because the local frontend-dev
  profile uses it, even though production Nginx uses the internal `api:8080`
  address.
