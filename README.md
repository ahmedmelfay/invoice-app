# Invoice App

A responsive invoice manager implemented from the supplied Figma (Frontend Mentor) designs with Next.js 16, React 19, TypeScript, Ant Design, and Zustand.

## Run locally

- Install dependencies: `pnpm install`
- Start development: `pnpm dev`
- Open http://localhost:3000
- Production build: `pnpm build`, then `pnpm start`

## Features

- Responsive invoice list and detail routes, including mobile action bars.
- Create invoices, save incomplete drafts, edit, and confirm deletion.
- Validate required fields, email addresses, quantities, and prices.
- Calculate payment deadlines and line totals; promote completed drafts to pending.
- Mark pending invoices paid and filter by multiple statuses.
- Light and dark themes; invoice and theme persistence across refreshes.
- Keyboard navigation, labelled fields, validation announcements, and modal focus handling.

## Architecture

`app/` owns routing and the server-rendered root layout. `/invoices/[id]` provides direct invoice links and handles missing records.

`features/invoices/components/` contains the application shell, invoice list, detail screen, and shared create/edit form. Client boundaries are limited to interactive components. Existing button and status components under `app/_components/` provide reusable presentation.

`features/invoices/lib/invoice.ts` contains pure invoice rules: ID generation, validation, dates, totals, and formatting. `features/invoices/store.ts` owns state transitions and versioned persistence through Zustand. Browser hydration is explicit so saved records are restored before detail lookup or creation.

Ant Design `Form`, `Form.Item`, and `Form.List` own field state, rules, validation messages, and dynamic line items. `Input`, `InputNumber`, `DatePicker`, and `Select` provide the entry controls; incomplete drafts deliberately bypass validation. `Table`, `Tag`, `Empty`, `Avatar`, and `Button` supply shared presentation. `ConfigProvider` defines light/dark tokens and component defaults, with scoped overrides for drawer fields and button variants.

`app/globals.css` contains the remaining Figma layout, responsive behavior, and document-specific styles; native field, button-color, and table rules have been removed. Design assets live in `public/assets/`; the private Figma source remains ignored.

## Validation

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm test:e2e:types`
- `pnpm test:e2e`
- `pnpm build`

Tests cover date boundaries, monetary rounding, validation, and ID generation. Browser checks cover draft creation, refresh persistence, draft editing, status transitions, confirmation cancellation/deletion, filtering, and mobile light/dark presentation.

## Cypress end-to-end tests

`pnpm test:e2e` starts a dedicated development server at `http://localhost:3100`, waits for it to become ready, runs Cypress headlessly in Chrome, and stops the server afterward. Install Chrome before running these scripts. The test server uses `.next-e2e` so it can run alongside the regular app on port 3000.

`pnpm test:e2e:production` builds the app in the same isolated directory and runs the suite against a production server. Use this for release checks or CI.

For interactive debugging, start `pnpm dev --port 3100` in one terminal, then run `pnpm cypress:open` in another. `pnpm cypress:run` runs against an already running server. Override the base URL when needed, for example `pnpm cypress:run --config baseUrl=http://localhost:3000`.

The 19 tests in three specs under `cypress/e2e/` cover:

- List/detail navigation, combined status filters, empty states, missing records, marking paid, and deletion with cancellation and confirmation.
- Required-field focus, invalid email and numeric values, incomplete drafts, generated IDs, invoice creation, line item changes, totals/due dates, cancelled edits, draft promotion, and editing paid invoices.
- Mobile (375px), tablet (768px), and desktop (1440px) layouts, horizontal overflow, visible actions, form bounds, and theme persistence.

Each test starts with independent fixture records installed before browser hydration. Cypress runs in its own browser, and storage is cleared between tests, preserving the invoices in your normal browser. Tests use retryable assertions instead of fixed delays and do not suppress application errors. Failure screenshots are saved under `cypress/screenshots/` and ignored by Git.

The Cypress install script is explicitly approved in `pnpm-workspace.yaml`. If the package is installed but its browser binary is missing, run `pnpm exec cypress install`.

## Storage

Althouh backend API integration is possible. This is a frontend application. Invoices are saved in this browser under `invoice-app-v1` in localStorage and seeded from `app/_data.json` on first use. Clearing browser storage resets them. Data is not synchronized between devices, and Save & Send sets an invoice to pending without sending an email.
