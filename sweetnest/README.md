# SweetNest

Aplicación web para armar cajas de regalo personalizadas: el usuario elige niveles, coloca dulces en cada nivel y finaliza con una orden y dirección de envío. Incluye panel de administración para pedidos y catálogo de dulces.

## Requisitos

- **Ruby** 2.6.10
- **PostgreSQL** (recomendado 15 para coincidir con Docker)
- **Bundler** 2.4.22 (para instalar dependencias)
- **Node/Yarn** no son obligatorios; los assets usan Sprockets/SCSS y Stimulus (vía importmaps o asset pipeline según configuración)

## Dependencias del sistema

- `build-essential` (o equivalente) para compilar gemas nativas
- `libpq-dev` para el adaptador PostgreSQL

## Configuración

### Variables de entorno

La aplicación usa variables de entorno para base de datos y opciones de negocio. Por defecto, `config/database.yml` espera:

| Variable | Uso | Valor por defecto (desarrollo) |
|----------|-----|--------------------------------|
| `DATABASE_HOST` | Host de PostgreSQL | `db` (Docker) |
| `DATABASE_PORT` | Puerto | `5432` |
| `DATABASE_USERNAME` | Usuario | `sweetnest` |
| `DATABASE_PASSWORD` | Contraseña | `sweetnest` |
| `DATABASE_NAME` | Nombre de la base | `sweetnest_development` / `sweetnest_test` / `sweetnest_production` |

Opcionales (transferencias, admin, correo):

- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — acceso HTTP Basic al área `/admin`
- `MAIL_FROM` — remitente de correos (ej. `no-reply@sweetnest.cl`)
- `TRANSFER_ORDER_EXPIRATION_HOURS` — horas para pagar por transferencia (ej. `24`)
- `TRANSFER_BANK_NAME`, `TRANSFER_ACCOUNT_NAME`, `TRANSFER_ACCOUNT_TYPE`, `TRANSFER_ACCOUNT_NUMBER`, `TRANSFER_RUT`, `TRANSFER_EMAIL` — datos mostrados en instrucciones de pago

En producción define también `SECRET_KEY_BASE` y, si usas Docker, los valores de base de datos adecuados.

### Base de datos

Crear la base, cargar el esquema y opcionalmente los seeds:

```bash
rails db:create
rails db:migrate
rails db:seed   # opcional: catálogo de dulces de ejemplo
```

Solo cargar el esquema sin migraciones (útil en CI o réplicas):

```bash
rails db:schema:load
```

## Instalación y ejecución

### Con Docker Compose (recomendado)

En la raíz del monorepo (donde está `docker-compose.yml`):

```bash
docker-compose up --build
```

- **Postgres**: puerto `5432`
- **Backend Rails**: puerto `3000`
- **Frontend (nginx)**: puerto `8080` (proxy al backend)

El entrypoint del backend espera a Postgres, ejecuta `db:migrate` y `db:seed` en desarrollo, y luego arranca el servidor. Para desarrollo con código montado en `./sweetnest`, los cambios se reflejan reiniciando el servicio `backend` o recargando Puma.

### Sin Docker (local)

1. Clonar el repo y entrar en la carpeta de la app (ej. `sweetnest/`).
2. Tener PostgreSQL corriendo y creada la base (o usar `rails db:create`).
3. Instalar dependencias y preparar la base:

```bash
bundle install
rails db:create db:migrate db:seed
```

4. Arrancar el servidor:

```bash
bundle exec rails server
```

Para que coincida con el entorno Docker (host `db`), en local puedes exportar por ejemplo:

```bash
export DATABASE_HOST=localhost
bundle exec rails server
```

La app quedará en `http://localhost:3000`. La ruta raíz es el armado de la caja de regalo; `/admin` es el panel de administración (protegido con HTTP Basic si están definidos `ADMIN_USERNAME` y `ADMIN_PASSWORD`).

## Estructura principal

- **Modelos**: `GiftBox`, `BoxLevel`, `Candy`, `WallCandy`, `Order`, `Address`
- **Flujo público**: raíz → wizard de caja (`GiftBoxes#new`), luego creación de `Order` con dirección (incluye campos Chile: RUT, región, comuna, etc.).
- **API pública**: `Candies#index`, `Orders#create`.
- **Admin**: `Admin::Orders` (listar, ver, actualizar), `Admin::Candies` (CRUD sin show).

## Tests

El proyecto no incluye por ahora una suite de tests configurada (RSpec/Minitest). Para añadir pruebas:

- **Minitest**: ya está en el stack de Rails; se pueden agregar tests en `test/` y ejecutar con `rails test`.
- **RSpec**: habría que añadir la gema y configurar `spec/` y luego `bundle exec rspec`.

## Servicios

- **Servidor web**: Puma.
- **Base de datos**: PostgreSQL; no se usa Redis ni colas en la configuración actual.
- **Correo**: en desarrollo se puede usar `letter_opener` (gem en el Gemfile) para abrir los correos en el navegador.

## Despliegue

- Asegurar `SECRET_KEY_BASE` y variables de base de datos y, si aplica, de transferencias y admin.
- En producción no ejecutar `db:seed` en el entrypoint; usar migraciones y, si hace falta, seeds controlados o tareas custom.
- Si se usa el mismo `docker-compose`, el servicio `backend` puede desplegarse con `RAILS_ENV=production` y las variables adecuadas; considerar servir assets precompilados y un proxy/SSL delante de nginx o del backend.

---

Para más detalle sobre rutas y controladores, revisar `config/routes.rb` y los controladores en `app/controllers/` y `app/controllers/admin/`.
