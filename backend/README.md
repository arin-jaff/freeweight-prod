# Freeweight Backend

FastAPI backend for the Freeweight strength training platform.

## Setup

1. Copy `.env.example` to `.env` and configure your database connection:
```bash
cp .env.example .env
```

2. Install dependencies with uv:
```bash
uv sync
```

3. Create the database (PostgreSQL):
```bash
createdb freeweight
```

4. Run migrations:
```bash
uv run alembic upgrade head
```

## Development

Start the development server:
```bash
uv run uvicorn app.main:app --reload
```

API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

## Database Migrations

Create a new migration:
```bash
uv run alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
uv run alembic upgrade head
```

Rollback one migration:
```bash
uv run alembic downgrade -1
```

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app entry point
│   ├── config.py        # Settings and environment variables
│   ├── database.py      # Database connection and session
│   ├── models.py        # SQLAlchemy models
│   └── auth.py          # Authentication utilities
├── alembic/             # Database migrations
├── .env                 # Environment variables (not committed)
├── .env.example         # Example environment file
└── pyproject.toml       # Python dependencies
```
