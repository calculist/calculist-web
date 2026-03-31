require_relative 'boot'

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
require "sprockets/railtie"
# Skip unused frameworks:
# require "action_cable/engine"
# require "active_storage/engine"
# require "action_text/engine"
# require "action_mailbox/engine"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Calculist
  class Application < Rails::Application
    config.load_defaults 7.0

    # Keep SHA1 for MessageEncryptor compatibility with existing signed data.
    # Avoids invalidating all existing cookies on upgrade.
    config.active_support.hash_digest_class = OpenSSL::Digest::SHA1
    config.active_support.key_generator_hash_digest_class = OpenSSL::Digest::SHA1

    # Corresponds to GitHub releases: https://github.com/calculist/calculist-web/releases
    config.calculist_version = 'v0.5.0'
  end
end
