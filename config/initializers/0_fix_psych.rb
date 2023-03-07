# Ruby 3.1 includes a breaking update to Psych 4.
# Undo the breakage, as Mastodon doesn't load untrusted YAML files.
# https://stackoverflow.com/a/71192990

module YAML
  class << self
    alias_method :load, :unsafe_load if YAML.respond_to? :unsafe_load
  end
end
