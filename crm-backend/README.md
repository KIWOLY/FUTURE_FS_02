# CRM Backend

Django REST API for lead intake and admin management.

## Stack
- Django
- Django REST Framework
- Simple JWT
- SQLite
- Gmail SMTP for notifications

## Setup
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Environment Variables
See [crm-backend/.env.example](.env.example) for required values.

## API
Base URL: `http://localhost:8000/api`

- `POST /leads/` (public)
- `GET /leads/` (auth)
- `GET /leads/:id/` (auth)
- `PATCH /leads/:id/` (auth)
- `DELETE /leads/:id/` (auth)
- `POST /leads/:id/add_note/` (auth)
- `POST /auth/login/`
- `POST /auth/refresh/`
- `GET /auth/me/`
- `POST /auth/create-admin/` (superuser only)
- `GET /admin/users/` (staff+)
- `PATCH /admin/users/:id/set-active/` (superuser only)
- `POST /admin/users/:id/reset-password/` (superuser only)
- `GET /admin/audit/` (superuser only)

## Logs
Audit logs are written to [crm-backend/logs/crm.log](logs/crm.log).
