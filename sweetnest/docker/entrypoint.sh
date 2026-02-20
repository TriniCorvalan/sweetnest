#!/usr/bin/env bash
set -euo pipefail

echo "==> SweetNest: preparando contenedor"

# Esperar a Postgres (development y production)
echo "==> Esperando Postgres en ${DATABASE_HOST:-db}:${DATABASE_PORT:-5432}..."
for i in {1..60}; do
  if ruby -r socket -e "TCPSocket.new(ENV.fetch('DATABASE_HOST','db'), Integer(ENV.fetch('DATABASE_PORT','5432'))).close" 2>/dev/null; then
    echo "==> Postgres listo"
    break
  fi
  sleep 1
done

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

