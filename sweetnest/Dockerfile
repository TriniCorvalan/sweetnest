FROM ruby:2.6.10-bullseye

ENV LANG=C.UTF-8 \
  BUNDLE_JOBS=4 \
  BUNDLE_RETRY=3

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  build-essential \
  bash \
  libpq-dev \
  curl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Gems first (layer cache)
COPY Gemfile ./
RUN gem install bundler -v 2.4.22 && bundle install

# App
COPY . .

RUN chmod +x ./docker/entrypoint.sh

# Precompilar assets para producción (evita 500 por assets faltantes)
RUN RAILS_ENV=production SECRET_KEY_BASE=precompile-dummy bundle exec rails assets:precompile

EXPOSE 3000

ENTRYPOINT ["bash", "./docker/entrypoint.sh"]
# PORT lo inyecta Render en producción; en local docker-compose usa 3000 por defecto
CMD ["sh", "-c", "bundle exec rails server -b 0.0.0.0 -p ${PORT:-3000}"]

