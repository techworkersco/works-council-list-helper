#!/bin/sh

set -e

# Perform all actions as $POSTGRES_USER
export PGUSER="$POSTGRES_USER"

# Load PostGIS into both template_database and $POSTGRES_DB
for DB in template1 "$POSTGRES_DB"; do
	echo "Loading extensions into $DB"
	"${psql[@]}" --dbname="$DB" --password="$POSTGRES_PASSWORD" <<-'EOSQL'
		CREATE EXTENSION IF NOT EXISTS citext;
EOSQL
done
