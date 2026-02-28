# Employee CRUD Workspace

This workspace has only two apps:

- `frontend/` → Angular UI
- `backend/` → Express + Node API

## Active Folder Structure

- `frontend/src/app/employees` → list, create/edit, view components + highlight pipe
- `frontend/src/app/services` → API calls
- `frontend/src/app/models` → interfaces
- `frontend/src/app/guards` → unsaved changes guard
- `backend/server.js` → API entry
- `backend/routes/employee.routes.js` → route mapping
- `backend/controllers/employee.controller.js` → CRUD logic
- `backend/db.json` → data file

## Install

Install dependencies once:

```bash
cd frontend && npm install
cd ../backend && npm install
```

## Run

Start backend:

```bash
cd backend
npm start
```

Start frontend:

```bash
cd frontend
npm start
```

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- Employees API: `http://localhost:3000/employees`
