#!/usr/bin/env bash
set -euo pipefail

echo "==> SweetNest: preparando contenedor"

# En Render solo se inyecta DATABASE_URL; extraer host y puerto para la espera
if [ -n "${DATABASE_URL:-}" ]; then
  export DATABASE_HOST="${DATABASE_HOST:-$(ruby -r uri -e "puts URI.parse(ENV['DATABASE_URL']).host")}"
  export DATABASE_PORT="${DATABASE_PORT:-$(ruby -r uri -e "u=URI.parse(ENV['DATABASE_URL']); puts u.port || 5432")}"
fi

# Esperar a Postgres (development y production)
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
  echo "==> ERROR: No se pudo conectar a Postgres en 60s. Revisa DATABASE_URL / red."
  exit 1
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

