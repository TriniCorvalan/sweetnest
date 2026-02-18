# frozen_string_literal: true

ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

# Rails 6.0 / ActiveSupport 6.0 en Ruby 2.6 puede cargar módulos que refieren a
# `Logger::Severity` antes de requerir "logger". Cargamos Logger lo más temprano posible.
require "logger"

require "bundler/setup" # Set up gems listed in the Gemfile.
require "bootsnap/setup" if ENV["DISABLE_BOOTSNAP"] != "1" # Speed up boot time by caching expensive operations.
