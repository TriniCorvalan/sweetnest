#!/usr/bin/env bash
set -euo pipefail

echo "==> SweetNest: preparando contenedor"

# Esperar a Postgres
# En producción (Render) usamos conexión real con Rails; TCP al puerto 5432 suele fallar en Render
if [ "${RAILS_ENV:-development}" = "production" ]; then
  echo "==> Esperando Postgres (conexión vía Rails)..."
  pg_ok=
  for i in {1..60}; do
    if bundle exec rails runner "ActiveRecord::Base.connection.execute('SELECT 1')" 2>/dev/null; then
      echo "==> Postgres listo"
      pg_ok=1
      break
    fi
    sleep 1
  done
  if [ -z "${pg_ok:-}" ]; then
    echo "==> ERROR: No se pudo conectar a Postgres en 60s. Revisa DATABASE_URL."
    exit 1
  fi
else
  # Development (docker-compose): espera por TCP a db:5432
  echo "==> Esperando Postgres en ${DATABASE_HOST:-db}:${DATABASE_PORT:-5432}..."
  pg_ok=
  for i in {1..60}; do
    if ruby -r socket -e "TCPSocket.new(ENV.fetch('DATABASE_HOST','db'), Integer(ENV.fetch('DATABASE_PORT','5432'))).close" 2>/dev/null; then
      echo "==> Postgres listo"
      pg_ok=1
      break
    fi
    sleep 1
  done
  if [ -z "${pg_ok:-}" ]; then
    echo "==> ERROR: No se pudo conectar a Postgres en 60s."
    exit 1
  fi
fi

# Migraciones en todos los entornos
echo "==> Ejecutando migraciones"
if ! bundle exec rails db:migrate; then
  exit 1
fi

# Seeds solo en development (en production no se ejecutan para no sobrescribir datos)
if [ "${RAILS_ENV:-development}" != "production" ]; then
  echo "==> Cargando seeds"
  bundle exec rails db:seed
fi

# Limpiar PID viejo (común si tmp/ está montado desde host)
mkdir -p tmp/pids
if [ -f tmp/pids/server.pid ]; then
  rm -f tmp/pids/server.pid
fi
exec "$@"

