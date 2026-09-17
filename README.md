# Cruise3D

Cruise3D is an e-commerce application for browsing, customizing, and
purchasing 3D-printed products.

```text
Cruise3D
├── cruise3d-clientside  React + TypeScript + Vite frontend
├── cruise3d-api         ASP.NET Core 10 Web API
└── PostgreSQL            Application database
```

Production request flow:

```text
Internet -> Nginx/frontend container -> API container -> PostgreSQL
```

## Quick start

1. Copy `.env.example` to `.env` and provide local values. Do not commit
   secrets or Firebase service-account files.
2. Start the complete Docker stack:

   ```powershell
   docker compose up --build
   ```

3. Open the frontend on port 80.
4. For frontend-only development:

   ```powershell
   cd cruise3d-clientside
   npm install
   npm run dev
   ```

5. For backend setup, migrations, API tracing, and deployment details, read
   [`cruise3d-api/README.md`](cruise3d-api/README.md).

## Developer documentation

- [Backend guide](cruise3d-api/README.md): architecture, database, auth,
  payments, integrations, middleware, deployment, and troubleshooting.
- [Frontend guide](cruise3d-clientside/README.md): React structure, routing,
  API communication, checkout, notifications, build, and debugging.
- [API reference](cruise3d-api/API_DOCUMENTATION.md): endpoint payloads and
  response details.

The backend applies pending EF Core migrations during startup. The API and
frontend READMEs document the local commands and current limitations.
