-- Manual backup script for Slipknot merch database
\! pg_dump -h "$DATABASE_HOST" -p "${DATABASE_PORT:-5432}" -U "$DATABASE_USER" "$DATABASE_NAME" > backup.sql
