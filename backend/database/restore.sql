-- Manual restore script for Slipknot merch database
\! psql -h "$DATABASE_HOST" -p "${DATABASE_PORT:-5432}" -U "$DATABASE_USER" -d "$DATABASE_NAME" -f backup.sql
