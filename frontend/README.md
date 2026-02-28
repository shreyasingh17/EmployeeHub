# Employee CRUD Frontend

Angular frontend application for the Employee CRUD workspace.

## 🚀 Live Demo

👉 **Frontend + Backend App**  
🔗 https://employeehub-olfs.onrender.com

## Quick Start

Install dependencies:

```bash
npm install
```

Run frontend only:

```bash
npm start
```

App URL: `http://localhost:4200`
Backend API URL: `http://localhost:3000/employees`

## Implemented Features

- Employee CRUD: create, list, edit, view, delete
- Bulk delete with confirmation
- Search with 300ms debounce
- Search highlight in name/email/role
- Filter by status, department, date range
- Single-column sorting by clicking headers
- Pagination with page-size selector
- Column show/hide (salary hidden by default)
- Reactive form validation with inline errors + top error summary
- Snackbar success/error messages
- Retry action for transient list load errors
- Unsaved changes navigation guard
- Empty state for no data

## Validation Rules

- `fullName`: 2–80, letters/spaces/hyphen
- `email`: corporate domain `@example.com`
- `phone`: E.164 or local
- `department`, `role`, `status`, `location`: required
- `dateJoined`: cannot be in the future
- `salary`: non-negative

## Scripts

- `npm start` → starts Angular
- `npm run build` → production build
- `npm run test -- --watch=false` → unit tests
