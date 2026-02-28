#!/bin/sh
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE authdb;
    CREATE DATABASE user_db;
    CREATE DATABASE coursedb;
    CREATE DATABASE orderdb;
    CREATE DATABASE paymentdb;
    CREATE DATABASE enrollmentdb;
    CREATE DATABASE notificationdb;
EOSQL
