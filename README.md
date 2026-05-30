# SS-App

## Overview

SS-App is the main customer-facing frontend application for the SamStore e-commerce platform. Built with Next.js 16 and React 19, it serves as the storefront, admin dashboard, and seller portal.

The application interacts with various downstream microservices via the `SS-APIGateway` to provide features like authentication, product catalog browsing, cart management, and order processing, providing a unified and responsive user experience.

## Features

- **Storefront & Catalog**: Browse products, view categories, and search the catalog.
- **User Authentication & Authorization**: Registration, login, password reset, MFA, and role-based permissions (JWT integration).
- **Shopping Cart & Checkout**: Manage cart items and process checkouts.
- **User Account Management**: User profile settings and order history.
- **Admin Dashboard**: Catalog management, user role assignments, system logs, and security configuration.
- **Seller Portal**: Tools for sellers to manage products and track orders.
- **Theming**: Integrated Dark/Light mode support.

## Tech Stack

| Category   | Technology                                      |
| ---------- | ----------------------------------------------- |
| Frontend   | Next.js 16, React 19, TypeScript                |
| Styling    | Tailwind CSS 4, Radix UI, Shadcn, Framer Motion |
| State Mgmt | Zustand (client), React Query (server)          |
| Forms      | React Hook Form, Zod                            |
| Utilities  | Axios, Pino (Logging)                           |

## Project Structure

```text
SS-App/
├── public/
│   └── images/               # Static assets and images
└── src/
    ├── app/                  # Next.js App Router pages and layouts
    ├── assets/               # Local UI assets
    ├── components/           # Reusable UI components (auth, admin, layout)
    ├── config/               # Application configuration constants
    ├── hooks/                # Custom React hooks
    ├── lib/                  # Utilities (logger, api-client, session)
    ├── services/             # API integration and service calls
    ├── store/                # Zustand global state stores
    └── types/                # TypeScript type definitions
```

## Requirements

- Node.js v20+
- NPM or Yarn

## Installation

```bash
git clone <repository>
cd SamStore/SS-App
```

Install dependencies:

```bash
npm install
```

## Configuration

Daftar environment variable yang ditemukan:

```env
API_BASE_URL=             # Server-side API base URL targeting the backend Gateway
NEXT_PUBLIC_API_BASE_URL= # Client-side API base URL targeting the backend Gateway
LOG_LEVEL=                # Configures the application log level (e.g., info, debug)
NODE_ENV=                 # Node environment mode (development/production)
```

## Running Locally

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Testing

```bash
npm run lint
```

## API Documentation

Not identified from source code. (This is a frontend client).

## Database

Not identified from source code. (Uses backend microservices for data persistence).

## Deployment

- **Next.js Production Start**: Build the Next.js app and run `npm run start`.
- **Containerization**: Deployable via Docker (Dockerfile not explicitly present in the root but common Next.js build patterns apply).

## Architecture Notes

- **Client/Server Rendering**: Uses Next.js App Router for optimized Server Components and Client Components.
- **Modular Structure**: Strict separation of concerns between UI components (`components/`), API integrations (`services/`), and state (`store/`).

## Known Issues

Not identified from source code.

## Future Improvements

- Add end-to-end (E2E) testing suite with Cypress or Playwright.

## License

```text
License information not specified.
```
