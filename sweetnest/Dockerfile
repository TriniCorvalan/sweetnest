FROM ruby:2.6.10-buster

ENV LANG=C.UTF-8 \
  BUNDLE_JOBS=4 \
  BUNDLE_RETRY=3

RUN apt-get update -qq && \
  apt-get install -y --no-install-recommends \
  build-essential \
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

EXPOSE 3000

ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3000"]

