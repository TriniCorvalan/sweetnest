#!/usr/bin/env bash
set -euo pipefail

echo "==> SweetNest: preparando contenedor"

if [ "${RAILS_ENV:-development}" != "production" ]; then
  # Esperar a Postgres
  echo "==> Esperando Postgres en ${DATABASE_HOST:-db}:${DATABASE_PORT:-5432}..."
  for i in {1..60}; do
    if ruby -r socket -e "TCPSocket.new(ENV.fetch('DATABASE_HOST','db'), Integer(ENV.fetch('DATABASE_PORT','5432'))).close" 2>/dev/null; then
      echo "==> Postgres listo"
      break
    fi
    sleep 1
  done

  # Migraciones + seeds (idempotente)
  echo "==> Ejecutando migraciones"
  bundle exec rails db:migrate
  echo "==> Cargando seeds"
  bundle exec rails db:seed
fi

exec "$@"

