# CRM Leads System

A lightweight CRM system for capturing portfolio leads and managing them in a private admin dashboard.

## Overview
- Backend: Django REST API with JWT auth, SQLite, and Gmail SMTP notifications
- Frontend: React + Tailwind admin dashboard with role-based admin tools
- Portfolio: Contact form posts directly to the CRM API

## Features
- Public lead intake endpoint for portfolio contact form
- Lead listing, status updates, detail view, and notes
- JWT authentication with refresh flow
- Role-based access (superuser vs staff)
- Admin tools for user management and password resets
- Audit log view and paging
- Email notifications on new leads

## Architecture
```
crm-backend/   Django REST API
crm-frontend/  React admin dashboard
```

## Requirements
- Python 3.12+
- Node.js 18+
- Gmail App Password (for SMTP email notifications)

## Backend Setup
1) Create and activate a virtual environment
2) Install dependencies
3) Configure environment variables
4) Run migrations and create a superuser

```bash
cd crm-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Backend Environment Variables
Set these in [crm-backend/.env](crm-backend/.env):
- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `CORS_ALLOWED_ORIGINS`

## Frontend Setup
```bash
cd crm-frontend
npm install
cp .env.example .env
npm run dev
```

### Frontend Environment Variables
Set in [crm-frontend/.env](crm-frontend/.env):
- `VITE_API_BASE_URL` (example: `http://localhost:8000`)

## API Endpoints
Base URL: `http://localhost:8000/api`

### Auth
- `POST /auth/login/`
- `POST /auth/refresh/`
- `GET /auth/me/`

### Leads
- `POST /leads/` (public)
- `GET /leads/` (auth)
- `GET /leads/:id/` (auth)
- `PATCH /leads/:id/` (auth, status updates)
- `DELETE /leads/:id/` (auth)
- `POST /leads/:id/add_note/` (auth)

### Admin Tools
- `POST /auth/create-admin/` (superuser only)
- `GET /admin/users/` (staff+)
- `PATCH /admin/users/:id/set-active/` (superuser only)
- `POST /admin/users/:id/reset-password/` (superuser only)
- `GET /admin/audit/` (superuser only, supports `limit` and `offset`)

## Admin Roles
- **Superuser**: can create staff, manage users, reset passwords, and view logs
- **Staff**: can access the dashboard and lead tools

## Logs
Audit logs are stored at [crm-backend/logs/crm.log](crm-backend/logs/crm.log) and can be viewed in the dashboard logs page.

## Portfolio Integration
Set `VITE_CRM_API_URL` in the portfolio repo to point to the backend:
```
VITE_CRM_API_URL=http://localhost:8000
```

## Troubleshooting
- If you see CORS errors, confirm `CORS_ALLOWED_ORIGINS` includes the exact frontend and portfolio origins.
- If tokens expire, refresh occurs automatically; logout/login if needed.
- If logs do not appear, restart the backend after changing logging config.

## License
MIT
