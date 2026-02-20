#!/usr/bin/env bash
set -euo pipefail

echo "==> SweetNest: preparando contenedor"

# En Render el Blueprint inyecta la URL interna (host corto tipo dpg-xxx-a); en Docker ese host no resuelve.
# Reescribir DATABASE_URL al hostname externo (dpg-xxx-a.REGION-postgres.render.com) para que resuelva por DNS público.
if [ "${RAILS_ENV:-development}" = "production" ] && [ -n "${DATABASE_URL:-}" ]; then
  DATABASE_URL="$(ruby -r uri -e 'u=URI.parse(ENV["DATABASE_URL"]); if u.host && !u.host.include?("."); r=ENV.fetch("RENDER_REGION","oregon"); u.host=u.host+"."+r+"-postgres.render.com"; end; puts u.to_s')"
  export DATABASE_URL
fi

# Esperar a Postgres
# En producción (Render) usamos conexión real con Rails; TCP al puerto 5432 suele fallar en Render
if [ "${RAILS_ENV:-development}" = "production" ]; then
  echo "==> Esperando Postgres (conexión vía Rails)..."
  pg_ok=
  for i in {1..90}; do
    if bundle exec rails runner "ActiveRecord::Base.connection.execute('SELECT 1')" 2>/dev/null; then
      echo "==> Postgres listo"
      pg_ok=1
      break
    fi
    sleep 1
  done
  if [ -z "${pg_ok:-}" ]; then
    echo "==> ERROR: No se pudo conectar a Postgres en 90s. Último error:"
    bundle exec rails runner "ActiveRecord::Base.connection.execute('SELECT 1')" || true
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

